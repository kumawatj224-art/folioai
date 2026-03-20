import { NextResponse } from "next/server";

import { createUser, normalizeEmail } from "@/lib/auth/user-store";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

function badRequest(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (name.length < 2) {
    return badRequest("Name must be at least 2 characters.");
  }

  if (!email.includes("@")) {
    return badRequest("Enter a valid email address.");
  }

  if (password.length < 8) {
    return badRequest("Password must be at least 8 characters.");
  }

  try {
    const user = await createUser({
      name,
      email: normalizeEmail(email),
      password,
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return badRequest("An account with this email already exists.", 409);
    }

    return badRequest("Unable to create your account right now.", 500);
  }
}