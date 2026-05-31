import type { UserProfile } from "../../../../shared/types";
import { randomUUID } from "node:crypto";
import { getPool } from "./database";
import { ensureSchema } from "./schema";

function baseUsername(email: string): string {
  return email.split("@")[0]!.trim().toLowerCase();
}

function timestampSuffix(): string {
  const date = new Date();
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<{
    id: string;
    email: string;
    username: string;
  }>(
    "select id, email, username from app_users where email = $1",
    [email.toLowerCase()]
  );
  if (!result.rowCount) {
    return null;
  }
  return result.rows[0]!;
}

export async function createUserForEmail(email: string): Promise<UserProfile> {
  await ensureSchema();
  const pool = getPool();
  const normalizedEmail = email.toLowerCase();
  let username = baseUsername(normalizedEmail);

  const existingUsername = await pool.query<{ id: string }>(
    "select id from app_users where username = $1",
    [username]
  );

  if (existingUsername.rowCount) {
    username = `${username}-${timestampSuffix()}`;
  }

  const inserted = await pool.query<{
    id: string;
    email: string;
    username: string;
  }>(
    `
      insert into app_users (id, email, username)
      values ($1, $2, $3)
      returning id, email, username
    `,
    [randomUUID(), normalizedEmail, username]
  );

  await pool.query(
    `
      insert into user_overlays (user_id)
      values ($1)
      on conflict (user_id) do nothing
    `,
    [inserted.rows[0]!.id]
  );
  return inserted.rows[0]!;
}
