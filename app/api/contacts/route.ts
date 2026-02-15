import { NextResponse } from "next/server";
import { connectDB, Contact } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Contacts fetch error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
