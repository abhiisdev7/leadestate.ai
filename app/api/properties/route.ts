import { NextResponse } from "next/server";
import { connectDB, Property } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    const properties = await Property.find().sort({ price: 1 }).lean();

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Properties fetch error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

const requiredFields = ["address", "city", "state", "price", "beds", "baths"] as const;

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const price = Number(body.price);
    const beds = Number(body.beds);
    const baths = Number(body.baths);
    const sqft = body.sqft != null && body.sqft !== "" ? Number(body.sqft) : undefined;

    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }
    if (Number.isNaN(beds) || beds < 0) {
      return NextResponse.json({ error: "Invalid beds" }, { status: 400 });
    }
    if (Number.isNaN(baths) || baths < 0) {
      return NextResponse.json({ error: "Invalid baths" }, { status: 400 });
    }
    if (sqft != null && (Number.isNaN(sqft) || sqft < 0)) {
      return NextResponse.json({ error: "Invalid sqft" }, { status: 400 });
    }

    const features = Array.isArray(body.features)
      ? body.features.filter(Boolean)
      : typeof body.features === "string" && body.features.trim()
        ? body.features.split(",").map((s: string) => s.trim()).filter(Boolean)
        : undefined;

    const images = Array.isArray(body.images)
      ? body.images.filter(Boolean)
      : typeof body.images === "string" && body.images.trim()
        ? body.images.split(",").map((s: string) => s.trim()).filter(Boolean)
        : undefined;

    const property = await Property.create({
      address: String(body.address).trim(),
      city: String(body.city).trim(),
      state: String(body.state).trim(),
      price,
      beds,
      baths,
      ...(sqft != null && { sqft }),
      ...(features?.length && { features }),
      ...(images?.length && { images }),
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error("Property create error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
