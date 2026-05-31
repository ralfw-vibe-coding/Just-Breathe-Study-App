import type { SessionResponse } from "../../../shared/types";
import { ApiClient } from "../external/apiClient";

export class LoginReactor {
  constructor(private readonly apiClient: ApiClient) {}

  async process(email: string, otp: string): Promise<SessionResponse> {
    return await this.apiClient.login(email, otp);
  }

  async requestOtp(email: string): Promise<void> {
    await this.apiClient.requestOtp(email);
  }
}
