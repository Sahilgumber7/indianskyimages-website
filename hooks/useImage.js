// hooks/useImages.js
import { useEffect, useState, useMemo } from "react";

export function useImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch("/api/images");
        const json = await res.json();
        if (res.ok) setImages(json.data);
        else console.error("Failed to fetch:", json.error);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  // 🔎 computed arrays
  const mapImages = useMemo(
    () => images.filter(img => img.latitude && img.longitude),
    [images]
  );

  return { images, mapImages, loading };
}
