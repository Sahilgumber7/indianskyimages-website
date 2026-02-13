"use client";

import { useMemo } from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import MarkerPopupContent from "./MarkerPopupContent";

// Apple Photos Style Marker - Premium Square Thumbnail (Full Color)
const createCustomIcon = (url) => {
  if (typeof window === "undefined") return null;
  return L.divIcon({
    className: "custom-marker-wrapper",
    html: `
      <div class="marker-container" style="
        position: relative;
        width: 54px;
        height: 54px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #fff;
          padding: 2.5px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.3);
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
        " class="marker-thumbnail">
          <img src="${url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 9px;" />
        </div>
        
        <!-- Bottom Peak (Subtle) -->
        <div style="
          position: absolute;
          bottom: -2px;
          width: 8px;
          height: 8px;
          background: #fff;
          transform: rotate(45deg);
          box-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          z-index: -1;
        "></div>

        <style>
          .custom-marker-wrapper:hover .marker-thumbnail {
            transform: scale(1.15) translateY(-4px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.4);
          }
        </style>
      </div>
    `,
    iconSize: [54, 54],
    iconAnchor: [27, 54],
    popupAnchor: [0, -45],
  });
};

export default function ImageMarker({ img }) {
  const lat = parseFloat(img.latitude);
  const lon = parseFloat(img.longitude);

  const icon = useMemo(() => createCustomIcon(img.image_url), [img.image_url]);

  if (isNaN(lat) || isNaN(lon)) return null;

  return (
    <Marker position={[lat, lon]} icon={icon}>
      <Popup className="apple-popup">
        <MarkerPopupContent img={img} />
      </Popup>
    </Marker>
  );
}
