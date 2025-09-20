"use client";

import { useReverseGeocode } from "../hooks/useReverseGeocde";

export default function MarkerPopupContent({ img }) {
  const lat = parseFloat(img.latitude);
  const lon = parseFloat(img.longitude);

  // Fetch location name using hook
  const locationName = useReverseGeocode({ latitude: lat, longitude: lon });

  return (
    <div className="w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 duration-200">
      <img
        src={img.image_url}
        alt="Sky"
        className="w-full h-48 object-cover"
      />
      <div className="p-3 space-y-1">
        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center">
          <span className="mr-1">📍</span>
          {locationName
            ? locationName
            : `${lat.toFixed(5)}, ${lon.toFixed(5)}`}
        </p>
      </div>
    </div>
  );
}
