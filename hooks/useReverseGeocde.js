"use client";

import { useEffect, useState } from "react";

export function useReverseGeocode(gps) {
  const [locationName, setLocationName] = useState(null);

  useEffect(() => {
    if (!gps) {
      setLocationName(null);
      return;
    }

    const fetchLocation = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${gps.latitude}&lon=${gps.longitude}`
        );
        const data = await res.json();

        if (data && data.address) {
          const addr = data.address;
          // Format: District, State, Country
          const district = addr.district || addr.city_district || addr.county || addr.suburb;
          const state = addr.state;
          const country = addr.country;

          let parts = [];
          if (district) parts.push(district);
          if (state) parts.push(state);
          if (country) parts.push(country);

          setLocationName(parts.length > 0 ? parts.join(", ") : "Somewhere in India");
        } else {
          setLocationName(data.display_name?.split(',')[0] || "Somewhere in India");
        }
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
        setLocationName("Somewhere in India");
      }
    };

    fetchLocation();
  }, [gps]);

  return locationName;
}
