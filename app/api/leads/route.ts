import { NextResponse } from "next/server";
import { connectDB, Lead } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    const leads = await Lead.find()
      .populate("suggested_properties")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Leads fetch error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
