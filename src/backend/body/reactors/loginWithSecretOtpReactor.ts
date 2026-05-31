import type { UserProfile } from "../../../shared/types";
import {
  createSessionToken,
  isAcceptedOtp
} from "../domain/providers/auth";
import { verifyOtpChallenge } from "../domain/providers/otpRepository";
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
    const normalizedEmail = request.email.trim().toLowerCase();
    const secretOtpAccepted = isAcceptedOtp(request.otp);
    const emailedOtpAccepted = await verifyOtpChallenge(normalizedEmail, request.otp);

    if (!secretOtpAccepted && !emailedOtpAccepted) {
      throw new Error("Invalid OTP.");
    }

    const user =
      (await findUserByEmail(normalizedEmail)) ??
      (await createUserForEmail(normalizedEmail));
    const token = await createSessionToken(user);
    return { profile: user, token };
  }
}
