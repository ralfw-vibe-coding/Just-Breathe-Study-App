import type { SessionAudioInput, SessionAudioResponse } from "../../../shared/types";
import { isSessionsEnabled } from "../domain/providers/appConfig";
import { synthesizeSpeech } from "../domain/providers/elevenLabsProvider";

export class GenerateSessionAudioReactor {
  async process(input: SessionAudioInput): Promise<SessionAudioResponse> {
    if (!isSessionsEnabled()) {
      throw new Error("Sessions are currently disabled.");
    }

    if (!input.text.trim()) {
      throw new Error("Audio text is required.");
    }

    return await synthesizeSpeech(input.voice, input.text);
  }
}
