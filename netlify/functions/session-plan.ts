import type { Handler } from "@netlify/functions";
import type { SessionPlanInput, SessionPlanResponse } from "../../src/shared/types";
import { GenerateSessionPlanReactor } from "../../src/backend/body/reactors/generateSessionPlanReactor";
import { jsonResponse, methodNotAllowed, withAuth } from "./_shared";

const authedHandler: Handler = withAuth(async (event) => {
  if (event.httpMethod !== "POST") {
    return methodNotAllowed();
  }

  try {
    const body = JSON.parse(event.body ?? "{}") as SessionPlanInput;
    const reactor = new GenerateSessionPlanReactor();
    const response: SessionPlanResponse = {
      session: await reactor.process(body)
    };
    return jsonResponse(200, response);
  } catch (error) {
    return jsonResponse(400, {
      error:
        error instanceof Error ? error.message : "Generating session plan failed."
    });
  }
});

export const handler = authedHandler;
