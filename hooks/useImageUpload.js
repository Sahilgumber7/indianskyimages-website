import { useState } from "react";

export function useUploadImage({ resetForm, closeDialog }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async ({ image, uploadedBy, gps, locationName }) => {
    if (!image || !gps) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("uploaded_by", uploadedBy || "Anonymous");
    formData.append("latitude", gps.latitude);
    formData.append("longitude", gps.longitude);
    formData.append("location_name", locationName || "Unknown");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });

      if (res.ok) {
        // ✅ optional delay for smoother UX
        setTimeout(() => {
          closeDialog();
          resetForm();
        }, 1000);
      } else {
        setError("❌ Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("❌ Upload failed. Please try again.");
    }

    setUploading(false);
  };

  return { uploadImage, uploading, error, setError };
}
