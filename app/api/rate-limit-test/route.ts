import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Rate limit test passed",
    timestamp: new Date().toISOString(),
  });
}
