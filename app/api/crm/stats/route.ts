import { NextResponse } from "next/server";
import { connectDB, Lead, Schedule } from "@/lib/db";

const RANGES = { week: 7, monthly: 30, yearly: 365 } as const;

function toDateKey(val: Date | string): string {
  if (typeof val === "string") return val.slice(0, 10);
  return new Date(val).toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rangeKey = (searchParams.get("range") ?? "monthly") as keyof typeof RANGES;
    const days = RANGES[rangeKey] ?? RANGES.monthly;

    await connectDB();

    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setDate(end.getDate() + Math.min(days, 14));
    end.setHours(23, 59, 59, 999);

    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const [leads, schedules] = await Promise.all([
      Lead.find({ createdAt: { $gte: start, $lte: end } })
        .select("createdAt")
        .lean(),
      Schedule.find({
        status: { $ne: "cancelled" },
        date: { $gte: startStr, $lte: endStr },
      })
        .select("date")
        .lean(),
    ]);

    const leadsByDate: Record<string, number> = {};
    const meetingsByDate: Record<string, number> = {};

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      leadsByDate[key] = 0;
      meetingsByDate[key] = 0;
    }

    for (const l of leads) {
      const key = toDateKey(l.createdAt as Date | string);
      if (key in leadsByDate) leadsByDate[key]++;
    }

    for (const s of schedules) {
      const key = (s as { date: string }).date;
      if (key in meetingsByDate) meetingsByDate[key]++;
    }

    let chartData: Array<{ date: string; label: string; leads: number; meetings: number }>;

    if (days > 90) {
      const byMonth: Record<string, { leads: number; meetings: number }> = {};
      for (const [date, count] of Object.entries(leadsByDate)) {
        const key = date.slice(0, 7);
        if (!byMonth[key]) byMonth[key] = { leads: 0, meetings: 0 };
        byMonth[key].leads += count;
      }
      for (const [date, count] of Object.entries(meetingsByDate)) {
        const key = date.slice(0, 7);
        if (!byMonth[key]) byMonth[key] = { leads: 0, meetings: 0 };
        byMonth[key].meetings += count;
      }
      chartData = Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({
          date,
          label: new Date(date + "-01T12:00:00").toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          leads: v.leads,
          meetings: v.meetings,
        }));
    } else {
      chartData = Object.keys(leadsByDate)
        .sort()
        .map((date) => ({
          date,
          label: new Date(date + "T12:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          leads: leadsByDate[date] ?? 0,
          meetings: meetingsByDate[date] ?? 0,
        }));
    }

    const dateRangeLabel =
      days > 90
        ? `${new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
        : `${new Date(startStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${new Date(endStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    return NextResponse.json({
      chartData,
      range: rangeKey,
      days,
      dateRangeLabel,
    });
  } catch (error) {
    console.error("CRM stats error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
