import type {
  AppConfig,
  ChatMessage,
  ChatResponse,
  KnowledgeBase,
  OverlayResponse,
  SessionAudioInput,
  SessionAudioJobResponse,
  SessionAudioResponse,
  SessionAudioStartInput,
  SessionPlanInput,
  SessionPlanResponse,
  SessionResponse
} from "../../../shared/types";

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      },
      ...init
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Network error while contacting the server.";
    throw new Error(`Network error: ${message}`);
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) {
        message = body.error;
      }
    } catch {
      try {
        const text = await response.text();
        if (text.trim()) {
          message = `${message} ${text.trim()}`;
        }
      } catch {
        // Ignore body parsing errors for fallback message.
      }
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export class ApiClient {
  async getSession(): Promise<SessionResponse> {
    return await request<SessionResponse>("/api/session");
  }

  async getAppConfig(): Promise<AppConfig> {
    return await request<AppConfig>("/api/app-config");
  }

  async login(email: string, otp: string): Promise<SessionResponse> {
    return await request<SessionResponse>("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, otp })
    });
  }

  async requestOtp(email: string): Promise<void> {
    await request("/api/request-otp", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  }

  async updateUsername(username: string): Promise<SessionResponse> {
    return await request<SessionResponse>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ username })
    });
  }

  async logout(): Promise<void> {
    await request("/api/logout", { method: "POST" });
  }

  async getBase(): Promise<KnowledgeBase> {
    return await request<KnowledgeBase>("/api/base");
  }

  async getOverlay(): Promise<OverlayResponse> {
    return await request<OverlayResponse>("/api/overlay");
  }

  async saveFavorites(favorites: string[]): Promise<void> {
    await request("/api/overlay-favorites", {
      method: "PATCH",
      body: JSON.stringify({ favorites })
    });
  }

  async saveTags(tags: Record<string, string[]>): Promise<void> {
    await request("/api/overlay-tags", {
      method: "PATCH",
      body: JSON.stringify({ tags })
    });
  }

  async saveNotes(notes: Record<string, string>): Promise<void> {
    await request("/api/overlay-notes", {
      method: "PATCH",
      body: JSON.stringify({ notes })
    });
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    return await request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages })
    });
  }

  async generateSessionPlan(input: SessionPlanInput): Promise<SessionPlanResponse> {
    return await request<SessionPlanResponse>("/api/session-plan", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  async generateSessionAudio(
    input: SessionAudioInput
  ): Promise<SessionAudioResponse> {
    return await request<SessionAudioResponse>("/api/session-audio", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  async startSessionAudioJob(input: SessionAudioStartInput): Promise<void> {
    let response: Response;
    try {
      response = await fetch("/api/session-audio-background", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Network error while contacting the server.";
      throw new Error(`Network error: ${message}`);
    }

    if (!response.ok) {
      let message = `Request failed (${response.status}).`;
      try {
        const body = (await response.json()) as { error?: string };
        if (body.error) {
          message = body.error;
        }
      } catch {
        // Ignore body parsing errors for fallback message.
      }
      throw new Error(message);
    }
  }

  async getSessionAudioJob(): Promise<SessionAudioJobResponse> {
    return await request<SessionAudioJobResponse>("/api/session-audio-job");
  }

  async deleteSessionAudioJob(): Promise<void> {
    await request("/api/session-audio-job", {
      method: "DELETE"
    });
  }
}
