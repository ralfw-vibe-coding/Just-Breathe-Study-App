import type { UserProfile } from "../../../shared/types";
import {
  createSessionToken,
  isAcceptedOtp
} from "../domain/providers/auth";
import {
  createUserForEmail,
  findUserByEmail
} from "../domain/providers/userRepository";

export interface LoginRequest {
  email: string;
  otp: string;
}

export interface LoginResponse {
  profile: UserProfile;
  token: string;
}

export class LoginWithSecretOtpReactor {
  async process(request: LoginRequest): Promise<LoginResponse> {
    if (!isAcceptedOtp(request.otp)) {
      throw new Error("Invalid OTP.");
    }

    const normalizedEmail = request.email.trim().toLowerCase();
    const user =
      (await findUserByEmail(normalizedEmail)) ??
      (await createUserForEmail(normalizedEmail));
    const token = await createSessionToken(user);
    return { profile: user, token };
  }
}
