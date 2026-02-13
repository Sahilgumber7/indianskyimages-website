import { useState } from "react";
import { toast } from "sonner";

export function useUpload(onSuccessCallback) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const uploadImage = async ({ image, uploadedBy, gps, locationName }) => {
        if (!image) {
            const msg = "❌ No image selected.";
            setError(msg);
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

            toast.success("Horizon archived successfully.");
            onSuccessCallback?.();
        } catch (err) {
            console.error("Upload error:", err);
            const msg = err.message || "Upload failed.";
            setError(msg);
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    return { uploadImage, uploading, error, setUploadError: setError };
}
