import type {
  Handler,
  HandlerEvent,
  HandlerResponse
} from "@netlify/functions";
import { buildExpiredSessionCookie } from "../../src/backend/body/domain/providers/auth";
import { SessionUserReactor } from "../../src/backend/body/reactors/sessionUserReactor";

export function jsonResponse(
  statusCode: number,
  body: unknown,
  headers: Record<string, string> = {}
): HandlerResponse {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  };
}

export function methodNotAllowed(): HandlerResponse {
  return jsonResponse(405, { error: "Method not allowed." });
}

export function withAuth(
  handler: (event: HandlerEvent, userId: string) => Promise<HandlerResponse>
): Handler {
  return async (event) => {
    const reactor = new SessionUserReactor();
    const profile = await reactor.process(event);

    if (!profile) {
      return jsonResponse(
        401,
        { error: "Unauthorized." },
        { "Set-Cookie": buildExpiredSessionCookie() }
      );
    }

    return await handler(event, profile.id);
  };
}
