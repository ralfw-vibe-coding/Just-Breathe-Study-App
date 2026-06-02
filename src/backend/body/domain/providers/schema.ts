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

  await pool.query(`
    create table if not exists otp_challenges (
      id uuid primary key,
      email text not null,
      otp_hash text not null,
      expires_at timestamptz not null,
      consumed_at timestamptz,
      created_at timestamptz not null default now()
    );
  `);

  await pool.query(`
    create table if not exists session_audio_jobs (
      user_id uuid primary key references app_users(id) on delete cascade,
      job_id uuid not null,
      status text not null,
      progress integer not null default 0,
      logs_json jsonb not null default '[]'::jsonb,
      error text,
      audio_base64 text,
      mime_type text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);

  ensured = true;
}
