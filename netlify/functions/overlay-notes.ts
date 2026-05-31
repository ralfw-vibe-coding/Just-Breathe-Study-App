import type { Handler } from "@netlify/functions";
import { SaveOverlaySectionReactor } from "../../src/backend/body/reactors/saveOverlaySectionReactor";
import { jsonResponse, methodNotAllowed, withAuth } from "./_shared";

const authedHandler: Handler = withAuth(async (event, userId) => {
  if (event.httpMethod !== "PATCH") {
    return methodNotAllowed();
  }

  const body = JSON.parse(event.body ?? "{}") as {
    notes?: Record<string, string>;
  };

  if (!body.notes || typeof body.notes !== "object") {
    return jsonResponse(400, { error: "notes must be an object." });
  }

  const reactor = new SaveOverlaySectionReactor();
  await reactor.saveNotes(userId, body.notes);
  return jsonResponse(200, { ok: true });
});

export const handler = authedHandler;
