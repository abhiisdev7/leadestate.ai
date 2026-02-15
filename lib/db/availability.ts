import { Schedule } from "@/lib/db";

const BUSINESS_HOURS = { start: 9, end: 17 };
const SLOT_INTERVAL_MINUTES = 30;
const DAYS_AHEAD = 14;

function getNextWeekdays(count: number): string[] {
  const dates: string[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  let added = 0;
  while (added < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(d.toISOString().slice(0, 10));
      added++;
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = BUSINESS_HOURS.start; h < BUSINESS_HOURS.end; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL_MINUTES) {
      const hour = h;
      const min = m;
      const period = hour >= 12 ? "PM" : "AM";
      const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      slots.push(`${hour12}:${min.toString().padStart(2, "0")} ${period}`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

export async function getAvailableSlots(limit = 6): Promise<Array<{ date: string; time: string }>> {
  const dates = getNextWeekdays(DAYS_AHEAD);
  const booked = await Schedule.find({
    status: { $in: ["confirmed", "proposed"] },
    date: { $in: dates },
  })
    .select("date time")
    .lean();

  const bookedSet = new Set(booked.map((b) => `${b.date}|${normalizeTime(b.time)}`));

  const available: Array<{ date: string; time: string }> = [];
  for (const date of dates) {
    for (const time of TIME_SLOTS) {
      if (bookedSet.has(`${date}|${normalizeTime(time)}`)) continue;
      available.push({ date, time });
      if (available.length >= limit) return available;
    }
  }
  return available;
}

function normalizeTime(t: string): string {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return t;
  let h = parseInt(m[1], 10);
  const min = m[2];
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  return `${h.toString().padStart(2, "0")}:${min}`;
}
