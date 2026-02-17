import { useEffect, useMemo, useState } from "react";

const CACHE_TTL_MS = 60 * 1000;
const STORAGE_KEY = "isi_images_cache_v1";
export const IMAGE_UPLOADED_EVENT = "isi:image-uploaded";
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

function prependUniqueImage(list, image) {
  if (!image?._id) {
    return [image, ...(list || [])];
  }
  const existing = (list || []).filter((item) => item?._id !== image._id);
  return [image, ...existing];
}

async function fetchImagesWithCache({ force = false } = {}) {
  if (!force && isCacheFresh()) {
    return { images: cachedImages, fromCache: true };
  }

  if (!force && inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = fetch("/api/images", { cache: force ? "no-store" : "default" })
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

export function useImages({ enabled = false } = {}) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

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

    async function loadAndRefresh(force = false) {
      try {
        const { images: freshImages, fromCache } = await fetchImagesWithCache({ force });
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

    const onImageUploaded = (event) => {
      const uploadedImage = event?.detail?.image;
      if (!uploadedImage) {
        return;
      }

      cachedImages = prependUniqueImage(cachedImages, uploadedImage);
      cacheTimestamp = Date.now();
      writeStorageCache(cachedImages, cacheTimestamp);
      setImages((prev) => prependUniqueImage(prev, uploadedImage));
      loadAndRefresh(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener(IMAGE_UPLOADED_EVENT, onImageUploaded);
    }

    return () => {
      cancelled = true;
      if (typeof window !== "undefined") {
        window.removeEventListener(IMAGE_UPLOADED_EVENT, onImageUploaded);
      }
    };
  }, [enabled]);

  const mapImages = useMemo(
    () => images.filter((img) => img.latitude && img.longitude),
    [images]
  );

  return { images, mapImages, loading, error };
}
