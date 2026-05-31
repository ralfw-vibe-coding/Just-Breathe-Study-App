import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

let manualPromise: Promise<string> | null = null;

export async function loadTrainingManual(): Promise<string> {
  if (!manualPromise) {
    manualPromise = readFile(
      resolve(process.cwd(), "runtime/knowledge/manual.txt"),
      "utf8"
    );
  }

  return await manualPromise;
}
