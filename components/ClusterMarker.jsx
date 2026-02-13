"use client";

import { Marker } from "react-leaflet";
import L from "leaflet";

export default function ClusterMarker({ cluster, supercluster, map }) {
  const [longitude, latitude] = cluster.geometry.coordinates;

  const count = cluster.properties.point_count;
  const size = count < 10 ? 40 : count < 50 ? 50 : 60;

  const icon = L.divIcon({
    html: `
      <div class="animate-in zoom-in duration-300" style="
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        color: white;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: ${size / 3}px;
        border: 2px solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 8px 16px -4px rgba(79, 70, 229, 0.4);
        backdrop-filter: blur(4px);
      ">
        <span>${count}</span>
      </div>`,
    className: "cluster-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

  const handleClick = () => {
    const expansionZoom = Math.min(
      supercluster.getClusterExpansionZoom(cluster.id),
      18
    );
    map.setView([latitude, longitude], expansionZoom, { animate: true });
  };

  return <Marker position={[latitude, longitude]} icon={icon} eventHandlers={{ click: handleClick }} />;
}
