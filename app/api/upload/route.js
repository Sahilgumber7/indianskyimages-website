export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import Image from "../../../models/Image";
import cloudinary from "../../../lib/cloudinary";

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
    const locationName = formData.get("location_name") || "Archived Origin";

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "sky-images", resource_type: "image" },
          (error, result) => (error ? reject(error) : resolve(result))
        )
        .end(buffer);
    });

    await connectDB();
    const created = await Image.create({
      image_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      latitude: isNaN(latitude) ? null : latitude,
      longitude: isNaN(longitude) ? null : longitude,
      location_name: locationName,
      uploaded_by: uploadedBy,
      uploaded_at: new Date(),
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
