"use client";

import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useImages } from "../hooks/useImage";
import ClusterMarkers from "./ClusterMarkers";

export default function MapView({ darkMode }) {
  const { mapImages, loading } = useImages();

  // Dark vs light tile URLs
  const tileUrl = darkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Carto Dark
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution = darkMode
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        className="w-full h-full"
        minZoom={3}
        zoomControl={false} 
      >
        <ZoomControl position="bottomright" />

        <TileLayer url={tileUrl} attribution={attribution} />

        {!loading && <ClusterMarkers images={ mapImages} />}
      </MapContainer>
    </div>
  );
}
