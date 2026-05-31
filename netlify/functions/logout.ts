import type { Handler } from "@netlify/functions";
import { buildExpiredSessionCookie } from "../../src/backend/body/domain/providers/auth";
import { jsonResponse, methodNotAllowed } from "./_shared";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return methodNotAllowed();
  }

  return jsonResponse(
    200,
    { ok: true },
    { "Set-Cookie": buildExpiredSessionCookie() }
  );
};
