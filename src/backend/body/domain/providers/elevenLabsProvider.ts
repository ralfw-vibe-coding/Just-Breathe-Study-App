import type { SessionAudioResponse, SessionVoice } from "../../../../shared/types";
import { resolveVoiceId } from "./appConfig";

export async function synthesizeSpeech(
  voice: SessionVoice,
  text: string,
  options: {
    timeoutMs?: number;
  } = {}
): Promise<SessionAudioResponse> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ElevenLabs is not configured on the server.");
  }

  const voiceId = resolveVoiceId(voice);
  const timeoutMs = options.timeoutMs ?? 25_000;
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
          "xi-api-key": apiKey
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_v3",
          voice_settings: {
            stability: 0.5
          }
        }),
        signal: abortController.signal
      }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `ElevenLabs audio generation timed out after ${Math.round(
          timeoutMs / 1000
        )} seconds. The Eleven v3 request took too long for the current server runtime.`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `ElevenLabs request failed (${response.status}). ${message}`.trim()
    );
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return {
    audioBase64: audioBuffer.toString("base64"),
    mimeType: "audio/mpeg"
  };
}
