"use client";

import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useImages } from "../hooks/useImage";
import ImageMarker from "./ImageMarker";
import Supercluster from "supercluster";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { LuChevronLeft, LuChevronRight, LuX } from "react-icons/lu";

// Custom clustering logic with Cluster Gallery functionality
function ClusterLayer({ images, onClusterClick }) {
  const map = useMap();
  const [clusters, setClusters] = useState([]);

  const index = useMemo(() => {
    const sc = new Supercluster({
      radius: 65,
      maxZoom: 16,
    });

    const points = images.map(img => ({
      type: "Feature",
      properties: { cluster: false, imgId: img._id, img },
      geometry: {
        type: "Point",
        coordinates: [parseFloat(img.longitude), parseFloat(img.latitude)]
      }
    }));

    sc.load(points);
    return sc;
  }, [images]);

  const updateClusters = () => {
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ];
    setClusters(index.getClusters(bbox, zoom));
  };

  useEffect(() => {
    updateClusters();
    map.on("moveend", updateClusters);
    map.on("zoomend", updateClusters);
    return () => {
      map.off("moveend", updateClusters);
      map.off("zoomend", updateClusters);
    };
  }, [map, index]);

  return (
    <>
      {clusters.map((feature) => {
        const [longitude, latitude] = feature.geometry.coordinates;
        const { cluster, point_count: pointCount } = feature.properties;

        if (cluster) {
          // Efficiently get just the first preview image for the icon
          const firstLeaf = index.getLeaves(feature.id, 1)[0];
          const previewUrl = firstLeaf?.properties?.img?.image_url;

          return (
            <div key={`cluster-${feature.id}`}>
              <ClusterMarker
                position={[latitude, longitude]}
                count={pointCount}
                previewUrl={previewUrl}
                onClick={() => {
                  // Only fetch all images when the user actually interacts
                  const clusterPoints = index.getLeaves(feature.id, Infinity);
                  const clusterImages = clusterPoints.map(p => p.properties.img);
                  onClusterClick(clusterImages);
                }}
              />
            </div>
          );
        }

        return (
          <ImageMarker key={`img-${feature.properties.imgId}`} img={feature.properties.img} />
        );
      })}
    </>
  );
}

// Apple Style Cluster - Photo Stack with Clear Badge
function ClusterMarker({ position, count, previewUrl, onClick }) {
  const { Marker } = require("react-leaflet");
  const icon = useMemo(() => L.divIcon({
    html: `
      <div class="group" style="width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <!-- Stack Layers -->
        <div style="position: absolute; width: 48px; height: 48px; background: #fff; border-radius: 12px; transform: rotate(-3deg) translate(-2px, -2px); border: 1.5px solid rgba(0,0,0,0.1); z-index: 1;"></div>
        <div style="position: absolute; width: 48px; height: 48px; background: #fff; border-radius: 12px; transform: rotate(3deg) translate(2px, 2px); border: 1.5px solid rgba(0,0,0,0.1); z-index: 2;"></div>
        
        <!-- Main Photo Box -->
        <div style="
          position: relative;
          width: 52px; height: 52px;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #fff;
          box-shadow: 0 12px 30px rgba(0,0,0,0.3);
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          z-index: 3;
        " class="group-hover:scale-110 group-hover:rotate-0">
          <img src="${previewUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
          
          <!-- Count Overlay (Glassmorphism) -->
          <div style="
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: -apple-system, system-ui, sans-serif;
          ">
            <span style="font-size: 18px; font-weight: 800; letter-spacing: -0.05em;">${count}</span>
          </div>
        </div>
      </div>`,
    className: 'custom-cluster-icon',
    iconSize: [70, 70],
    iconAnchor: [35, 35]
  }), [count, previewUrl]);

  return <Marker position={position} icon={icon} eventHandlers={{ click: onClick }} />;
}

