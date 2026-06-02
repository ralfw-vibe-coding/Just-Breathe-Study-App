import type { Handler } from "@netlify/functions";
import type { SessionAudioInput } from "../../src/shared/types";
import { GenerateSessionAudioReactor } from "../../src/backend/body/reactors/generateSessionAudioReactor";
import { jsonResponse, methodNotAllowed, withAuth } from "./_shared";

const authedHandler: Handler = withAuth(async (event) => {
  if (event.httpMethod !== "POST") {
    return methodNotAllowed();
  }

  try {
    const body = JSON.parse(event.body ?? "{}") as SessionAudioInput;
    const reactor = new GenerateSessionAudioReactor();
    return jsonResponse(200, await reactor.process(body));
  } catch (error) {
    return jsonResponse(400, {
      error:
        error instanceof Error ? error.message : "Generating session audio failed."
    });
  }
});

export const handler = authedHandler;
