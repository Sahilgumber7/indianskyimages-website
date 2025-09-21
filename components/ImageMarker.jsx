"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import MarkerPopupContent from "./MarkerPopupContent";

function createIcon(url, size = 48) {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        overflow: hidden;
        border: 1px solid #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
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
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}


export default function ImageMarker({ img }) {
  const lat = parseFloat(img.latitude);
  const lon = parseFloat(img.longitude);

  return (
    <Marker position={[lat, lon]} icon={createIcon(img.image_url)}>
      <Popup>
        <MarkerPopupContent img={img} />
      </Popup>
    </Marker>
  );
}
