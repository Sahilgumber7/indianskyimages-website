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
        setLocationName(data.display_name || "Unknown location");
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
        setLocationName("Unknown location");
      }
    };

    fetchLocation();
  }, [gps]);

  return locationName;
}
