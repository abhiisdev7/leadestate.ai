import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { runFullSeed } from "@/lib/seed/full";

export async function POST() {
  try {
    await connectDB();
    const { propertiesCount, leadsCount } = await runFullSeed();
    return NextResponse.json({
      success: true,
      message: `Seeded ${propertiesCount} properties and ${leadsCount} leads (2 inbound, 2 outbound) with suggested_properties refs`,
      propertiesCount,
      leadsCount,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
