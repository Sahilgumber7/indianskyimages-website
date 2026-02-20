export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "../../../lib/db";
import Image from "../../../models/Image";
import cloudinary from "../../../lib/cloudinary";

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(req) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary is not configured on the server." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image");
    const uploadedBy = formData.get("uploaded_by") || "Anonymous";
    const latitude = parseFloat(formData.get("latitude"));
    const longitude = parseFloat(formData.get("longitude"));
    const locationNameRaw = formData.get("location_name");
    const locationName = typeof locationNameRaw === "string" ? locationNameRaw.trim() : "";

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }
    if (typeof file.type !== "string" || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
    }
    if (typeof file.size === "number" && file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ error: "Image must be 10MB or smaller." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageHash = crypto.createHash("sha256").update(buffer).digest("hex");

    await connectDB();
    const duplicate = await Image.findOne({ image_hash: imageHash }).lean();
    if (duplicate) {
      return NextResponse.json(
        {
          error: "This image already exists in the archive.",
          image: {
            _id: String(duplicate._id),
            image_url: duplicate.image_url,
            latitude: duplicate.latitude,
            longitude: duplicate.longitude,
            location_name: duplicate.location_name,
            uploaded_by: duplicate.uploaded_by,
            uploaded_at: duplicate.uploaded_at,
            likes: duplicate.likes || 0,
          },
        },
        { status: 409 }
      );
    }

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "sky-images", resource_type: "image" },
          (error, result) => (error ? reject(error) : resolve(result))
        )
        .end(buffer);
    });

    const created = await Image.create({
      image_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      image_hash: imageHash,
      latitude: isNaN(latitude) ? null : latitude,
      longitude: isNaN(longitude) ? null : longitude,
      location_name: locationName || null,
      uploaded_by: uploadedBy,
      uploaded_at: new Date(),
      moderation_status: process.env.MODERATION_ENABLED === "true" ? "pending" : "approved",
    });

    return NextResponse.json(
      {
        message: "Upload successful",
        image: {
          _id: String(created._id),
          image_url: created.image_url,
          latitude: created.latitude,
          longitude: created.longitude,
          location_name: created.location_name,
          uploaded_by: created.uploaded_by,
          uploaded_at: created.uploaded_at,
          likes: created.likes || 0,
          moderation_status: created.moderation_status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
