import type { Handler } from "@netlify/functions";
import { SessionUserReactor } from "../../src/backend/body/reactors/sessionUserReactor";
import { jsonResponse, methodNotAllowed } from "./_shared";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return methodNotAllowed();
  }

  const reactor = new SessionUserReactor();
  const profile = await reactor.process(event);

  if (!profile) {
    return jsonResponse(401, { error: "Unauthorized." });
  }

  return jsonResponse(200, { profile });
};
