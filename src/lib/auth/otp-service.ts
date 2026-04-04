import jwt from "jsonwebtoken";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@folioai.com";
const RESEND_FROM_NAME = "FolioAI";

const OTP_EXPIRY_MINUTES = 10;
const JWT_SECRET = process.env.JWT_SECRET;

type OTPPayload = {
  email: string;
  otp: string;
  exp: number;
};

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return JWT_SECRET;
}

export async function sendOTP(email: string): Promise<{ success: boolean; message: string; token?: string }> {
  try {
    const otp = generateOTP();
    const normalizedEmail = email.toLowerCase().trim();

    // Sign JWT containing { email, otp, exp }
    const expiresInSeconds = OTP_EXPIRY_MINUTES * 60;
    const token = jwt.sign(
      { email: normalizedEmail, otp } as Omit<OTPPayload, "exp">,
      getJwtSecret(),
      { expiresIn: expiresInSeconds }
    );

    console.log(`✅ Generated OTP for ${normalizedEmail} (expires in ${OTP_EXPIRY_MINUTES} min)`);

    // Send email via Resend
    // NOTE: Resend SDK v3 does NOT throw on API errors — it returns { data, error }
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: email,
      subject: "Your FolioAI Verification Code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; padding: 0; margin: 0; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="font-size: 28px; font-weight: bold; color: #007bff; margin-bottom: 8px;">
                ${RESEND_FROM_NAME}
              </div>
              <p style="color: #999; font-size: 14px; margin: 0;">Email Verification</p>
            </div>

            <!-- Main Content -->
            <h2 style="font-size: 24px; font-weight: 600; margin: 0 0 16px 0; color: #1f2937;">Verify Your Email</h2>
            <p style="font-size: 16px; color: #666; margin: 0 0 24px 0; line-height: 1.5;">
              Thank you for signing up! Enter the verification code below to complete your account setup.
            </p>

            <!-- OTP Code -->
            <div style="background-color: #f3f4f6; border: 2px dashed #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 32px 0;">
              <p style="color: #999; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
              <h1 style="color: #007bff; letter-spacing: 6px; font-size: 36px; margin: 0; font-family: 'Courier New', monospace; font-weight: bold;">
                ${otp}
              </h1>
            </div>

            <!-- Expiry Info -->
            <p style="font-size: 14px; color: #666; margin: 0 0 24px 0;">
              This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
            </p>

            <!-- Security Warning -->
            <div style="background-color: #fef3c7; border-left: 4px solid #fbbf24; padding: 12px; border-radius: 4px; margin: 24px 0;">
              <p style="color: #92400e; font-size: 13px; margin: 0;">
                <strong>⚠️ Security Tip:</strong> Never share this code with anyone. ${RESEND_FROM_NAME} will never ask for it.
              </p>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
              <p style="color: #999; font-size: 12px; margin: 0 0 8px 0;">
                Didn't request this code? 
              </p>
              <p style="color: #999; font-size: 12px; margin: 0;">
                Please ignore this email or contact support if you have concerns.
              </p>
            </div>

            <!-- Company Info -->
            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #999; font-size: 11px; margin: 0;">
                ${RESEND_FROM_NAME} | ${RESEND_FROM_EMAIL}<br>
                © 2026 All Rights Reserved
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (emailError) {
      console.error("❌ Resend API error:", {
        name: emailError.name,
        message: emailError.message,
      });

      return {
        success: false,
        message:
          emailError.message?.includes("invalid_api_key")
            ? "Email service configuration error"
            : `Failed to send verification email: ${emailError.message}`,
      };
    }

    console.log(`✅ Email sent successfully to ${email} (id: ${emailData?.id})`);
    return { success: true, message: "Verification code sent to your email", token };
  } catch (error) {
    console.error("❌ Error in sendOTP:", error);
    return { success: false, message: "An unexpected error occurred. Please try again." };
  }
}

export function verifyOTP(token: string, inputOtp: string, email: string): boolean {
  try {
    // Validate inputs
    if (!token || !inputOtp || inputOtp.length !== 6 || !email) {
      console.warn("❌ Invalid OTP verification input");
      return false;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const submittedOTP = inputOtp.trim();

    // Verify JWT signature and decode — jwt.verify throws if expired or invalid
    const decoded = jwt.verify(token, getJwtSecret()) as OTPPayload;

    // Check email matches
    if (decoded.email !== normalizedEmail) {
      console.warn("❌ Email mismatch in OTP token");
      return false;
    }

    // Compare OTP
    const storedOTP = String(decoded.otp).trim();
    const otpMatches = storedOTP === submittedOTP;

    if (!otpMatches) {
      console.warn(`❌ OTP mismatch for ${normalizedEmail}`);
      return false;
    }

    console.log(`✅ OTP verified successfully for ${normalizedEmail}`);
    return true;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      console.warn("❌ OTP token expired");
    } else if (error.name === "JsonWebTokenError") {
      console.warn("❌ Invalid OTP token:", error.message);
    } else {
      console.error("❌ Error verifying OTP:", error);
    }
    return false;
  }
}
