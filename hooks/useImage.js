import { useEffect, useMemo, useState } from "react";

const CACHE_TTL_MS = 60 * 1000;
const STORAGE_KEY = "isi_images_cache_v2";
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ images, timestamp }));
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

function buildQueryString(filters, page, limit) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.state) params.set("state", filters.state);
  if (filters.uploader) params.set("uploader", filters.uploader);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.bbox) params.set("bbox", filters.bbox);
  if (filters.includeNoLocation) params.set("includeNoLocation", "true");
  params.set("page", String(page || 1));
  params.set("limit", String(limit || 40));
  return params.toString();
}

function isDefaultQuery(filters, page, limit) {
  const hasFilters = Boolean(
    filters.q ||
      filters.state ||
      filters.uploader ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.bbox ||
      filters.includeNoLocation
  );
  return !hasFilters && (page || 1) === 1 && (limit || 40) === 40;
}

async function fetchImages({ filters, page, limit, force = false }) {
  const isDefault = isDefaultQuery(filters, page, limit);
  if (isDefault && !force && isCacheFresh()) {
    return {
      images: cachedImages,
      pagination: { page: 1, limit: 40, hasMore: false, total: cachedImages.length },
      topStates: [],
      leaderboards: { week: [], month: [] },
      fromCache: true,
    };
  }

  if (isDefault && !force && inflightRequest) {
    return inflightRequest;
  }

  const query = buildQueryString(filters, page, limit);
  const request = fetch(`/api/images?${query}`, {
    cache: force ? "no-store" : "default",
  })
    .then(async (res) => {
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch images");
      }
      const nextImages = json.data || [];
      if (isDefault) {
        cachedImages = nextImages;
        cacheTimestamp = Date.now();
        writeStorageCache(cachedImages, cacheTimestamp);
      }
      return {
        images: nextImages,
        pagination: json.pagination || {
          page: page || 1,
          limit: limit || 40,
          hasMore: false,
          total: nextImages.length,
        },
        topStates: json.topStates || [],
        leaderboards: json.leaderboards || { week: [], month: [] },
        fromCache: false,
      };
    })
    .finally(() => {
      if (isDefault) {
        inflightRequest = null;
      }
    });

  if (isDefault) {
    inflightRequest = request;
  }
  return request;
}

export function useImages({ enabled = false, filters = {}, page = 1, limit = 40 } = {}) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit,
    total: 0,
    hasMore: false,
  });
  const [topStates, setTopStates] = useState([]);
  const [leaderboards, setLeaderboards] = useState({ week: [], month: [] });

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const isDefault = isDefaultQuery(filters, page, limit);

    const stored = readStorageCache();
    if (isDefault && stored && !cachedImages) {
      cachedImages = stored.images;
      cacheTimestamp = stored.timestamp;
    }

    if (isDefault && cachedImages && !cancelled) {
      setImages(cachedImages);
      setPagination({ page: 1, limit: 40, total: cachedImages.length, hasMore: false });
      setLoading(false);
    }

    async function load(force = false) {
      try {
        setLoading(true);
        const response = await fetchImages({ filters, page, limit, force });
        if (!cancelled) {
          setImages(response.images);
          setPagination(response.pagination);
          setTopStates(response.topStates);
          setLeaderboards(response.leaderboards || { week: [], month: [] });
          setError(null);
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

    const onImageUploaded = (event) => {
      const uploadedImage = event?.detail?.image;
      if (!uploadedImage) return;

      if (isDefault) {
        cachedImages = prependUniqueImage(cachedImages, uploadedImage);
        cacheTimestamp = Date.now();
        writeStorageCache(cachedImages, cacheTimestamp);
        setImages((prev) => prependUniqueImage(prev, uploadedImage));
      }

      load(true);
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
  }, [enabled, page, limit, filters.q, filters.state, filters.uploader, filters.dateFrom, filters.dateTo, filters.bbox, filters.includeNoLocation]);

  const mapImages = useMemo(
    () =>
      images.filter((img) => {
        const lat = Number(img.latitude);
        const lng = Number(img.longitude);
        return Number.isFinite(lat) && Number.isFinite(lng);
      }),
    [images]
  );

  return { images, mapImages, loading, error, pagination, topStates, leaderboards };
}
