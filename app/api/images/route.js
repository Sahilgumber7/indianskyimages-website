// app/api/images/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import Image from "../../../models/Image";

export async function GET() {
  try {
    await connectDB();
    const images = await Image.find(
      {},
      "image_url uploaded_by uploaded_at latitude longitude location_name"
    )
      .sort({ uploaded_at: -1 })
      .lean();

    return NextResponse.json(
      { data: images },
      {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}
