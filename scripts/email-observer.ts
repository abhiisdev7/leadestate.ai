#!/usr/bin/env npx tsx
import "dotenv/config";

/**
 * Email observer script – polls IMAP inbox for replies to meeting confirmations,
 * detects cancellation intent, cancels meetings, updates CRM, and replies in thread.
 *
 * Run: npm run email-observer
 * Or: npx tsx scripts/email-observer.ts
 */

import cron from "node-cron";
import { runEmailObserver } from "../lib/email/imap-observer";

const POLL_INTERVAL_CRON = process.env.EMAIL_OBSERVER_CRON ?? "*/10 * * * *"; // every 10 min

async function tick(): Promise<void> {
  try {
    const { processed, cancelled } = await runEmailObserver();
    if (processed > 0) {
      console.log(
        `[${new Date().toISOString()}] Processed ${processed} email(s), cancelled ${cancelled} meeting(s)`
      );
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Email observer error:`, err);
  }
}

function main(): void {
  console.log(
    `[${new Date().toISOString()}] Starting email observer (cron: ${POLL_INTERVAL_CRON})`
  );

  cron.schedule(POLL_INTERVAL_CRON, tick);

  tick();
}

main();
