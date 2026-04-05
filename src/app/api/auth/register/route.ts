import { NextResponse } from "next/server";

import { createUser } from "@/lib/auth/user-store";
import { sendOTP, verifyOTP } from "@/lib/auth/otp-service";

type RegisterBody = {
  action?: "send-otp" | "verify-and-register";
  name?: string;
  email?: string;
  password?: string;
  otp?: string;
  otpToken?: string;
};

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const { action } = body;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const otp = body.otp?.trim() ?? "";
    const otpToken = body.otpToken ?? "";

    // Validate action
    if (!action || !["send-otp", "verify-and-register"].includes(action)) {
      return badRequest("Invalid action");
    }

    // Validate email first (required for both actions)
    if (!email || !validateEmail(email)) {
      return badRequest("Enter a valid email address.");
    }

    // Handle send-otp action
    if (action === "send-otp") {
      const result = await sendOTP(email);
      if (result.success) {
        return NextResponse.json(
          { message: result.message, otpToken: result.token },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: result.message },
          { status: 400 }
        );
      }
    }

    // Handle verify-and-register action
    if (action === "verify-and-register") {
      // Validate all required fields for registration
      if (name.length < 2) {
        return badRequest("Name must be at least 2 characters.");
      }

      if (password.length < 8) {
        return badRequest("Password must be at least 8 characters.");
      }

      if (!otp || otp.length !== 6) {
        return badRequest("Please enter a valid 6-digit code.");
      }

      if (!otpToken) {
        return badRequest("Verification session expired. Please request a new code.");
      }

      // Verify OTP using JWT token
      const otpValid = verifyOTP(otpToken, otp, email);
      if (!otpValid) {
        return NextResponse.json(
          { error: "Invalid or expired verification code. Please try again." },
          { status: 400 }
        );
      }

      // Create user in Supabase
      const user = await createUser({ name, email, password });

      return NextResponse.json(
        {
          message: "User registered successfully",
          user: { id: user.id, email: user.email, name: user.name },
        },
        { status: 201 }
      );
    }

    return badRequest("Invalid request");
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle specific error types
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return badRequest("This email is already registered. Please sign in.", 409);
    }

    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}