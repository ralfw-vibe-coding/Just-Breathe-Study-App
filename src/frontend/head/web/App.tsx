import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  History,
  Heart,
  Search,
  Tag,
  Trash2,
  User,
  X,
  Wind
} from "lucide-react";
import type {
  Card,
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

const apiClient = new ApiClient();

function tagValue(tags: string[], prefix: string): string | null {
  const hit = tags.find((tag) => tag.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function iconForCard(card: Card) {
  const iconTag = tagValue(card.tags, "icon_");
  switch (iconTag) {
    case "wind":
      return Wind;
    case "book_open":
      return BookOpen;
    default:
      return BookOpen;
  }
}

function colorClassForCard(card: Card): string {
  const colorTag = tagValue(card.tags, "color_");
  switch (colorTag) {
    case "blue":
      return "tone-blue";
    case "sand":
      return "tone-sand";
    case "green":
      return "tone-green";
    case "rose":
      return "tone-rose";
    default:
      return "tone-neutral";
  }
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(true);
  const [backStack, setBackStack] = useState<ViewState[]>([]);
  const [forwardStack, setForwardStack] = useState<ViewState[]>([]);
  const noteSaveTimer = useRef<number | null>(null);
  const detailSectionRef = useRef<HTMLElement | null>(null);

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
    if (!currentCard || !detailSectionRef.current) {
      return;
    }

    detailSectionRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, [currentCardId]);

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
          <div className="user-menu-wrap">
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
                  onClick={() => setIsUserMenuOpen(false)}
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
      </header>

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
                className={`favorite-chip ${colorClassForCard(card)}`}
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
                      className={`browse-card ${colorClassForCard(card)}`}
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
              <div className="detail-header">
                <div>
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

              {hasOverview ? (
                <article className="card-copy card-overview">
                  <p>{currentCard.overview}</p>
                </article>
              ) : null}

              {hasDetails ? (
                <article className="card-copy card-details">
                  <p>{currentCard.details}</p>
                </article>
              ) : null}

              {visibleChildren.length ? (
                <div className="context-block context-block-primary">
                  <div className="child-list">
                    {visibleChildren.map((childId) => {
                      const child = base.cards[childId];
                      return child ? (
                        <button
                          key={child.id}
                          className="child-link"
                          onClick={() =>
                            openCard(child.id, {
                              parentId: currentCard.id,
                              trail: buildNextTrail(
                                trailIds,
                                child.id
                              )
                            })
                          }
                        >
                          <span>{child.title}</span>
                          <ChevronRight size={16} />
                        </button>
                      ) : null;
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
                      return related ? (
                        <button
                          key={related.id}
                          className="context-chip subtle"
                          onClick={() =>
                            openCard(related.id, {
                              trail: buildNextTrail(
                                trailIds,
                                related.id
                              )
                            })
                          }
                        >
                          {related.title}
                        </button>
                      ) : null;
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
                      return parent ? (
                        <button
                          key={parent.id}
                          className="context-chip subtle"
                          onClick={() =>
                            openCard(parent.id, {
                              trail: buildNextTrail(
                                trailIds,
                                parent.id
                              )
                            })
                          }
                        >
                          {parent.title}
                        </button>
                      ) : null;
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
    </main>
  );
}
