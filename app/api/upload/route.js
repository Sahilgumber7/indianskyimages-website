export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import Image from "../../../models/Image";
import cloudinary from "../../../lib/cloudinary";


export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");
    const uploadedBy = formData.get("uploaded_by") || "Anonymous";
    const latitude = parseFloat(formData.get("latitude"));
    const longitude = parseFloat(formData.get("longitude"));

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }
    if (!latitude || !longitude) {
      return NextResponse.json({ error: "No GPS data" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "sky-images", resource_type: "image" },
        (error, result) => (error ? reject(error) : resolve(result))
      ).end(buffer);
    });

    await connectDB();
    await Image.create({
      image_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      latitude,
      longitude,
      uploaded_by: uploadedBy,
      uploaded_at: new Date(),
    });

    return NextResponse.json({
      message: "✅ Upload successful",
      url: uploadResult.secure_url,
      latitude,
      longitude,
      uploaded_by: uploadedBy,
    });
  } catch (error) {
    console.error("❌ Upload route error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
