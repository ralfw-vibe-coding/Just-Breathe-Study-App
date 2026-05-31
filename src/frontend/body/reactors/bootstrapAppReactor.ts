import type { KnowledgeBase, OverlayResponse } from "../../../shared/types";
import { ApiClient } from "../external/apiClient";

export interface BootstrapState {
  base: KnowledgeBase;
  overlay: OverlayResponse;
}

export class BootstrapAppReactor {
  constructor(private readonly apiClient: ApiClient) {}

  async process(): Promise<BootstrapState> {
    const [base, overlay] = await Promise.all([
      this.apiClient.getBase(),
      this.apiClient.getOverlay()
    ]);

    return { base, overlay };
  }
}
