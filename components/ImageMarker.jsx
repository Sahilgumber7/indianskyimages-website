// components/ImageMarker.js
"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

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

  return (
    <Marker position={[lat, lon]} icon={createIcon(img.image_url)}>
      <Popup>
        <div className="p-2 rounded-md bg-white text-black shadow-lg">
          <img
            src={img.image_url}
            alt="Sky"
            className="w-56 h-56 object-cover rounded-lg"
          />
          <p className="text-sm mt-2">
            📍 {lat.toFixed(5)}, {lon.toFixed(5)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}
