import type { UserProfile } from "../../../shared/types";
import { createSessionToken } from "../domain/providers/auth";
import { updateUsername } from "../domain/providers/userRepository";

export interface UpdateUsernameResponse {
  profile: UserProfile;
  token: string;
}

export class UpdateUsernameReactor {
  async process(userId: string, username: string): Promise<UpdateUsernameResponse> {
    const profile = await updateUsername(userId, username);
    const token = await createSessionToken(profile);
    return { profile, token };
  }
}
