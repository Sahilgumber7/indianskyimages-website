// app/api/images/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import Image from "../../../models/Image";

export async function GET() {
  try {
    await connectDB();
    const images = await Image.find().sort({ uploaded_at: -1 });
    return NextResponse.json({ data: images });
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}
