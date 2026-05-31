import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Copy,
  History,
  Heart,
  MessageSquare,
  MessageSquarePlus,
  Search,
  Tag,
  Trash2,
  User,
  X,
  Wind,
  icons
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  Card,
  ChatMessage,
  KnowledgeBase,
  OverlayPayload,
  UserProfile
} from "../../../shared/types";
import { ApiClient } from "../../body/external/apiClient";
import { BootstrapAppReactor } from "../../body/reactors/bootstrapAppReactor";
import { LoginReactor } from "../../body/reactors/loginReactor";

type SaveSection = "favorites" | "tags" | "notes";
type SaveStatus = "idle" | "saving" | "error";
type ViewState = {
  cardId: string | null;
  parentId: string | null;
  trail: string[];
};
type WorkspaceTab = "knowledge" | "chat";

type MarkdownNode =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] };

const apiClient = new ApiClient();

function tagValue(tags: string[], prefix: string): string | null {
  const hit = tags.find((tag) => tag.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function iconNameForCard(card: Card): string | null {
  return tagValue(card.tags, "icon_");
}

function iconForCard(card: Card) {
  const iconTag = tagValue(card.tags, "icon_");
  if (!iconTag) {
    return BookOpen;
  }

  const iconName = iconTag
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  const candidate = (icons as Record<string, LucideIcon | undefined>)[iconName];
  return candidate ?? BookOpen;
}

function colorNameForCard(card: Card): string {
  return tagValue(card.tags, "color_") ?? "neutral";
}

function normalizeTag(tag: string): string {
  return tag.trim();
}

function parseTrail(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function dedupeTrail(ids: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const id of ids) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    result.push(id);
  }

  return result;
}

function buildNextTrail(currentTrail: string[], cardId: string): string[] {
  const existingIndex = currentTrail.indexOf(cardId);
  if (existingIndex >= 0) {
    return currentTrail.slice(0, existingIndex + 1);
  }

  return dedupeTrail([...currentTrail, cardId]);
}

function sameView(left: ViewState, right: ViewState): boolean {
  return (
    left.cardId === right.cardId &&
    left.parentId === right.parentId &&
    left.trail.join(",") === right.trail.join(",")
  );
}

function chatStorageKey(userId: string): string {
  return `jbsapp.chat.${userId}`;
}

function parseStoredChat(value: string | null): ChatMessage[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry): entry is ChatMessage => {
      if (!entry || typeof entry !== "object") {
        return false;
      }

      const message = entry as Partial<ChatMessage>;
      return (
        typeof message.id === "string" &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        typeof message.createdAt === "string"
      );
    });
  } catch {
    return [];
  }
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern =
    /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|_([^_]+)_|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={`${match.index}-link`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      nodes.push(<strong key={`${match.index}-strong`}>{match[4]}</strong>);
    } else if (match[5]) {
      nodes.push(<u key={`${match.index}-underline`}>{match[5]}</u>);
    } else if (match[6]) {
      nodes.push(<em key={`${match.index}-italic1`}>{match[6]}</em>);
    } else if (match[7]) {
      nodes.push(<em key={`${match.index}-italic2`}>{match[7]}</em>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function parseMarkdown(content: string): MarkdownNode[] {
  const lines = content.split(/\r?\n/);
  const nodes: MarkdownNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index]!.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      nodes.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2]
      });
      index += 1;
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      const items: string[] = [];
      while (index < lines.length) {
        const candidate = lines[index]!.trim();
        const candidateMatch = candidate.match(/^[-*]\s+(.+)$/);
        if (!candidateMatch) {
          break;
        }
        items.push(candidateMatch[1]);
        index += 1;
      }
      nodes.push({ type: "unordered-list", items });
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      const items: string[] = [];
      while (index < lines.length) {
        const candidate = lines[index]!.trim();
        const candidateMatch = candidate.match(/^\d+\.\s+(.+)$/);
        if (!candidateMatch) {
          break;
        }
        items.push(candidateMatch[1]);
        index += 1;
      }
      nodes.push({ type: "ordered-list", items });
      continue;
    }

    const paragraphLines = [trimmed];
    index += 1;
    while (index < lines.length) {
      const candidate = lines[index]!.trim();
      if (
        !candidate ||
        /^(#{1,3})\s+/.test(candidate) ||
        /^[-*]\s+/.test(candidate) ||
        /^\d+\.\s+/.test(candidate)
      ) {
        break;
      }
      paragraphLines.push(candidate);
      index += 1;
    }

    nodes.push({
      type: "paragraph",
      text: paragraphLines.join(" ")
    });
  }

  return nodes;
}

