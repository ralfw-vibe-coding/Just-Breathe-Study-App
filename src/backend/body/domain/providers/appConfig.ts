import type { AppConfig, SessionVoice } from "../../../../shared/types";

export function isSessionsEnabled(): boolean {
  return (process.env.FEATURE_FLAG_SESSIONS ?? "off").toLowerCase() === "on";
}

export function getAppConfig(): AppConfig {
  return {
    features: {
      sessions: isSessionsEnabled()
    }
  };
}

export function resolveVoiceId(voice: SessionVoice): string {
  const voiceId =
    voice === "male"
      ? process.env.ELEVENLABS_VOICEID_MALE
      : process.env.ELEVENLABS_VOICEID_FEMALE;

  if (!voiceId) {
    throw new Error(`No ElevenLabs voice configured for ${voice}.`);
  }

  return voiceId;
}
