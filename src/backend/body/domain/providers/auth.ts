import { SignJWT, jwtVerify } from "jose";
import type { UserProfile } from "../../../../shared/types";

const encoder = new TextEncoder();
const SESSION_COOKIE = "jbsapp_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 28;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET is not configured.");
  }
  return encoder.encode(secret);
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

export async function createSessionToken(profile: UserProfile): Promise<string> {
  return await new SignJWT({
    sub: profile.id,
    email: profile.email,
    username: profile.username
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<UserProfile> {
  const { payload } = await jwtVerify(token, getSecret());
  return {
    id: String(payload.sub),
    email: String(payload.email),
    username: String(payload.username)
  };
}

export function buildSessionCookie(token: string): string {
  return [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=2419200",
    process.env.NODE_ENV === "production" ? "Secure" : ""
  ]
    .filter(Boolean)
    .join("; ");
}

export function buildExpiredSessionCookie(): string {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    process.env.NODE_ENV === "production" ? "Secure" : ""
  ]
    .filter(Boolean)
    .join("; ");
}

export function isAcceptedOtp(otp: string): boolean {
  const secretOtp = process.env.AUTH_SECRET_OTP;
  if (!secretOtp) {
    throw new Error("AUTH_SECRET_OTP is not configured.");
  }
  return otp === secretOtp;
}
