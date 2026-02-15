import { NextResponse } from "next/server";
import { runEmailObserver } from "@/lib/email/imap-observer";

export const maxDuration = 60;

/**
 * Cron endpoint to run the email observer (checks for cancellation replies).
 * Protect with CRON_SECRET: add "Authorization: Bearer <CRON_SECRET>" header.
 * Vercel Cron: add to vercel.json crons array.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { processed, cancelled } = await runEmailObserver();
    return NextResponse.json({ ok: true, processed, cancelled });
  } catch (err) {
    console.error("Email observer cron error:", err);
    return NextResponse.json(
      { error: String(err instanceof Error ? err.message : err) },
      { status: 500 }
    );
  }
}
