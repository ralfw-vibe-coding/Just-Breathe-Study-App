import type { Handler } from "@netlify/functions";
import { SaveOverlaySectionReactor } from "../../src/backend/body/reactors/saveOverlaySectionReactor";
import { jsonResponse, methodNotAllowed, withAuth } from "./_shared";

const authedHandler: Handler = withAuth(async (event, userId) => {
  if (event.httpMethod !== "PATCH") {
    return methodNotAllowed();
  }

  const body = JSON.parse(event.body ?? "{}") as {
    tags?: Record<string, string[]>;
  };

  if (!body.tags || typeof body.tags !== "object") {
    return jsonResponse(400, { error: "tags must be an object." });
  }

  const reactor = new SaveOverlaySectionReactor();
  await reactor.saveTags(userId, body.tags);
  return jsonResponse(200, { ok: true });
});

export const handler = authedHandler;
