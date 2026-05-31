import type { Handler } from "@netlify/functions";
import { buildSessionCookie } from "../../src/backend/body/domain/providers/auth";
import { LoginWithSecretOtpReactor } from "../../src/backend/body/reactors/loginWithSecretOtpReactor";
import { jsonResponse, methodNotAllowed } from "./_shared";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return methodNotAllowed();
  }

  try {
    const body = JSON.parse(event.body ?? "{}") as {
      email?: string;
      otp?: string;
    };

    if (!body.email || !body.otp) {
      return jsonResponse(400, { error: "Email and OTP are required." });
    }

    const reactor = new LoginWithSecretOtpReactor();
    const { profile, token } = await reactor.process({
      email: body.email,
      otp: body.otp
    });

    return jsonResponse(
      200,
      { profile },
      { "Set-Cookie": buildSessionCookie(token) }
    );
  } catch (error) {
    return jsonResponse(401, {
      error: error instanceof Error ? error.message : "Login failed."
    });
  }
};
