import type { OverlayResponse, UserProfile } from "../../../shared/types";
import { getOverlayForUser } from "../domain/providers/overlayRepository";

export class LoadOverlayReactor {
  async process(profile: UserProfile): Promise<OverlayResponse> {
    const overlay = await getOverlayForUser(profile.id);
    return {
      profile,
      overlay
    };
  }
}
