// components/MapView.js
"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useImages } from "../hooks/useImage";
import ImageMarker from "./ImageMarker";

export default function MapView() {
  const { images, loading } = useImages();

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[20.5937, 78.9629]} // India center
        zoom={5}
        className="w-full h-full"
        minZoom={3}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {!loading &&
          images.map((img) => <ImageMarker key={img._id} img={img} />)}
      </MapContainer>
    </div>
  );
}
