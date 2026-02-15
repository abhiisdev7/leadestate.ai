import { NextResponse } from "next/server";
import { connectDB, Property } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const property = await Property.findById(id).lean();

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Property fetch error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["active", "sold", "archived"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be active, sold, or archived." },
        { status: 400 }
      );
    }

    await connectDB();

    const property = await Property.findByIdAndUpdate(
      id,
      { $set: { status } },
      { returnDocument: "after" }
    ).lean();

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Property update error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
