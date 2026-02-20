import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import Image from "../../../models/Image";

const DEFAULT_LIMIT = 40;
const MAX_LIMIT = 120;

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeStateFromLocation(locationName = "") {
  if (!locationName || typeof locationName !== "string") return null;
  const parts = locationName.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  return parts[parts.length - 2];
}

function isAdminRequest(req) {
  const adminKey = process.env.ADMIN_REVIEW_KEY;
  if (!adminKey) return false;
  const headerKey = req.headers.get("x-admin-key");
  return Boolean(headerKey && headerKey === adminKey);
}

const APPROVED_OR_LEGACY = { $in: ["approved", null] };

export async function GET(req) {
  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || `${DEFAULT_LIMIT}`, 10), 1), MAX_LIMIT);
    const q = searchParams.get("q")?.trim();
    const state = searchParams.get("state")?.trim();
    const uploader = searchParams.get("uploader")?.trim();
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const bbox = searchParams.get("bbox");
    const includeNoLocation = searchParams.get("includeNoLocation") === "true";
    const includePending = searchParams.get("includePending") === "true";
    const adminRequest = isAdminRequest(req);

    await connectDB();

    const query = {};
    if (!(adminRequest && includePending)) {
      query.moderation_status = APPROVED_OR_LEGACY;
    }

    if (q) {
      query.$or = [
        { location_name: { $regex: escapeRegex(q), $options: "i" } },
        { uploaded_by: { $regex: escapeRegex(q), $options: "i" } },
      ];
    }

    if (state) {
      query.location_name = { $regex: `(?:^|,\\s*)${escapeRegex(state)}(?:\\s*,|$)`, $options: "i" };
    }

    if (uploader) {
      query.uploaded_by = { $regex: escapeRegex(uploader), $options: "i" };
    }

    if (dateFrom || dateTo) {
      query.uploaded_at = {};
      if (dateFrom) query.uploaded_at.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        query.uploaded_at.$lte = end;
      }
    }

    if (bbox) {
      const parts = bbox.split(",").map((v) => Number(v.trim()));
      if (parts.length === 4 && parts.every((v) => !Number.isNaN(v))) {
        const [west, south, east, north] = parts;
        query.latitude = { $gte: south, $lte: north };
        query.longitude = { $gte: west, $lte: east };
      }
    } else if (!includeNoLocation) {
      query.latitude = { $ne: null };
      query.longitude = { $ne: null };
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [images, total, stateRows, topWeek, topMonth] = await Promise.all([
      Image.find(
        query,
        "image_url uploaded_by uploaded_at latitude longitude location_name likes report_count moderation_status"
      )
        .sort({ uploaded_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Image.countDocuments(query),
      Image.aggregate([
        { $match: { moderation_status: APPROVED_OR_LEGACY, location_name: { $exists: true, $ne: null } } },
        { $group: { _id: "$location_name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 200 },
      ]),
      Image.aggregate([
        { $match: { moderation_status: APPROVED_OR_LEGACY, uploaded_at: { $gte: weekAgo } } },
        { $group: { _id: "$uploaded_by", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Image.aggregate([
        { $match: { moderation_status: APPROVED_OR_LEGACY, uploaded_at: { $gte: monthAgo } } },
        { $group: { _id: "$uploaded_by", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const topStatesMap = new Map();
    for (const row of stateRows) {
      const stateName = normalizeStateFromLocation(row._id);
      if (!stateName) continue;
      topStatesMap.set(stateName, (topStatesMap.get(stateName) || 0) + row.count);
    }

    const topStates = [...topStatesMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json(
      {
        data: images,
        pagination: {
          page,
          limit,
          total,
          hasMore: page * limit < total,
        },
        topStates,
        leaderboards: {
          week: topWeek.map((row) => ({ name: row._id || "Anonymous", count: row.count })),
          month: topMonth.map((row) => ({ name: row._id || "Anonymous", count: row.count })),
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=20, s-maxage=45, stale-while-revalidate=240",
        },
      }
    );
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}
