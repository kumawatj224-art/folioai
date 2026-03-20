import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      data: [],
      message: "Portfolio listing endpoint is scaffolded but not implemented yet.",
    },
    {
      status: 501,
    },
  );
}
