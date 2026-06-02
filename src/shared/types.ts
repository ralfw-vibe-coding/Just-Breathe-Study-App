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

export interface AppConfig {
  features: {
    sessions: boolean;
  };
}

export type SessionVoice = "male" | "female";

export interface SessionPlanInput {
  description: string;
  voice: SessionVoice;
}

export interface SessionScript {
  title: string;
  voice: SessionVoice;
  script: string;
}

export interface SessionPlanResponse {
  session: SessionScript;
}

export interface SessionAudioInput {
  text: string;
  voice: SessionVoice;
}

export interface SessionAudioResponse {
  audioBase64: string;
  mimeType: string;
}

export interface SessionAudioStartInput {
  jobId: string;
  text: string;
  voice: SessionVoice;
}

export type SessionAudioJobStatus = "generating" | "ready" | "failed";

export interface SessionAudioJob {
  jobId: string;
  status: SessionAudioJobStatus;
  progress: number;
  logs: string[];
  error: string | null;
  audioBase64?: string;
  mimeType?: string;
}

export interface SessionAudioJobResponse {
  job: SessionAudioJob | null;
}

export interface PreparedSession {
  title: string;
  voice: SessionVoice;
  preparedAt: string;
  sourceDescription: string;
  narrationText: string;
  audioDataUrl?: string;
  audioJobId?: string;
  audioJobStatus?: SessionAudioJobStatus;
  audioJobProgress?: number;
  audioJobLogs?: string[];
  audioJobError?: string | null;
}
