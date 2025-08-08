export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import Image from "../../../models/Image";
import cloudinary from "../../../lib/cloudinary";
import { readFile } from "fs/promises";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "sky-images", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    // Save to MongoDB
    await connectDB();
    await Image.create({
      image_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      uploaded_at: new Date(),
    });

    return NextResponse.json({
      message: "Upload successful",
      url: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
