import type { KnowledgeBase, OverlayResponse } from "../../../shared/types";
import { ApiClient } from "../external/apiClient";

export interface BootstrapState {
  base: KnowledgeBase;
  overlay: OverlayResponse;
}

export class BootstrapAppReactor {
  constructor(private readonly apiClient: ApiClient) {}

  async process(): Promise<BootstrapState> {
    let base: KnowledgeBase;
    try {
      base = await this.apiClient.getBase();
    } catch (error) {
      throw new Error(
        `Loading the knowledge base failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`
      );
    }

    let overlay: OverlayResponse;
    try {
      overlay = await this.apiClient.getOverlay();
    } catch (error) {
      throw new Error(
        `Loading your personal overlay failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`
      );
    }

    return { base, overlay };
  }
}