function MarkdownMessage({ content }: { content: string }) {
  const nodes = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div className="markdown-copy">
      {nodes.map((node, index) => {
        if (node.type === "heading") {
          if (node.level === 1) {
            return <h1 key={index}>{renderInlineMarkdown(node.text)}</h1>;
          }
          if (node.level === 2) {
            return <h2 key={index}>{renderInlineMarkdown(node.text)}</h2>;
          }
          return <h3 key={index}>{renderInlineMarkdown(node.text)}</h3>;
        }

        if (node.type === "unordered-list") {
          return (
            <ul key={index}>
              {node.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        if (node.type === "ordered-list") {
          return (
            <ol key={index}>
              {node.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
              ))}
            </ol>
          );
        }

        return <p key={index}>{renderInlineMarkdown(node.text)}</p>;
      })}
    </div>
  );
}

function useRetryingBackgroundSave(overlay: OverlayPayload | null) {
  const [saveStatus, setSaveStatus] = useState<Record<SaveSection, SaveStatus>>({
    favorites: "idle",
    tags: "idle",
    notes: "idle"
  });
  const retryTimeouts = useRef<Record<SaveSection, number | null>>({
    favorites: null,
    tags: null,
    notes: null
  });

  useEffect(() => {
    return () => {
      for (const key of Object.keys(retryTimeouts.current) as SaveSection[]) {
        const timeout = retryTimeouts.current[key];
        if (timeout) {
          window.clearTimeout(timeout);
        }
      }
    };
  }, []);

  async function persist(section: SaveSection, currentOverlay: OverlayPayload) {
    setSaveStatus((value) => ({ ...value, [section]: "saving" }));

    try {
      if (section === "favorites") {
        await apiClient.saveFavorites(currentOverlay.favorites);
      }
      if (section === "tags") {
        await apiClient.saveTags(currentOverlay.tags);
      }
      if (section === "notes") {
        await apiClient.saveNotes(currentOverlay.notes);
      }
      setSaveStatus((value) => ({ ...value, [section]: "idle" }));
    } catch {
      setSaveStatus((value) => ({ ...value, [section]: "error" }));
      retryTimeouts.current[section] = window.setTimeout(() => {
        if (overlay) {
          void persist(section, overlay);
        }
      }, 3000);
    }
  }

  return { saveStatus, persist };
}

function LoginScreen({
  onLoggedIn
}: {
  onLoggedIn: (profile: UserProfile) => Promise<void>;
}) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"idle" | "requesting" | "verifying">(
    "idle"
  );

  async function requestOtp() {
    setSubmitting("requesting");
    setError(null);
    setStatusMessage(null);

    try {
      const reactor = new LoginReactor(apiClient);
      await reactor.requestOtp(email);
      setStep("otp");
      setStatusMessage("OTP sent. Check your email.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Requesting OTP failed."
      );
    } finally {
      setSubmitting("idle");
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting("verifying");
    setError(null);
    setStatusMessage(null);

    try {
      const reactor = new LoginReactor(apiClient);
      const { profile } = await reactor.process(email, otp);
      try {
        await onLoggedIn(profile);
      } catch (bootstrapError) {
        setError(
          bootstrapError instanceof Error
            ? `Login worked, but loading the study space failed: ${bootstrapError.message}`
            : "Login worked, but loading the study space failed."
        );
      }
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed."
      );
    } finally {
      setSubmitting("idle");
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-lockup">
          <p className="eyebrow">Just Breathe Study App</p>
          <h1>JBSapp</h1>
          <p className="claim">From novice to instructor in no time!</p>
        </div>

        {step === "email" ? (
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              void requestOtp();
            }}
          >
            <label>
              <span>Email</span>
              <input
                autoComplete="email"
                inputMode="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            {statusMessage ? <p className="form-status">{statusMessage}</p> : null}
            {error ? <p className="form-error">{error}</p> : null}

            <div className="auth-actions single">
              <button
                className="primary-button"
                disabled={submitting !== "idle"}
                type="submit"
              >
                {submitting === "requesting" ? "Sending OTP..." : "Login"}
              </button>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <label>
              <span>OTP</span>
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter your OTP"
                required
              />
            </label>

            <p className="form-status">Sending to: {email}</p>
            {statusMessage ? <p className="form-status">{statusMessage}</p> : null}
            {error ? <p className="form-error">{error}</p> : null}

            <div className="auth-actions">
              <button
                className="secondary-button"
                disabled={submitting !== "idle"}
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError(null);
                  setStatusMessage(null);
                }}
              >
                Back
              </button>
              <button
                className="primary-button"
                disabled={submitting !== "idle"}
                type="submit"
              >
                {submitting === "verifying" ? "Entering..." : "Enter JBSapp"}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

