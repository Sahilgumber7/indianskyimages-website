import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Image from "../../../../models/Image";

function isAdminRequest(req) {
  const adminKey = process.env.ADMIN_REVIEW_KEY;
  if (!adminKey) return false;
  const headerKey = req.headers.get("x-admin-key");
  return Boolean(headerKey && headerKey === adminKey);
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const image = await Image.findById(id).lean();
    if (!image) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    if (image.moderation_status && image.moderation_status !== "approved" && !isAdminRequest(req)) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    return NextResponse.json({ data: image });
  } catch (err) {
    console.error("Fetch image error:", err);
    return NextResponse.json({ error: "Failed to fetch image." }, { status: 500 });
  }
}
