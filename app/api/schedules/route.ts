import { NextResponse } from "next/server";
import { connectDB, Schedule } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    const schedules = await Schedule.find({ status: { $ne: "cancelled" } })
      .populate("contact", "name phone email")
      .populate("lead", "intent status budget location")
      .sort({ date: 1, time: 1 })
      .lean();

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Schedules fetch error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
