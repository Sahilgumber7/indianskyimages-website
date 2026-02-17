import { useState } from "react";
import { toast } from "sonner";
import { IMAGE_UPLOADED_EVENT } from "./useImage";

export function useUpload(onSuccessCallback) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadStats, setUploadStats] = useState({ completed: 0, total: 0 });
    const fallbackLatitude = 20.5937;
    const fallbackLongitude = 78.9629;

    const uploadSingle = async ({ image, uploadedBy, gps, locationName }) => {
        if (!image) {
            const msg = "No image selected.";
            throw new Error(msg);
        }

        const formData = new FormData();
        formData.append("image", image);
        formData.append("uploaded_by", uploadedBy || "Anonymous");
        formData.append("latitude", String(gps?.latitude ?? fallbackLatitude));
        formData.append("longitude", String(gps?.longitude ?? fallbackLongitude));
        formData.append("location_name", locationName || "Unknown");

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Upload failed. Please try again.");
            }

            if (typeof window !== "undefined" && data?.image) {
                window.dispatchEvent(new CustomEvent(IMAGE_UPLOADED_EVENT, { detail: { image: data.image } }));
            }
            return data?.image;
        } catch (err) {
            throw new Error(err?.message || "Upload failed.");
        }
    };

    const uploadImage = async ({ image, uploadedBy, gps, locationName }) => {
        setUploading(true);
        setError(null);
        setUploadStats({ completed: 0, total: 1 });
        try {
            await uploadSingle({ image, uploadedBy, gps, locationName });
            setUploadStats({ completed: 1, total: 1 });
            toast.success("Image uploaded.");
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

    const uploadImages = async ({ items, uploadedBy }) => {
        if (!Array.isArray(items) || items.length === 0) {
            setError("No images selected.");
            return { success: 0, failed: 0 };
        }

        setUploading(true);
        setError(null);
        setUploadStats({ completed: 0, total: items.length });

        let success = 0;
        let failed = 0;

        for (let i = 0; i < items.length; i += 1) {
            const item = items[i];
            try {
                await uploadSingle({
                    image: item.image,
                    uploadedBy,
                    gps: item.gps,
                    locationName: item.locationName,
                });
                success += 1;
            } catch (err) {
                failed += 1;
                console.error("Upload error:", err);
                setError(err?.message || "Some uploads failed.");
            } finally {
                setUploadStats({ completed: i + 1, total: items.length });
            }
        }

        if (success > 0) {
            toast.success(`Uploaded ${success}/${items.length} image${items.length > 1 ? "s" : ""}.`);
            onSuccessCallback?.();
        }
        if (failed > 0) {
            toast.error(`${failed} upload${failed > 1 ? "s" : ""} failed.`);
        }

        setUploading(false);
        return { success, failed };
    };

    return { uploadImage, uploadImages, uploading, uploadStats, error, setUploadError: setError };
}
