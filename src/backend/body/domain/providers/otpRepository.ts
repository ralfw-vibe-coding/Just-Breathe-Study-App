import { createHash, randomInt, randomUUID } from "node:crypto";
import { getPool } from "./database";
import { ensureSchema } from "./schema";

const OTP_TTL_MINUTES = 15;

function hashOtp(email: string, otp: string): string {
  return createHash("sha256")
    .update(`${email.toLowerCase()}::${otp}`)
    .digest("hex");
}

export function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

export async function createOtpChallenge(email: string, otp: string): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  const normalizedEmail = email.toLowerCase();

  await pool.query(
    `
      update otp_challenges
      set consumed_at = now()
      where email = $1 and consumed_at is null
    `,
    [normalizedEmail]
  );

  await pool.query(
    `
      insert into otp_challenges (id, email, otp_hash, expires_at)
      values ($1, $2, $3, now() + ($4 || ' minutes')::interval)
    `,
    [randomUUID(), normalizedEmail, hashOtp(normalizedEmail, otp), OTP_TTL_MINUTES.toString()]
  );
}

export async function verifyOtpChallenge(email: string, otp: string): Promise<boolean> {
  await ensureSchema();
  const pool = getPool();
  const normalizedEmail = email.toLowerCase();
  const otpHash = hashOtp(normalizedEmail, otp);

  const result = await pool.query<{ id: string }>(
    `
      select id
      from otp_challenges
      where email = $1
        and otp_hash = $2
        and consumed_at is null
        and expires_at > now()
      order by created_at desc
      limit 1
    `,
    [normalizedEmail, otpHash]
  );

  if (!result.rowCount) {
    return false;
  }

  await pool.query(
    `
      update otp_challenges
      set consumed_at = now()
      where id = $1
    `,
    [result.rows[0]!.id]
  );

  return true;
}
