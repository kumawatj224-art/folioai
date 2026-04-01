import { supabase } from "@/lib/supabase/client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@folioai.com";
const RESEND_FROM_NAME = "FolioAI";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;
const RESEND_LIMIT_MINUTES = 1; // Prevent spam

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if email has sent OTP recently (rate limiting)
 */
async function checkRateLimit(email: string): Promise<boolean> {
  try {
    const oneMinuteAgo = new Date(Date.now() - RESEND_LIMIT_MINUTES * 60 * 1000).toISOString();

    const { data, count } = await supabase
      .from("otp_verifications")
      .select("id", { count: "exact" })
      .eq("email", email.toLowerCase())
      .gt("created_at", oneMinuteAgo);

    // If there's a recent OTP, don't allow resend
    return (count || 0) === 0;
  } catch (error) {
    console.error("❌ Rate limit check error:", error);
    return true; // Allow on error
  }
}

export async function sendOTP(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Rate limiting check
    const allowed = await checkRateLimit(email);
    if (!allowed) {
      return {
        success: false,
        message: `Please wait ${RESEND_LIMIT_MINUTES} minute(s) before requesting another code`,
      };
    }

    const otp = generateOTP();

    // Save OTP to database
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const { error: dbError } = await supabase.from("otp_verifications").insert([
      {
        email: email.toLowerCase(),
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
      },
    ]);

    if (dbError) {
      console.error("❌ Failed to save OTP to database:", dbError);
      return { success: false, message: "Failed to save verification code to database" };
    }

    console.log(`✅ OTP generated for ${email}: ${otp} (expires in ${OTP_EXPIRY_MINUTES} min)`);

    // Send email via Resend
    try {
      const response = await resend.emails.send({
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
                  ${RESEND_FROM_NAME} | noreply@folioai.com<br>
                  © 2026 All Rights Reserved
                </p>
              </div>
            </div>
          </div>
        `,
      });

      console.log(`✅ Email sent successfully to ${email}`, response);
      return { success: true, message: "Verification code sent to your email" };
    } catch (emailError: any) {
      console.error("❌ Resend API error:", {
        message: emailError.message,
        status: emailError.status,
        details: emailError,
      });

      return {
        success: false,
        message:
          emailError.message?.includes("invalid_api_key")
            ? "Email service configuration error"
            : "Failed to send verification email. Please try again.",
      };
    }
  } catch (error) {
    console.error("❌ Error in sendOTP:", error);
    return { success: false, message: "An unexpected error occurred. Please try again." };
  }
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  try {
    // Validate inputs
    if (!email || !otp || otp.length !== 6) {
      console.warn("❌ Invalid OTP input - email or otp missing/invalid length");
      return false;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { data, error } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.warn("❌ No OTP record found for email:", normalizedEmail);
      return false;
    }

    if (!data) {
      console.warn("❌ OTP data is empty");
      return false;
    }

    // Check if already verified
    if (data.verified) {
      console.warn("❌ OTP already verified for email:", normalizedEmail);
      return false;
    }

    // Check if expired
    const currentTime = new Date();
    const expiryTime = new Date(data.expires_at);
    if (currentTime > expiryTime) {
      console.warn("❌ OTP expired for email:", normalizedEmail);
      return false;
    }

    // Check if max attempts exceeded
    if (data.attempts >= MAX_ATTEMPTS) {
      console.warn("❌ Max OTP attempts exceeded for email:", normalizedEmail);
      return false;
    }

    // Check if OTP matches (case-sensitive comparison for security)
    const otpMatches = data.otp_code === otp.trim();

    if (!otpMatches) {
      // Increment attempts
      const newAttempts = data.attempts + 1;
      const { error: updateError } = await supabase
        .from("otp_verifications")
        .update({ attempts: newAttempts })
        .eq("id", data.id);

      if (updateError) {
        console.error("❌ Failed to update OTP attempts:", updateError);
      }

      console.warn(
        `❌ OTP mismatch for ${normalizedEmail}. Attempts: ${newAttempts}/${MAX_ATTEMPTS}`
      );
      return false;
    }

    // Mark as verified
    const { error: verifyError } = await supabase
      .from("otp_verifications")
      .update({ verified: true })
      .eq("id", data.id);

    if (verifyError) {
      console.error("❌ Failed to mark OTP as verified:", verifyError);
      return false;
    }

    console.log(`✅ OTP verified successfully for ${normalizedEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    return false;
  }
}
