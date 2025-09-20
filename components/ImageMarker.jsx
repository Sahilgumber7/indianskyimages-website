"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useReverseGeocode } from "../hooks/useReverseGeocde";

function createIcon(url) {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 60px;
        height: 60px;
        border-radius: 16px;
        overflow: hidden;
        border: 2px solid #fff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <img src="${url}" style="
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        " />
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -30],
  });
}

export default function ImageMarker({ img }) {
  const lat = parseFloat(img.latitude);
  const lon = parseFloat(img.longitude);

  const locationName = useReverseGeocode({ latitude: lat, longitude: lon });

  return (
    <Marker position={[lat, lon]} icon={createIcon(img.image_url)}>
      <Popup>
        <div className="w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 duration-200">
          <img
            src={img.image_url}
            alt="Sky"
            className="w-full h-48 object-cover"
          />
          <div className="p-3 space-y-1">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center">
              <span className="mr-1">📍</span>
              {locationName || `${lat.toFixed(5)}, ${lon.toFixed(5)}`}
            </p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
