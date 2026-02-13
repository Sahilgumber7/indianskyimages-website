import { useEffect, useMemo, useState } from "react";

const CACHE_TTL_MS = 60 * 1000;
let cachedImages = null;
let cacheTimestamp = 0;
let inflightRequest = null;

function isCacheFresh() {
  return cachedImages && Date.now() - cacheTimestamp < CACHE_TTL_MS;
}

async function fetchImagesWithCache() {
  if (isCacheFresh()) {
    return cachedImages;
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = fetch("/api/images", { cache: "no-store" })
    .then(async (res) => {
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch images");
      }
      cachedImages = json.data || [];
      cacheTimestamp = Date.now();
      return cachedImages;
    })
    .finally(() => {
      inflightRequest = null;
    });

  return inflightRequest;
}

export function useImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchImagesWithCache();
        if (!cancelled) {
          setImages(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
        console.error("Fetch error:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const mapImages = useMemo(
    () => images.filter((img) => img.latitude && img.longitude),
    [images]
  );

  return { images, mapImages, loading, error };
}
