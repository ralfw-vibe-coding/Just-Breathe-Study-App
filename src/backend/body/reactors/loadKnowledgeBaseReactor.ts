import type { KnowledgeBase } from "../../../shared/types";
import base from "../../../../runtime/knowledge/base.json";

export class LoadKnowledgeBaseReactor {
  async process(): Promise<KnowledgeBase> {
    return base as KnowledgeBase;
  }
}
