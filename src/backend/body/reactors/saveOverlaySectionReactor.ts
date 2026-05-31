import { saveFavorites, saveNotes, saveTags } from "../domain/providers/overlayRepository";

export class SaveOverlaySectionReactor {
  async saveFavorites(userId: string, favorites: string[]): Promise<void> {
    await saveFavorites(userId, favorites);
  }

  async saveTags(userId: string, tags: Record<string, string[]>): Promise<void> {
    await saveTags(userId, tags);
  }

  async saveNotes(userId: string, notes: Record<string, string>): Promise<void> {
    await saveNotes(userId, notes);
  }
}
