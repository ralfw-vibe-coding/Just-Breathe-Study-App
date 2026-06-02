import type {
  SessionAudioJob,
  SessionAudioJobStatus
} from "../../../../shared/types";
import { getPool } from "./database";
import { ensureSchema } from "./schema";

type SessionAudioJobRow = {
  job_id: string;
  status: SessionAudioJobStatus;
  progress: number;
  logs_json: unknown;
  error: string | null;
  audio_base64: string | null;
  mime_type: string | null;
};

function sanitizeLogs(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function mapJobRow(row: SessionAudioJobRow): SessionAudioJob {
  return {
    jobId: row.job_id,
    status: row.status,
    progress: row.progress,
    logs: sanitizeLogs(row.logs_json),
    error: row.error,
    audioBase64: row.audio_base64 ?? undefined,
    mimeType: row.mime_type ?? undefined
  };
}

export async function upsertSessionAudioJob(
  userId: string,
  job: SessionAudioJob
): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  await pool.query(
    `
      insert into session_audio_jobs (
        user_id,
        job_id,
        status,
        progress,
        logs_json,
        error,
        audio_base64,
        mime_type,
        updated_at
      )
      values ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, now())
      on conflict (user_id) do update
      set
        job_id = excluded.job_id,
        status = excluded.status,
        progress = excluded.progress,
        logs_json = excluded.logs_json,
        error = excluded.error,
        audio_base64 = excluded.audio_base64,
        mime_type = excluded.mime_type,
        updated_at = now()
    `,
    [
      userId,
      job.jobId,
      job.status,
      job.progress,
      JSON.stringify(job.logs),
      job.error,
      job.audioBase64 ?? null,
      job.mimeType ?? null
    ]
  );
}

export async function getSessionAudioJobForUser(
  userId: string
): Promise<SessionAudioJob | null> {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<SessionAudioJobRow>(
    `
      select job_id, status, progress, logs_json, error, audio_base64, mime_type
      from session_audio_jobs
      where user_id = $1
    `,
    [userId]
  );

  if (!result.rowCount) {
    return null;
  }

  return mapJobRow(result.rows[0]!);
}

export async function updateSessionAudioJobIfCurrent(
  userId: string,
  jobId: string,
  patch: Partial<SessionAudioJob>
): Promise<void> {
  await ensureSchema();
  const current = await getSessionAudioJobForUser(userId);
  if (!current || current.jobId !== jobId) {
    return;
  }

  await upsertSessionAudioJob(userId, {
    ...current,
    ...patch,
    jobId
  });
}

export async function deleteSessionAudioJobForUser(userId: string): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  await pool.query("delete from session_audio_jobs where user_id = $1", [userId]);
}
