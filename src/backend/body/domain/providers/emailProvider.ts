import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const from = process.env.AUTH_FROM_EMAIL;
  if (!from) {
    throw new Error("AUTH_FROM_EMAIL is not configured.");
  }

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from,
    to: [email],
    subject: "Your Just Breathe Study App OTP",
    text: `Your Just Breathe Study App OTP is: ${otp}\n\nIt expires in 15 minutes.`,
    html: `<p>Your Just Breathe Study App OTP is:</p><p style="font-size:24px;font-weight:700;">${otp}</p><p>It expires in 15 minutes.</p>`
  });

  if (error) {
    throw new Error(error.message);
  }
}
