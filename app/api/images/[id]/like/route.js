import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Image from "../../../../../models/Image";

export async function POST(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const existing = await Image.findById(id, "moderation_status").lean();
    if (!existing || (existing.moderation_status && existing.moderation_status !== "approved")) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    const updated = await Image.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true, projection: { likes: 1 } }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    return NextResponse.json({ likes: updated.likes });
  } catch (err) {
    console.error("Like image error:", err);
    return NextResponse.json({ error: "Failed to like image." }, { status: 500 });
  }
}
