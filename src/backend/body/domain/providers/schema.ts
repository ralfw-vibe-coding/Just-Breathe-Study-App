import { getPool } from "./database";

let ensured = false;

export async function ensureSchema(): Promise<void> {
  if (ensured) {
    return;
  }

  const pool = getPool();
  await pool.query(`
    create table if not exists app_users (
      id uuid primary key,
      email text not null unique,
      username text not null unique,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);

  await pool.query(`
    create table if not exists user_overlays (
      user_id uuid primary key references app_users(id) on delete cascade,
      favorites_json jsonb not null default '[]'::jsonb,
      tags_json jsonb not null default '{}'::jsonb,
      study_deck_json jsonb not null default '{"currentSession":1,"cards":{}}'::jsonb,
      notes_json jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);

  ensured = true;
}