export default function MapView({ darkMode }) {
  const { mapImages, loading } = useImages();
  const [selectedClusterImages, setSelectedClusterImages] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  const nextImage = () => {
    if (selectedClusterImages) {
      setCurrentIdx((prev) => (prev + 1) % selectedClusterImages.length);
    }
  };

  const prevImage = () => {
    if (selectedClusterImages) {
      setCurrentIdx((prev) => (prev - 1 + selectedClusterImages.length) % selectedClusterImages.length);
    }
  };

  const tileUrl = darkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <div className="absolute inset-0 z-0 bg-white dark:bg-[#050505] animate-in fade-in duration-1000">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        className="w-full h-full"
        minZoom={3}
        zoomControl={false}
        preferCanvas={true}
        attributionControl={false}
      >
        <ZoomControl position="bottomright" />

        <TileLayer
          url={tileUrl}
          opacity={1}
          className="dark:opacity-90 transition-opacity duration-1000 select-none"
          keepBuffer={4}
          updateWhenIdle={true}
        />

        {!loading && <ClusterLayer images={mapImages} onClusterClick={(imgs) => {
          setSelectedClusterImages(imgs);
          setCurrentIdx(0);
        }} />}
      </MapContainer>

      {/* Apple-Style Windowed Cluster Gallery - Mobile Optimized */}
      <Dialog open={!!selectedClusterImages} onOpenChange={(open) => !open && setSelectedClusterImages(null)}>
        <DialogContent className="max-w-5xl w-[95vw] md:w-[90vw] h-[85vh] md:h-[80vh] p-0 overflow-hidden bg-white/95 dark:bg-black/95 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] transition-all duration-500 animate-in fade-in zoom-in-95 focus:outline-none">
          {selectedClusterImages && (
            <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
              <img
                key={`bg-${selectedClusterImages[currentIdx].image_url}`}
                src={selectedClusterImages[currentIdx].image_url}
                className="w-full h-full object-cover blur-[50px] md:blur-[80px] scale-125 transition-all duration-1000"
                alt=""
              />
            </div>
          )}

          <div className="relative z-10 w-full h-full flex flex-col">
            {/* Optimized Header */}
            <div className="w-full p-6 md:p-8 flex items-center justify-between">
              <div className="flex flex-col max-w-[70%]">
                <DialogTitle className="text-2xl md:text-3xl font-black tracking-tighter text-black dark:text-white lowercase">
                  indianskyimages.
                </DialogTitle>
                <DialogDescription className="sr-only">
                  View full-resolution images from this location.
                </DialogDescription>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 md:px-3 md:py-1 bg-black/5 dark:bg-white/10 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase text-black/50 dark:text-white/50 truncate max-w-[150px]">
                    {selectedClusterImages?.[currentIdx].location_name || "Somewhere in India"}
                  </span>
                  <span className="text-[10px] font-black text-black/20 dark:text-white/20 hidden md:inline">•</span>
                  <span className="text-[9px] md:text-[10px] font-black tracking-widest uppercase text-black/40 dark:text-white/40">
                    {currentIdx + 1} of {selectedClusterImages?.length}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedClusterImages(null)}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-black dark:text-white backdrop-blur-3xl transition-all active:scale-90 border border-black/5 dark:border-white/10"
              >
                <LuX className="text-xl md:text-2xl" />
              </button>
            </div>

            {/* Content Area - Touch Aware */}
            <div className="flex-1 w-full flex items-center justify-center group overflow-hidden px-4 md:px-10 relative">
              {/* Desktop-Only Navigation Arrows */}
              <div className="absolute inset-y-0 left-0 w-24 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-50">
                <Button variant="ghost" onClick={prevImage} className="rounded-full w-16 h-16 p-0 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-2xl border border-black/5 dark:border-white/5 active:scale-90 transition-all">
                  <LuChevronLeft className="text-3xl" />
                </Button>
              </div>

              {/* Image Container - Slide from Left */}
              {selectedClusterImages && (
                <div className="relative h-full w-full flex items-center justify-center touch-pan-y">
                  <img
                    key={selectedClusterImages[currentIdx].image_url}
                    src={selectedClusterImages[currentIdx].image_url}
                    className="max-h-full max-w-full object-contain rounded-2xl md:rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-left-10 md:slide-in-from-left-20 duration-700 cubic-bezier(0.23, 1, 0.32, 1) pointer-events-none select-none"
                    alt="Gallery view"
                  />
                </div>
              )}

              <div className="absolute inset-y-0 right-0 w-24 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-50">
                <Button variant="ghost" onClick={nextImage} className="rounded-full w-16 h-16 p-0 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-2xl border border-black/5 dark:border-white/5 active:scale-90 transition-all">
                  <LuChevronRight className="text-3xl" />
                </Button>
              </div>
            </div>

            {/* Mobile Touch Controls + Footer Reel */}
            <div className="w-full p-6 md:p-10 flex flex-col items-center gap-4 md:gap-6">
              {/* Mobile Arrows (Compact) */}
              <div className="flex md:hidden items-center gap-8 mb-2">
                <button onClick={prevImage} className="w-12 h-12 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 active:bg-black/10 dark:active:bg-white/10 text-black dark:text-white border border-black/5 dark:border-white/5">
                  <LuChevronLeft className="text-xl" />
                </button>
                <div className="text-[10px] font-black tracking-widest text-black/20 dark:text-white/20 uppercase">Swipe or Tap</div>
                <button onClick={nextImage} className="w-12 h-12 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 active:bg-black/10 dark:active:bg-white/10 text-black dark:text-white border border-black/5 dark:border-white/5">
                  <LuChevronRight className="text-xl" />
                </button>
              </div>

              <div className="flex gap-2.5 md:gap-3 overflow-x-auto pb-4 max-w-full no-scrollbar px-4">
                {selectedClusterImages?.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-12 h-12 md:w-14 md:h-14 flex-shrink-0 rounded-lg md:rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${currentIdx === idx ? 'border-black dark:border-white scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                  >
                    <img src={img.image_url} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
              </div>
              <div className="hidden md:flex bg-black/5 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 px-6 py-2 rounded-full">
                <p className="text-black/60 dark:text-white/60 text-[10px] font-black tracking-widest uppercase">
                  By {selectedClusterImages?.[currentIdx].uploaded_by || "Anonymous"}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 dark:bg-black/70 backdrop-blur-2xl animate-in fade-in">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-[1px] border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
            <p className="text-[11px] font-black tracking-[0.3em] text-black dark:text-white uppercase opacity-40">
              Synchronizing Archive
            </p>
          </div>
        </div>
      )}

      {/* Perspective Vignette */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_200px_rgba(0,0,0,0.8)] mix-blend-multiply" />
    </div>
  );
}
