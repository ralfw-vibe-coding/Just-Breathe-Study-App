export interface Card {
  id: string;
  title: string;
  overview: string;
  details: string;
  tags: string[];
  parents: string[];
  children: string[];
  related: string[];
}

export interface KnowledgeBase {
  rootIds: string[];
  cards: Record<string, Card>;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
}

export interface OverlayPayload {
  favorites: string[];
  tags: Record<string, string[]>;
  notes: Record<string, string>;
  studyDeck: StudyDeck;
}

export interface StudyDeckCardState {
  included: boolean;
  timesKnown: number;
  timesPresented: number;
  dueSession: number;
}

export interface StudyDeck {
  currentSession: number;
  cards: Record<string, StudyDeckCardState>;
}

export interface OverlayResponse {
  profile: UserProfile;
  overlay: OverlayPayload;
}

export interface SessionResponse {
  profile: UserProfile;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatResponse {
  message: ChatMessage;
}
