import type { Handler } from "@netlify/functions";
import { SaveOverlaySectionReactor } from "../../src/backend/body/reactors/saveOverlaySectionReactor";
import { jsonResponse, methodNotAllowed, withAuth } from "./_shared";

const authedHandler: Handler = withAuth(async (event, userId) => {
  if (event.httpMethod !== "PATCH") {
    return methodNotAllowed();
  }

  const body = JSON.parse(event.body ?? "{}") as { favorites?: string[] };
  if (!Array.isArray(body.favorites)) {
    return jsonResponse(400, { error: "favorites must be an array." });
  }

  const reactor = new SaveOverlaySectionReactor();
  await reactor.saveFavorites(userId, body.favorites);
  return jsonResponse(200, { ok: true });
});

export const handler = authedHandler;
