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
      let fileForExif = file; // default → original file

      // Handle HEIC/HEIF conversion
      if (
        file.type === "image/heif" ||
        file.type === "image/heic" ||
        file.name.toLowerCase().endsWith(".heif") ||
        file.name.toLowerCase().endsWith(".heic")
      ) {
        // Extract EXIF BEFORE conversion
        const gpsData = await exifr.gps(file);

        if (!gpsData?.latitude || !gpsData?.longitude) {
          setError("❌ This image has no location metadata.");
          reset();
          return;
        }

        // Lazy-load heic2any only in browser
        if (typeof window !== "undefined") {
          const heic2any = (await import("heic2any")).default;
          const converted = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8,
          });
          previewUrl = URL.createObjectURL(converted);
        } else {
          // SSR fallback
          previewUrl = null;
        }

        fileForExif = file; // keep original file for storage if needed
        setGps({ latitude: gpsData.latitude, longitude: gpsData.longitude });
      } else {
        // Non-HEIC → extract EXIF directly
        const gpsData = await exifr.gps(file);

        if (!gpsData?.latitude || !gpsData?.longitude) {
          setError("❌ This image has no location metadata.");
          reset();
          return;
        }

        previewUrl = URL.createObjectURL(file);
        setGps({ latitude: gpsData.latitude, longitude: gpsData.longitude });
      }

      setImage(fileForExif);
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
  };

  return { image, preview, gps, error, readFile, setError, reset };
}
