import { useState } from "react";
import exifr from "exifr";
import heic2any from "heic2any";

export function useImagePreview() {
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [gps, setGps] = useState(null);

  const readFile = async (file) => {
    setError(null);

    try {
      let previewUrl;

      if (
        file.type === "image/heif" ||
        file.type === "image/heic" ||
        file.name.endsWith(".heif") ||
        file.name.endsWith(".heic")
      ) {
        const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
        previewUrl = URL.createObjectURL(converted);
      } else {
        previewUrl = URL.createObjectURL(file);
      }

      const gpsData = await exifr.gps(file);
      if (!gpsData?.latitude || !gpsData?.longitude) {
        setError("❌ This image has no location metadata.");
        setPreview(null);
        setGps(null);
        setImage(null);
        return;
      }

      setImage(file);
      setPreview(previewUrl);
      setGps({ latitude: gpsData.latitude, longitude: gpsData.longitude });
    } catch (err) {
      console.error("File handling error:", err);
      setError("❌ Could not read image metadata.");
      setPreview(null);
      setImage(null);
      setGps(null);
    }
  };

  return { image, preview, gps, error, readFile, setError };
}
