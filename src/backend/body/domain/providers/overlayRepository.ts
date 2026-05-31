import type { OverlayPayload } from "../../../../shared/types";
import { getPool } from "./database";
import { ensureSchema } from "./schema";

const DEFAULT_OVERLAY: OverlayPayload = {
  favorites: [],
  tags: {},
  notes: {},
  studyDeck: {
    currentSession: 1,
    cards: {}
  }
};

export async function getOverlayForUser(userId: string): Promise<OverlayPayload> {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<{
    favorites_json: string[];
    tags_json: Record<string, string[]>;
    notes_json: Record<string, string>;
    study_deck_json: OverlayPayload["studyDeck"];
  }>(
    `
      select favorites_json, tags_json, notes_json, study_deck_json
      from user_overlays
      where user_id = $1
    `,
    [userId]
  );

  if (!result.rowCount) {
    await pool.query(
      "insert into user_overlays (user_id) values ($1) on conflict (user_id) do nothing",
      [userId]
    );
    return DEFAULT_OVERLAY;
  }

  const row = result.rows[0]!;
  return {
    favorites: row.favorites_json ?? [],
    tags: row.tags_json ?? {},
    notes: row.notes_json ?? {},
    studyDeck: row.study_deck_json ?? DEFAULT_OVERLAY.studyDeck
  };
}

export async function saveFavorites(userId: string, favorites: string[]): Promise<void> {
  await saveOverlaySection(userId, "favorites_json", favorites);
}

export async function saveTags(
  userId: string,
  tags: Record<string, string[]>
): Promise<void> {
  await saveOverlaySection(userId, "tags_json", tags);
}

export async function saveNotes(
  userId: string,
  notes: Record<string, string>
): Promise<void> {
  await saveOverlaySection(userId, "notes_json", notes);
}

async function saveOverlaySection(
  userId: string,
  column: "favorites_json" | "tags_json" | "notes_json",
  value: unknown
): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  await pool.query(
    `
      insert into user_overlays (user_id, ${column})
      values ($1, $2::jsonb)
      on conflict (user_id)
      do update set ${column} = excluded.${column}, updated_at = now()
    `,
    [userId, JSON.stringify(value)]
  );
}
