import type { Handler } from "@netlify/functions";
import { RequestOtpReactor } from "../../src/backend/body/reactors/requestOtpReactor";
import { jsonResponse, methodNotAllowed } from "./_shared";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return methodNotAllowed();
  }

  try {
    const body = JSON.parse(event.body ?? "{}") as { email?: string };
    if (!body.email) {
      return jsonResponse(400, { error: "Email is required." });
    }

    const reactor = new RequestOtpReactor();
    await reactor.process({ email: body.email });
    return jsonResponse(200, { ok: true });
  } catch (error) {
    return jsonResponse(500, {
      error:
        error instanceof Error ? `OTP request failed: ${error.message}` : "OTP request failed."
    });
  }
};
