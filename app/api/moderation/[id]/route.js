import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Image from "../../../../models/Image";

function isAdminRequest(req) {
  const adminKey = process.env.ADMIN_REVIEW_KEY;
  if (!adminKey) return false;
  const headerKey = req.headers.get("x-admin-key");
  return Boolean(headerKey && headerKey === adminKey);
}

export async function PATCH(req, { params }) {
  try {
    if (!isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const action = body?.action;
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    await connectDB();
    const update =
      action === "approve"
        ? {
            $set: {
              moderation_status: "approved",
              is_flagged: false,
              report_count: 0,
            },
          }
        : {
            $set: {
              moderation_status: "rejected",
              is_flagged: false,
            },
          };

    const updated = await Image.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Moderation action error:", err);
    return NextResponse.json({ error: "Failed moderation action." }, { status: 500 });
  }
}
