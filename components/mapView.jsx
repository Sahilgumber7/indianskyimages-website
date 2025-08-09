"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Supercluster from "supercluster";

export default function MapView({ dialogOpen, darkMode }) {
  const [images, setImages] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(5);
  const mapRef = useRef(null); // ✅ Added

  // Fetch images
  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch("/api/images");
        const json = await res.json();
        if (res.ok) setImages(json.data);
        else console.error("Failed to fetch:", json.error);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }
    fetchImages();
  }, []);

  // Convert to GeoJSON
  const points = useMemo(() => {
    return images.map(img => ({
      type: "Feature",
      properties: {
        cluster: false,
        imgId: img._id,
        url: img.url,
        lat: img.latitude,
        lon: img.longitude
      },
      geometry: {
        type: "Point",
        coordinates: [parseFloat(img.longitude), parseFloat(img.latitude)]
      }
    }));
  }, [images]);

  // Cluster index
  const clusterIndex = useMemo(() => {
    return new Supercluster({
      radius: 60,
      maxZoom: 17
    }).load(points);
  }, [points]);

  // Track bounds + zoom
  function BoundsTracker() {
    useMapEvents({
      moveend(e) {
        const b = e.target.getBounds();
        setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
        setZoom(e.target.getZoom());
      }
    });
    return null;
  }

  // Get clusters for current bounds
  const clusters = useMemo(() => {
    if (!bounds) return [];
    return clusterIndex.getClusters(bounds, zoom);
  }, [clusterIndex, bounds, zoom]);

  const lightMap = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkMap = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        className="w-full h-full"
        minZoom={3}
        whenCreated={(map) => (mapRef.current = map)} // ✅ Save reference
      >
        <TileLayer
        url={`https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=pFEehbBJ6Su5xGe5ips6`}
        attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
        />

        <BoundsTracker />

        {clusters.map(cluster => {
          const [longitude, latitude] = cluster.geometry.coordinates;

          // Cluster marker
          if (cluster.properties.cluster) {
            const pointCount = cluster.properties.point_count_abbreviated;

            return (
              <Marker
                key={`cluster-${cluster.id}`}
                position={[latitude, longitude]}
                icon={L.divIcon({
                  html: `<div style="
                    background:${darkMode ? "#6366f1" : "#2563eb"};
                    color:white;
                    border-radius:50%;
                    width:40px;
                    height:40px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:14px;
                  ">${pointCount}</div>`,
                  className: "",
                  iconSize: [40, 40]
                })}
                eventHandlers={{
                  click: () => {
                    const expansionZoom = Math.min(
                      clusterIndex.getClusterExpansionZoom(cluster.id),
                      17
                    );
                    if (mapRef.current) {
                      mapRef.current.setView([latitude, longitude], expansionZoom, {
                        animate: true
                      });
                    }
                  }
                }}
              />
            );
          }

          // Single image marker
          const customIcon = L.divIcon({
            className: "custom-marker",
            html: `<div class="w-12 h-12 flex items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-md">
                     <img src="${cluster.properties.url}" loading="lazy" class="w-full h-full object-cover" />
                   </div>`,
            iconSize: [48, 48],
            iconAnchor: [24, 24],
          });

          return (
            <Marker
              key={cluster.properties.imgId}
              position={[latitude, longitude]}
              icon={customIcon}
            >
              <Popup>
                <div
                  className="p-3 rounded-md max-w-sm w-full"
                  style={{
                    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                    color: darkMode ? "#FFFFFF" : "#000000",
                  }}
                >
                  <img
                    src={cluster.properties.url}
                    alt="Sky"
                    loading="lazy"
                    className="w-full h-72 rounded-md object-cover"
                  />
                  <p className="text-xs sm:text-sm mt-2 text-center">
                    📍 {cluster.properties.lat}, {cluster.properties.lon}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {dialogOpen && (
        <div className="absolute inset-0 bg-black/30 z-20 pointer-events-auto" />
      )}
    </div>
  );
}
