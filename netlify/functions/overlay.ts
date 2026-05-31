import type { Handler } from "@netlify/functions";
import { findUserByEmail } from "../../src/backend/body/domain/providers/userRepository";
import { SessionUserReactor } from "../../src/backend/body/reactors/sessionUserReactor";
import { LoadOverlayReactor } from "../../src/backend/body/reactors/loadOverlayReactor";
import { jsonResponse, methodNotAllowed } from "./_shared";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return methodNotAllowed();
  }

  try {
    const sessionReactor = new SessionUserReactor();
    const sessionProfile = await sessionReactor.process(event);

    if (!sessionProfile) {
      return jsonResponse(401, { error: "Unauthorized." });
    }

    const profile = await findUserByEmail(sessionProfile.email);
    if (!profile) {
      return jsonResponse(404, { error: "User not found." });
    }

    const reactor = new LoadOverlayReactor();
    return jsonResponse(200, await reactor.process(profile));
  } catch (error) {
    return jsonResponse(500, {
      error:
        error instanceof Error
          ? `Overlay loading failed: ${error.message}`
          : "Overlay loading failed."
    });
  }
};
