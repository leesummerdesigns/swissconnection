import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Use custom domain when verified, fall back to Resend's shared domain which works without DNS setup
const FROM_EMAIL =
  process.env.EMAIL_FROM || "The Swiss Connection <onboarding@resend.dev>";

// Construct the base URL: prefer NEXTAUTH_URL (explicit), then VERCEL_URL (injected by Vercel), then localhost
function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")) {
    return process.env.NEXTAUTH_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${getBaseUrl()}/de/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your email — The Swiss Connection",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #008489;">Welcome to The Swiss Connection!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a
          href="${verifyUrl}"
          style="display: inline-block; background: #008489; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;"
        >
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${getBaseUrl()}/de/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your password — The Swiss Connection",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #008489;">Password Reset</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a
          href="${resetUrl}"
          style="display: inline-block; background: #008489; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;"
        >
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
