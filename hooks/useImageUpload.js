import { useState } from "react";

export function useUploadImage({ resetForm, closeDialog, onSuccess, onError }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async ({ image, uploadedBy, gps, locationName }) => {
    if (!image || !gps) {
      onError?.("❌ Missing image or location data.");
      return;
    }

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
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed. Please try again.");
      }

      resetForm();
      closeDialog();
      onSuccess?.(); // ✅ Call success callback
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message);
      onError?.(err.message); // ✅ Call error callback
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, error, setError };
}
