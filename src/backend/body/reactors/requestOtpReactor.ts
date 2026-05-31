import { createOtpChallenge, generateOtp } from "../domain/providers/otpRepository";
import { sendOtpEmail } from "../domain/providers/emailProvider";

export interface RequestOtpRequest {
  email: string;
}

export class RequestOtpReactor {
  async process(request: RequestOtpRequest): Promise<void> {
    const normalizedEmail = request.email.trim().toLowerCase();
    const otp = generateOtp();
    await createOtpChallenge(normalizedEmail, otp);
    await sendOtpEmail(normalizedEmail, otp);
  }
}
