import { useState } from "react";
import exifr from "exifr";

export function useImagePreview() {
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [gps, setGps] = useState(null);

  const readFile = async (file) => {
    setError(null);

    try {
      let previewUrl;
      let fileForStorage = file;

      // Extract GPS metadata if available
      const gpsData = await exifr.gps(file);
      if (gpsData?.latitude && gpsData?.longitude) {
        setGps({ latitude: gpsData.latitude, longitude: gpsData.longitude });
      } else {
        setGps(null);
        setError("⚠️ This image has no location metadata.");
      }

      // Handle HEIC/HEIF conversion if needed
      if (
        file.type === "image/heif" ||
        file.type === "image/heic" ||
        file.name.toLowerCase().endsWith(".heif") ||
        file.name.toLowerCase().endsWith(".heic")
      ) {
        if (typeof window !== "undefined") {
          const heic2any = (await import("heic2any")).default;
          const converted = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8,
          });
          previewUrl = URL.createObjectURL(converted);
        } else {
          previewUrl = null; // SSR fallback
        }
      } else {
        // Regular image
        previewUrl = URL.createObjectURL(file);
      }

      setImage(fileForStorage);
      setPreview(previewUrl);
    } catch (err) {
      console.error("File handling error:", err);
      setError("❌ Could not read image metadata.");
      reset();
    }
  };

  const reset = () => {
    setPreview(null);
    setImage(null);
    setGps(null);
    setError(null);
  };

  return { image, preview, gps, error, readFile, setError, reset };
}
