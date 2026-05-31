import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { KnowledgeBase } from "../../../shared/types";

export class LoadKnowledgeBaseReactor {
  async process(): Promise<KnowledgeBase> {
    const path = resolve(process.cwd(), "runtime/knowledge/base.json");
    const content = await readFile(path, "utf8");
    return JSON.parse(content) as KnowledgeBase;
  }
}
