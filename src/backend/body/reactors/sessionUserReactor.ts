import type { HandlerEvent } from "@netlify/functions";
import type { UserProfile } from "../../../shared/types";
import {
  getSessionCookieName,
  verifySessionToken
} from "../domain/providers/auth";

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) {
      return acc;
    }
    acc[rawKey] = rest.join("=");
    return acc;
  }, {});
}

export class SessionUserReactor {
  async process(event: HandlerEvent): Promise<UserProfile | null> {
    const cookies = parseCookies(event.headers.cookie);
    const token = cookies[getSessionCookieName()];
    if (!token) {
      return null;
    }

    try {
      return await verifySessionToken(token);
    } catch {
      return null;
    }
  }
}
