import { useEffect, useMemo, useState } from "react";

const CACHE_TTL_MS = 60 * 1000;
const STORAGE_KEY = "isi_images_cache_v1";
let cachedImages = null;
let cacheTimestamp = 0;
let inflightRequest = null;

function isCacheFresh() {
  return cachedImages && Date.now() - cacheTimestamp < CACHE_TTL_MS;
}

function readStorageCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.images) || typeof parsed.timestamp !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStorageCache(images, timestamp) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ images, timestamp })
    );
  } catch {
    // ignore storage quota/errors
  }
}

async function fetchImagesWithCache() {
  if (isCacheFresh()) {
    return { images: cachedImages, fromCache: true };
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = fetch("/api/images", { cache: "default" })
    .then(async (res) => {
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch images");
      }
      cachedImages = json.data || [];
      cacheTimestamp = Date.now();
      writeStorageCache(cachedImages, cacheTimestamp);
      return { images: cachedImages, fromCache: false };
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

    const stored = readStorageCache();
    if (stored && !cachedImages) {
      cachedImages = stored.images;
      cacheTimestamp = stored.timestamp;
    }

    if (cachedImages && !cancelled) {
      setImages(cachedImages);
      setLoading(false);
    }

    async function loadAndRefresh() {
      try {
        const { images: freshImages, fromCache } = await fetchImagesWithCache();
        if (!cancelled) {
          setImages(freshImages);
          if (!fromCache) {
            setError(null);
          }
        }
      } catch (err) {
        if (!cancelled && !cachedImages) {
          setError(err);
          setLoading(false);
        }
        console.error("Fetch error:", err);
      } finally {
        if (!cancelled && !cachedImages) {
          setLoading(false);
        }
      }
    }

    loadAndRefresh();

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
