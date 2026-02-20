import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/db";
import Image from "../../../../../models/Image";

export async function POST(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const image = await Image.findById(id, "report_count moderation_status").lean();
    if (!image || (image.moderation_status && image.moderation_status !== "approved")) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    const nextCount = (image.report_count || 0) + 1;
    const updated = await Image.findByIdAndUpdate(
      id,
      {
        $inc: { report_count: 1 },
        $set: { is_flagged: nextCount >= 3 },
      },
      { new: true, projection: { report_count: 1, is_flagged: 1 } }
    ).lean();

    return NextResponse.json({
      report_count: updated?.report_count || nextCount,
      is_flagged: Boolean(updated?.is_flagged),
    });
  } catch (err) {
    console.error("Report image error:", err);
    return NextResponse.json({ error: "Failed to report image." }, { status: 500 });
  }
}
