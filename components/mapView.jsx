"use client";

import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useImages } from "../hooks/useImage";
import ClusterMarkers from "./ClusterMarkers";

export default function MapView() {
  const { images, loading } = useImages();

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        className="w-full h-full"
        minZoom={3}
        zoomControl={false} // Disable default top-left zoom control
      >
        {/* Zoom control at bottom-right */}
        <ZoomControl position="bottomright" />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {!loading && <ClusterMarkers images={images} />}
      </MapContainer>
    </div>
  );
}
