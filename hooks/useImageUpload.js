import { useState } from "react";

export function useUploadImage({ resetForm, closeDialog, onSuccess, onError }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async ({ image, uploadedBy, gps, locationName }) => {
    if (!image) {
      const msg = "❌ No image selected.";
      setError(msg);
      onError?.(msg);
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("uploaded_by", uploadedBy || "Anonymous");
    formData.append("latitude", gps?.latitude || "");
    formData.append("longitude", gps?.longitude || "");
    formData.append("location_name", locationName || "Unknown");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed. Please try again.");
      }

      resetForm();
      closeDialog();
      onSuccess?.();
    } catch (err) {
      console.error("Upload error:", err);
      const msg = err.message || "Upload failed.";
      setError(msg);
      onError?.(msg);
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, error, setError };
}