export function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<"loading" | "anon" | "ready">(
    "loading"
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [base, setBase] = useState<KnowledgeBase | null>(null);
  const [overlay, setOverlay] = useState<OverlayPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newTag, setNewTag] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceTab>("knowledge");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [backStack, setBackStack] = useState<ViewState[]>([]);
  const [forwardStack, setForwardStack] = useState<ViewState[]>([]);
  const noteSaveTimer = useRef<number | null>(null);
  const detailSectionRef = useRef<HTMLElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const { saveStatus, persist } = useRetryingBackgroundSave(overlay);

  async function loadProtectedState(currentProfile?: UserProfile) {
    const bootstrapReactor = new BootstrapAppReactor(apiClient);
    const bootstrapped = await bootstrapReactor.process();
    setBase(bootstrapped.base);
    setOverlay(bootstrapped.overlay.overlay);
    setProfile(currentProfile ?? bootstrapped.overlay.profile);
    setAuthState("ready");
  }

  useEffect(() => {
    void (async () => {
      try {
        const session = await apiClient.getSession();
        await loadProtectedState(session.profile);
      } catch {
        setAuthState("anon");
      }
    })();
  }, []);

  const currentCardId = searchParams.get("card");
  const currentParentId = searchParams.get("parent");
  const trailIds = dedupeTrail(parseTrail(searchParams.get("trail")));
  const currentView: ViewState = {
    cardId: currentCardId,
    parentId: currentParentId,
    trail: trailIds
  };

  const currentCard = currentCardId && base ? base.cards[currentCardId] : null;

  useEffect(() => {
    if (!currentCard || !overlay) {
      setDraftNote("");
      return;
    }
    setDraftNote(overlay.notes[currentCard.id] ?? "");
  }, [currentCard, overlay]);

  useEffect(() => {
    if (activeWorkspace !== "knowledge" || !currentCard || !detailSectionRef.current) {
      return;
    }

    detailSectionRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, [activeWorkspace, currentCardId]);

  useEffect(() => {
    if (profile) {
      setUsernameDraft(profile.username);
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) {
      setChatMessages([]);
      return;
    }

    setChatMessages(parseStoredChat(window.localStorage.getItem(chatStorageKey(profile.id))));
  }, [profile]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    window.localStorage.setItem(
      chatStorageKey(profile.id),
      JSON.stringify(chatMessages)
    );
  }, [chatMessages, profile]);

  useEffect(() => {
    if (activeWorkspace !== "chat") {
      return;
    }

    chatBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeWorkspace, chatMessages, isChatting]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!isUserMenuOpen) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (userMenuRef.current?.contains(target)) {
        return;
      }

      setIsUserMenuOpen(false);
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (search.trim() || activeTagFilters.length) {
      setIsSearchResultsOpen(true);
    }
  }, [activeTagFilters.length, search]);

  useEffect(() => {
    if (!overlay) {
      return;
    }

    const availableTags = new Set<string>();
    Object.values(overlay.tags).forEach((tags) => {
      tags.forEach((tag) => availableTags.add(tag));
    });

    setActiveTagFilters((current) => {
      const next = current.filter((tag) => availableTags.has(tag));
      return next.length === current.length ? current : next;
    });
  }, [overlay]);

  const favoriteCards = useMemo(() => {
    if (!base || !overlay) {
      return [];
    }
    return overlay.favorites
      .map((id) => base.cards[id])
      .filter((card): card is Card => Boolean(card));
  }, [base, overlay]);

  const tagSuggestions = useMemo(() => {
    if (!overlay) {
      return [];
    }
    const seen = new Set<string>();
    Object.values(overlay.tags).forEach((tags) => {
      tags.forEach((tag) => seen.add(tag));
    });
    return [...seen].sort((a, b) => a.localeCompare(b));
  }, [overlay]);

  const searchResults = useMemo(() => {
    if (!base) {
      return [];
    }
    const needle = search.trim().toLowerCase();
    return Object.values(base.cards)
      .map((card) => {
        const haystack =
          `${card.title} ${card.overview} ${card.details}`.toLowerCase();
        const matchesText = !needle || haystack.includes(needle);
        const overlayTags = overlay?.tags[card.id] ?? [];
        const matchesTags =
          activeTagFilters.length === 0 ||
          overlayTags.some((tag) => activeTagFilters.includes(tag));
        if (!matchesText || !matchesTags) {
          return { card, score: -Infinity };
        }
        const titleBonus = needle && card.title.toLowerCase().includes(needle) ? 10 : 0;
        const score = needle ? titleBonus + haystack.indexOf(needle) * -1 : 0;
        return { card, score };
      })
      .filter((entry) => entry.score > -Infinity)
      .sort((left, right) => right.score - left.score)
      .map((entry) => entry.card);
  }, [activeTagFilters, base, overlay?.tags, search]);

  function applyView(nextView: ViewState) {
    const params = new URLSearchParams();
    if (nextView.cardId) {
      params.set("card", nextView.cardId);
    }
    if (nextView.parentId) {
      params.set("parent", nextView.parentId);
    }
    if (nextView.trail.length) {
      params.set("trail", dedupeTrail(nextView.trail).join(","));
    }

    startTransition(() => {
      navigate({ search: params.toString() });
    });
  }

  function openCard(
    cardId: string,
    options?: {
      parentId?: string | null;
      trail?: string[];
    }
  ) {
    const nextView: ViewState = {
      cardId,
      parentId: options?.parentId ?? null,
      trail: dedupeTrail(options?.trail ?? [cardId])
    };

    if (!sameView(currentView, nextView)) {
      setBackStack((current) => [...current, currentView]);
      setForwardStack([]);
    }

    applyView(nextView);
  }

  function goHome() {
    const homeView: ViewState = {
      cardId: null,
      parentId: null,
      trail: []
    };

    if (!sameView(currentView, homeView)) {
      setBackStack((current) => [...current, currentView]);
      setForwardStack([]);
    }

    applyView(homeView);
  }

  function goBackInApp() {
    if (!backStack.length) {
      return;
    }

    const previous = backStack[backStack.length - 1]!;
    setBackStack((current) => current.slice(0, -1));
    setForwardStack((current) => [currentView, ...current]);
    applyView(previous);
  }

  function goForwardInApp() {
    if (!forwardStack.length) {
      return;
    }

    const next = forwardStack[0]!;
    setForwardStack((current) => current.slice(1));
    setBackStack((current) => [...current, currentView]);
    applyView(next);
  }

  function jumpToHistoryView(target: ViewState) {
    const all = [...backStack, currentView, ...forwardStack];
    const index = all.findIndex((entry) => sameView(entry, target));
    if (index < 0) {
      return;
    }

    setBackStack(all.slice(0, index));
    setForwardStack(all.slice(index + 1));
    setIsHistoryMenuOpen(false);
    applyView(target);
  }

  function clearHistory() {
    setBackStack([]);
    setForwardStack([]);
    setIsHistoryMenuOpen(false);
  }

  function toggleFavorite(cardId: string) {
    if (!overlay) {
      return;
    }

    const exists = overlay.favorites.includes(cardId);
    const favorites = exists
      ? overlay.favorites.filter((id) => id !== cardId)
      : [...overlay.favorites, cardId];

    const nextOverlay = { ...overlay, favorites };
    setOverlay(nextOverlay);
    void persist("favorites", nextOverlay);
  }

  function addTag(cardId: string) {
    if (!overlay) {
      return;
    }
    const tag = normalizeTag(newTag);
    if (!tag) {
      return;
    }

    const currentTags = overlay.tags[cardId] ?? [];
    if (currentTags.includes(tag)) {
      setNewTag("");
      return;
    }

    const tags = {
      ...overlay.tags,
      [cardId]: [...currentTags, tag]
    };

    const nextOverlay = { ...overlay, tags };
    setOverlay(nextOverlay);
    setNewTag("");
    void persist("tags", nextOverlay);
  }

  function submitTag(cardId: string) {
    addTag(cardId);
  }

  function removeTag(cardId: string, tag: string) {
    if (!overlay) {
      return;
    }

    const nextTags = (overlay.tags[cardId] ?? []).filter((value) => value !== tag);
    const tags = { ...overlay.tags };
    if (nextTags.length) {
      tags[cardId] = nextTags;
    } else {
      delete tags[cardId];
    }

    const nextOverlay = { ...overlay, tags };
    setOverlay(nextOverlay);
    void persist("tags", nextOverlay);
  }

  function queueNoteSave(cardId: string, note: string) {
    if (!overlay) {
      return;
    }

    const notes =
      note.trim().length > 0
        ? { ...overlay.notes, [cardId]: note }
        : Object.fromEntries(
            Object.entries(overlay.notes).filter(([key]) => key !== cardId)
          );

    const nextOverlay = { ...overlay, notes };
    setOverlay(nextOverlay);

    if (noteSaveTimer.current) {
      window.clearTimeout(noteSaveTimer.current);
    }

    noteSaveTimer.current = window.setTimeout(() => {
      void persist("notes", nextOverlay);
    }, 500);
  }

  async function handleLogout() {
    await apiClient.logout();
    setBase(null);
    setOverlay(null);
    setProfile(null);
    setActiveWorkspace("knowledge");
    setChatMessages([]);
    setChatDraft("");
    setChatError(null);
    setIsChatting(false);
    setBackStack([]);
    setForwardStack([]);
    setActiveTagFilters([]);
    setSearch("");
    setDraftNote("");
    setNewTag("");
    setIsUserMenuOpen(false);
    setIsHistoryMenuOpen(false);
    setIsSearchResultsOpen(true);
    setAuthState("anon");
    navigate("/");
  }

  async function handleProfileSave(event: React.FormEvent) {
    event.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);

    try {
      const reactor = new LoginReactor(apiClient);
      const { profile: updatedProfile } = await reactor.updateUsername(usernameDraft);
      setProfile(updatedProfile);
      setIsProfileOpen(false);
      setIsUserMenuOpen(false);
    } catch (saveError) {
      setProfileError(
        saveError instanceof Error
          ? saveError.message
          : "Saving profile failed."
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function copyText(messageId: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedMessageId(messageId);
      window.setTimeout(() => {
        setCopiedMessageId((current) => (current === messageId ? null : current));
      }, 900);
    } catch {
      // Ignore clipboard failures for now.
    }
  }

  function handleNewChat() {
    setChatMessages([]);
    setChatDraft("");
    setChatError(null);

    if (profile) {
      window.localStorage.removeItem(chatStorageKey(profile.id));
    }
  }

  async function sendCurrentChatMessage() {
    const content = chatDraft.trim();
    if (!content || isChatting) {
      return;
    }

    const nextUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toISOString()
    };

    const nextConversation = [...chatMessages, nextUserMessage];
    setChatMessages(nextConversation);
    setChatDraft("");
    setChatError(null);
    setIsChatting(true);

    try {
      const { message } = await apiClient.chat(nextConversation);
      setChatMessages((current) => [...current, message]);
    } catch (chatRequestError) {
      setChatError(
        chatRequestError instanceof Error
          ? chatRequestError.message
          : "Chat request failed."
      );
    } finally {
      setIsChatting(false);
    }
  }

  async function handleSendChatMessage(event: React.FormEvent) {
    event.preventDefault();
    await sendCurrentChatMessage();
  }

  if (authState === "loading") {
    return <div className="screen-state">Loading JBSapp...</div>;
  }

  if (authState === "anon") {
    return (
      <LoginScreen
        onLoggedIn={async (loggedInProfile) => {
          setProfile(loggedInProfile);
          await loadProtectedState(loggedInProfile);
        }}
      />
    );
  }

  if (!base || !overlay || !profile) {
    return <div className="screen-state">Loading your study space...</div>;
  }

  const roots = base.rootIds
    .map((id) => base.cards[id])
    .filter((card): card is Card => Boolean(card));
  const stackCards = trailIds
    .map((id) => base.cards[id])
    .filter((card): card is Card => Boolean(card));

  const activeTags = currentCard ? overlay.tags[currentCard.id] ?? [] : [];
  const hasOverview = Boolean(currentCard?.overview?.trim());
  const hasDetails = Boolean(currentCard?.details?.trim());
  const visibleParents =
    currentCard?.parents.filter(
      (id) => id !== currentParentId && !trailIds.includes(id)
    ) ?? [];
  const visibleChildren = currentCard?.children ?? [];
  const visibleRelated = currentCard?.related ?? [];
  const backTarget = backStack[backStack.length - 1] ?? null;
  const forwardTarget = forwardStack[0] ?? null;
  const historyEntries = [...backStack, currentView, ...forwardStack].reverse();
  const hasSearchContext = Boolean(search.trim() || activeTagFilters.length);

  function titleForView(view: ViewState | null): string {
    if (!view) {
      return "";
    }
    if (!view.cardId) {
      return "Knowledge Base";
    }
    return base!.cards[view.cardId]?.title ?? "Card";
  }

  function toggleTagFilter(tag: string) {
    setActiveTagFilters((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag]
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="header-top">
          <div>
            <p className="eyebrow">Just Breathe Study App</p>
            <h1>JBSapp</h1>
            <p className="claim">From novice to instructor in no time!</p>
          </div>
          <div className="user-menu-wrap" ref={userMenuRef}>
            <button
              className="user-menu-trigger"
              onClick={() => setIsUserMenuOpen((value) => !value)}
              aria-label="Open user menu"
            >
              <User size={20} />
            </button>
            {isUserMenuOpen ? (
              <div className="user-menu">
                <div className="user-menu-head">
                  <strong>{profile.username}</strong>
                  <span>{profile.email}</span>
                </div>
                <button
                  className="user-menu-item"
                  onClick={() => {
                    setIsProfileOpen(true);
                    setIsUserMenuOpen(false);
                    setProfileError(null);
                  }}
                >
                  Profile
                </button>
                <button
                  className="user-menu-item"
                  onClick={() => void handleLogout()}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="workspace-tabs">
          <button
            className={`workspace-tab ${
              activeWorkspace === "knowledge" ? "active" : ""
            }`}
            onClick={() => setActiveWorkspace("knowledge")}
            type="button"
          >
            <BookOpen size={16} />
            <span>Knowledge Base</span>
          </button>
          <button
            className={`workspace-tab ${activeWorkspace === "chat" ? "active" : ""}`}
            onClick={() => setActiveWorkspace("chat")}
            type="button"
          >
            <MessageSquare size={16} />
            <span>Chat</span>
          </button>
        </div>
        {activeWorkspace === "knowledge" ? (
          <div className="header-nav">
            <div className="nav-title-spacer" />
            <div className="header-actions">
              <button
                className="ghost-button nav-button"
                disabled={!backTarget}
                onClick={() => goBackInApp()}
              >
                <ArrowLeft size={16} />
                <span>{titleForView(backTarget)}</span>
              </button>
              <div className="history-menu-wrap">
                <button
                  className="ghost-button history-button"
                  onClick={() => setIsHistoryMenuOpen((value) => !value)}
                >
                  <History size={16} />
                </button>
                {isHistoryMenuOpen ? (
                  <div className="history-menu">
                    <div className="history-menu-head">
                      <strong>History</strong>
                      <button
                        className="history-clear-button"
                        onClick={() => clearHistory()}
                        aria-label="Clear history"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="history-list">
                      {historyEntries.map((entry, index) => (
                        <button
                          key={`${entry.cardId ?? "home"}-${index}`}
                          className={`history-item ${
                            sameView(entry, currentView) ? "current" : ""
                          }`}
                          onClick={() => jumpToHistoryView(entry)}
                        >
                          {titleForView(entry)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <button
                className="ghost-button nav-button"
                disabled={!forwardTarget}
                onClick={() => goForwardInApp()}
              >
                <span>{titleForView(forwardTarget)}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </header>

      {isProfileOpen ? (
        <div
          className="overlay-backdrop"
          onClick={() => {
            setIsProfileOpen(false);
            setProfileError(null);
            setUsernameDraft(profile.username);
          }}
        >
          <section
            className="panel profile-dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-head">
              <button className="section-title-button" type="button">
                Profile
              </button>
            </div>
            <form className="profile-form" onSubmit={handleProfileSave}>
              <label>
                <span>Username *</span>
                <input
                  value={usernameDraft}
                  onChange={(event) => setUsernameDraft(event.target.value)}
                  required
                />
              </label>
              <label>
                <span>Email</span>
                <input value={profile.email} disabled />
              </label>
              {profileError ? <p className="form-error">{profileError}</p> : null}
              <div className="auth-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setProfileError(null);
                    setUsernameDraft(profile.username);
                  }}
                >
                  Cancel
                </button>
                <button className="primary-button" disabled={isSavingProfile} type="submit">
                  {isSavingProfile ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {activeWorkspace === "knowledge" ? (
        <>
          {favoriteCards.length ? (
            <section className="panel favorites-panel">
              <div className="section-head">
                <Heart size={16} />
                <button className="section-title-button" type="button">
                  Favorites
                </button>
              </div>
              <div className="chip-row">
                {favoriteCards.map((card) => (
                  <button
                    key={card.id}
                    className="favorite-chip"
                    data-color={colorNameForCard(card)}
                    data-icon={iconNameForCard(card) ?? ""}
                    onClick={() => openCard(card.id, { trail: [card.id] })}
                  >
                    {card.title}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="panel search-panel">
            <div className="search-row">
              <Search size={16} />
              <input
                className="search-input plain"
                placeholder="Search cards..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search ? (
                <button
                  className="search-clear-button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
            {tagSuggestions.length ? (
              <div className="search-tag-filters">
                {tagSuggestions.map((tag) => (
                  <button
                    key={tag}
                    className={`filter-chip ${
                      activeTagFilters.includes(tag) ? "active" : ""
                    }`}
                    onClick={() => toggleTagFilter(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : null}
            {hasSearchContext ? (
              <div className="search-results-toggle-row">
                <button
                  className="search-results-toggle"
                  onClick={() => setIsSearchResultsOpen((value) => !value)}
                >
                  {isSearchResultsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>
                    {isSearchResultsOpen ? "Hide search results" : "Show search results"}
                  </span>
                </button>
              </div>
            ) : null}
            {hasSearchContext && isSearchResultsOpen ? (
              <ul className="result-list">
                {searchResults.map((card) => (
                  <li key={card.id}>
                    <button
                      className="result-button"
                      onClick={() => {
                        setIsSearchResultsOpen(false);
                        openCard(card.id, { trail: [card.id] });
                      }}
                    >
                      <strong>{card.title}</strong>
                      <span>{card.overview}</span>
                    </button>
                  </li>
                ))}
                {!searchResults.length ? <li className="muted">No matching cards.</li> : null}
              </ul>
            ) : null}
          </section>

          <section className="content-grid">
            <section className="panel detail-panel full-width" ref={detailSectionRef}>
              <div className="section-head">
                <button
                  className="section-icon-button"
                  onClick={() => goHome()}
                  aria-label="Show root cards"
                >
                  <BookOpen size={16} />
                </button>
                <button className="section-title-button" onClick={() => goHome()}>
                  Just Breathe Knowledge Base
                </button>
              </div>

              {!currentCard || stackCards.length === 0 ? (
                <ul className="card-list">
                  {roots.map((card) => {
                    const Icon = iconForCard(card);
                    return (
                      <li key={card.id}>
                        <button
                          className="browse-card"
                          data-color={colorNameForCard(card)}
                          data-icon={iconNameForCard(card) ?? ""}
                          onClick={() => openCard(card.id, { trail: [card.id] })}
                        >
                          <div className="browse-card-head">
                            <Icon size={18} />
                            <span>{card.title}</span>
                          </div>
                          <p>{card.overview}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="card-stack">
              {stackCards.slice(0, -1).map((card, index) => (
                    <button
                      key={card.id}
                      className="stack-peek"
                      onClick={() =>
                        openCard(card.id, {
                          parentId: index > 0 ? stackCards[index - 1]!.id : null,
                          trail: stackCards.slice(0, index + 1).map((entry) => entry.id)
                        })
                      }
                    >
                      <span>{card.title}</span>
                    </button>
                  ))}

                  <article className="active-card-sheet">
                    {(() => {
                      const Icon = iconForCard(currentCard);
                      return (
                        <div
                          className="active-card-titlebar"
                          data-color={colorNameForCard(currentCard)}
                          data-icon={iconNameForCard(currentCard) ?? ""}
                        >
                          <div className="active-card-titlebar-row">
                            <div className="active-card-titlebar-inner">
                              <Icon size={20} />
                              <h2>{currentCard.title}</h2>
                            </div>
                            <button
                              className={`favorite-toggle ${
                                overlay.favorites.includes(currentCard.id) ? "active" : ""
                              }`}
                              onClick={() => toggleFavorite(currentCard.id)}
                            >
                              <Heart size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {hasOverview ? (
                      <article className="card-copy card-overview">
                        <p>{currentCard.overview}</p>
                      </article>
                    ) : null}

                    {hasDetails ? (
                      <article className="card-copy card-details">
                        <MarkdownMessage content={currentCard.details} />
                      </article>
                    ) : null}

                    {visibleChildren.length ? (
                      <div className="context-block context-block-primary">
                        <div className="child-list">
                          {visibleChildren.map((childId) => {
                            const child = base.cards[childId];
                            if (!child) {
                              return null;
                            }

                            const Icon = iconForCard(child);
                            return (
                              <button
                                key={child.id}
                                className="child-link"
                                onClick={() =>
                                  openCard(child.id, {
                                    parentId: currentCard.id,
                                    trail: buildNextTrail(trailIds, child.id)
                                  })
                                }
                              >
                                <span className="link-with-icon">
                                  <Icon size={16} />
                                  <span>{child.title}</span>
                                </span>
                                <ChevronRight size={16} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {visibleRelated.length ? (
                      <div className="context-block context-block-secondary">
                        <h3>Related</h3>
                        <div className="chip-row">
                          {visibleRelated.map((relatedId) => {
                            const related = base.cards[relatedId];
                            if (!related) {
                              return null;
                            }

                            const Icon = iconForCard(related);
                            return (
                              <button
                                key={related.id}
                                className="context-chip subtle"
                                data-color={colorNameForCard(related)}
                                onClick={() =>
                                  openCard(related.id, {
                                    trail: buildNextTrail(trailIds, related.id)
                                  })
                                }
                              >
                                <span className="link-with-icon">
                                  <Icon size={14} />
                                  <span>{related.title}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {visibleParents.length ? (
                      <div className="context-block context-block-secondary">
                        <h3>Parents</h3>
                        <div className="chip-row">
                          {visibleParents.map((parentId) => {
                            const parent = base.cards[parentId];
                            if (!parent) {
                              return null;
                            }

                            const Icon = iconForCard(parent);
                            return (
                              <button
                                key={parent.id}
                                className="context-chip subtle"
                                data-color={colorNameForCard(parent)}
                                onClick={() =>
                                  openCard(parent.id, {
                                    trail: buildNextTrail(trailIds, parent.id)
                                  })
                                }
                              >
                                <span className="link-with-icon">
                                  <Icon size={14} />
                                  <span>{parent.title}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    <div className="context-block">
                      <div className="tag-input-shell">
                        <div className="tag-input-head">
                          <Tag size={16} />
                        </div>
                        <div className="tag-editor">
                          <div className="tag-chip-wrap">
                            {activeTags.map((tag) => (
                              <span key={tag} className="user-tag">
                                {tag}
                                <button onClick={() => removeTag(currentCard.id, tag)}>×</button>
                              </span>
                            ))}
                          </div>
                          <input
                            list="tag-suggestions"
                            placeholder="Add a tag"
                            value={newTag}
                            onChange={(event) => setNewTag(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                submitTag(currentCard.id);
                              }
                            }}
                          />
                        </div>
                        <datalist id="tag-suggestions">
                          {tagSuggestions.map((tag) => (
                            <option key={tag} value={tag} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    <div className="context-block">
                      <h3>Your notes</h3>
                      <textarea
                        className="note-textarea"
                        value={draftNote}
                        onChange={(event) => {
                          const note = event.target.value;
                          setDraftNote(note);
                          queueNoteSave(currentCard.id, note);
                        }}
                        placeholder="Write your note for this card..."
                      />
                    </div>
                  </article>
                </div>
              )}

              <footer className="save-footer">
                <span>Favorites: {saveStatus.favorites}</span>
                <span>Tags: {saveStatus.tags}</span>
                <span>Notes: {saveStatus.notes}</span>
                {error ? <span>{error}</span> : null}
              </footer>
            </section>
          </section>
        </>
      ) : (
        <section className="panel chat-panel">
          <div className="section-head chat-head">
            <button className="section-title-button" type="button">
              Chat with the Just Breathe Training Material
            </button>
            <button
              className="secondary-button chat-reset-button icon-only"
              onClick={handleNewChat}
              aria-label="Start new chat"
              title="New chat"
            >
              <MessageSquarePlus size={15} />
            </button>
          </div>

          {chatMessages.length ? (
            <div className="chat-thread">
              {chatMessages.map((message) => (
                <article
                  key={message.id}
                  className={`chat-message ${message.role === "user" ? "user" : "assistant"}`}
                >
                  <div className="chat-message-meta">
                    <span>
                      {message.role === "user" ? profile.username : "Just Breathe Chatbot"}
                    </span>
                    <button
                      className={`chat-copy-button ${
                        copiedMessageId === message.id ? "copied" : ""
                      }`}
                      onClick={() => void copyText(message.id, message.content)}
                      aria-label="Copy message"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="chat-bubble">
                    <MarkdownMessage content={message.content} />
                  </div>
                </article>
              ))}
              {isChatting ? (
                <article className="chat-message assistant">
                  <div className="chat-message-meta">
                    <span>Just Breathe Chatbot</span>
                  </div>
                  <div className="chat-bubble">
                    <p>Thinking...</p>
                  </div>
                </article>
              ) : null}
              <div ref={chatBottomRef} />
            </div>
          ) : (
            <div className="chat-empty-state">
              <p>Start a conversation below.</p>
            </div>
          )}

          {chatError ? <p className="form-error chat-error">{chatError}</p> : null}

          <form className="chat-composer" onSubmit={handleSendChatMessage}>
            <div className="chat-composer-row">
              <textarea
                className="chat-input"
                value={chatDraft}
                onChange={(event) => setChatDraft(event.target.value)}
                placeholder="Ask the Just Breathe Coach..."
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendCurrentChatMessage();
                  }
                }}
              />
              <button
                className="chat-send-button"
                disabled={!chatDraft.trim() || isChatting}
                type="submit"
                aria-label={isChatting ? "Sending" : "Send"}
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}
