export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import Image from "../../../models/Image";
import cloudinary from "../../../lib/cloudinary";
import exifr from "exifr";

export async function POST(req) {
  try {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("image");
    const uploadedBy = formData.get("uploaded_by") || "Anonymous"; // ✅ Get uploader

    // Validate file
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }
    if (file.type && !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
    }

    // Convert to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract GPS from EXIF
    const exifData = await exifr.gps(buffer);
    if (!exifData?.latitude || !exifData?.longitude) {
      return NextResponse.json(
        { error: "Image does not contain location metadata" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "sky-images", resource_type: "image" },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    // Save to MongoDB
    await connectDB();
    await Image.create({
      image_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      latitude: exifData.latitude,
      longitude: exifData.longitude,
      uploaded_by: uploadedBy, // ✅ Store uploader
      uploaded_at: new Date(),
    });

    // Success response
    return NextResponse.json({
      message: "✅ Upload successful",
      url: uploadResult.secure_url,
      latitude: exifData.latitude,
      longitude: exifData.longitude,
      uploaded_by: uploadedBy, // ✅ Return it too
    });
  } catch (error) {
    console.error("❌ Upload route error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
