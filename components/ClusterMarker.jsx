"use client";

import { Marker } from "react-leaflet";
import L from "leaflet";

export default function ClusterMarker({ cluster, supercluster, map }) {
  const [longitude, latitude] = cluster.geometry.coordinates;

  const icon = L.divIcon({
    html: `<div style="
      background: rgba(0, 122, 255, 0.8);
      color: white;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
      border: 2px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    ">${cluster.properties.point_count}</div>`,
    className: "cluster-marker",
    iconSize: [50, 50],
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
