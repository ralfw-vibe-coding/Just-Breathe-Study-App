import type { Handler } from "@netlify/functions";
import { buildSessionCookie } from "../../src/backend/body/domain/providers/auth";
import { UpdateUsernameReactor } from "../../src/backend/body/reactors/updateUsernameReactor";
import { jsonResponse, methodNotAllowed, withAuth } from "./_shared";

const authedHandler: Handler = withAuth(async (event, userId) => {
  if (event.httpMethod !== "PATCH") {
    return methodNotAllowed();
  }

  try {
    const body = JSON.parse(event.body ?? "{}") as { username?: string };
    if (!body.username) {
      return jsonResponse(400, { error: "Username is required." });
    }

    const reactor = new UpdateUsernameReactor();
    const { profile, token } = await reactor.process(userId, body.username);
    return jsonResponse(
      200,
      { profile },
      { "Set-Cookie": buildSessionCookie(token) }
    );
  } catch (error) {
    return jsonResponse(400, {
      error:
        error instanceof Error ? error.message : "Updating username failed."
    });
  }
});

export const handler = authedHandler;
