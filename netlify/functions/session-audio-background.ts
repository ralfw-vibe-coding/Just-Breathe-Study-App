import type { Handler } from "@netlify/functions";
import type { SessionAudioStartInput } from "../../src/shared/types";
import { synthesizeSpeech } from "../../src/backend/body/domain/providers/elevenLabsProvider";
import {
  updateSessionAudioJobIfCurrent,
  upsertSessionAudioJob
} from "../../src/backend/body/domain/providers/sessionAudioJobRepository";
import { jsonResponse, methodNotAllowed, withAuth } from "./_shared";

const authedHandler: Handler = withAuth(async (event, userId) => {
  if (event.httpMethod !== "POST") {
    return methodNotAllowed();
  }

  const body = JSON.parse(event.body ?? "{}") as SessionAudioStartInput;
  if (!body.jobId || !body.text?.trim()) {
    return jsonResponse(400, { error: "jobId and text are required." });
  }

  await upsertSessionAudioJob(userId, {
    jobId: body.jobId,
    status: "generating",
    progress: 10,
    logs: ["Audio job accepted.", "Preparing ElevenLabs request..."],
    error: null
  });

  try {
    await updateSessionAudioJobIfCurrent(userId, body.jobId, {
      progress: 35,
      logs: [
        "Audio job accepted.",
        "Preparing ElevenLabs request...",
        "Requesting ElevenLabs audio..."
      ]
    });

    const audio = await synthesizeSpeech(body.voice, body.text, {
      timeoutMs: 14 * 60 * 1000
    });

    await updateSessionAudioJobIfCurrent(userId, body.jobId, {
      status: "ready",
      progress: 100,
      logs: [
        "Audio job accepted.",
        "Preparing ElevenLabs request...",
        "Requesting ElevenLabs audio...",
        "Audio ready."
      ],
      error: null,
      audioBase64: audio.audioBase64,
      mimeType: audio.mimeType
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Audio generation failed.";
    await updateSessionAudioJobIfCurrent(userId, body.jobId, {
      status: "failed",
      progress: 100,
      logs: [
        "Audio job accepted.",
        "Preparing ElevenLabs request...",
        "Requesting ElevenLabs audio...",
        `Audio generation failed: ${message}`
      ],
      error: message,
      audioBase64: undefined,
      mimeType: undefined
    });
  }

  return jsonResponse(202, { accepted: true });
});

export const handler = authedHandler;
