import { NextResponse } from "next/server";

function notImplemented() {
  return NextResponse.json(
    {
      message: "Auth is scaffolded but not implemented yet.",
    },
    {
      status: 501,
    },
  );
}

export async function GET() {
  return notImplemented();
}

export async function POST() {
  return notImplemented();
}
