import type { Handler } from "@netlify/functions";
import {
  deleteSessionAudioJobForUser,
  getSessionAudioJobForUser
} from "../../src/backend/body/domain/providers/sessionAudioJobRepository";
import { jsonResponse, methodNotAllowed, withAuth } from "./_shared";

const authedHandler: Handler = withAuth(async (event, userId) => {
  if (event.httpMethod === "GET") {
    const job = await getSessionAudioJobForUser(userId);
    return jsonResponse(200, { job });
  }

  if (event.httpMethod === "DELETE") {
    await deleteSessionAudioJobForUser(userId);
    return jsonResponse(204, {});
  }

  return methodNotAllowed();
});

export const handler = authedHandler;
