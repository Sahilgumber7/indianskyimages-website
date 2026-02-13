"use client";

import { useEffect, useState } from "react";

const locationCache = new Map();

function toLocationKey(gps) {
  if (!gps?.latitude || !gps?.longitude) {
    return null;
  }
  return `${gps.latitude.toFixed(4)},${gps.longitude.toFixed(4)}`;
}

export function useReverseGeocode(gps) {
  const [locationName, setLocationName] = useState(null);

  useEffect(() => {
    const key = toLocationKey(gps);
    if (!key) {
      setLocationName(null);
      return;
    }

    const cached = locationCache.get(key);
    if (cached) {
      setLocationName(cached);
      return;
    }

    let cancelled = false;

    const fetchLocation = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${gps.latitude}&lon=${gps.longitude}`
        );
        const data = await res.json();

        if (cancelled) return;

        if (data && data.address) {
          const addr = data.address;
          const district = addr.district || addr.city_district || addr.county || addr.suburb;
          const state = addr.state;
          const country = addr.country;

          const parts = [];
          if (district) parts.push(district);
          if (state) parts.push(state);
          if (country) parts.push(country);

          const resolved = parts.length > 0 ? parts.join(", ") : "Somewhere in India";
          locationCache.set(key, resolved);
          setLocationName(resolved);
          return;
        }

        const fallback = data.display_name?.split(",")[0] || "Somewhere in India";
        locationCache.set(key, fallback);
        setLocationName(fallback);
      } catch (err) {
        if (!cancelled) {
          console.error("Reverse geocoding failed:", err);
          setLocationName("Somewhere in India");
        }
      }
    };

    fetchLocation();

    return () => {
      cancelled = true;
    };
  }, [gps]);

  return locationName;
}

