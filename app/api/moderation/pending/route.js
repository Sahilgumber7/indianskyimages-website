import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Image from "../../../../models/Image";

function isAdminRequest(req) {
  const adminKey = process.env.ADMIN_REVIEW_KEY;
  if (!adminKey) return false;
  const headerKey = req.headers.get("x-admin-key");
  return Boolean(headerKey && headerKey === adminKey);
}

export async function GET(req) {
  try {
    if (!isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const queue = await Image.find(
      {
        $or: [{ moderation_status: "pending" }, { is_flagged: true }],
      },
      "image_url uploaded_by uploaded_at location_name report_count moderation_status is_flagged"
    )
      .sort({ report_count: -1, uploaded_at: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({ data: queue });
  } catch (err) {
    console.error("Moderation queue error:", err);
    return NextResponse.json({ error: "Failed to fetch moderation queue." }, { status: 500 });
  }
}
