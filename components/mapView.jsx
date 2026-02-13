"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, ZoomControl, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useImages } from "../hooks/useImage";
import ImageMarker from "./ImageMarker";
import Supercluster from "supercluster";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

function ClusterLayer({ images, onClusterClick }) {
  const map = useMap();
  const [clusters, setClusters] = useState([]);

  const index = useMemo(() => {
    const sc = new Supercluster({
      radius: 65,
      maxZoom: 16,
    });

    const points = images.map((img) => ({
      type: "Feature",
      properties: { cluster: false, imgId: img._id, img },
      geometry: {
        type: "Point",
        coordinates: [parseFloat(img.longitude), parseFloat(img.latitude)],
      },
    }));

    sc.load(points);
    return sc;
  }, [images]);

  const updateClusters = useCallback(() => {
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];
    setClusters(index.getClusters(bbox, zoom));
  }, [index, map]);

  useEffect(() => {
    updateClusters();
    map.on("moveend", updateClusters);
    map.on("zoomend", updateClusters);

    return () => {
      map.off("moveend", updateClusters);
      map.off("zoomend", updateClusters);
    };
  }, [map, updateClusters]);

  return (
    <>
      {clusters.map((feature) => {
        const [longitude, latitude] = feature.geometry.coordinates;
        const { cluster, point_count: pointCount } = feature.properties;

        if (cluster) {
          const firstLeaf = index.getLeaves(feature.id, 1)[0];
          const previewUrl = firstLeaf?.properties?.img?.image_url;

          return (
            <div key={`cluster-${feature.id}`}>
              <ClusterMarker
                position={[latitude, longitude]}
                count={pointCount}
                previewUrl={previewUrl}
                onClick={() => {
                  const clusterPoints = index.getLeaves(feature.id, pointCount);
                  const clusterImages = clusterPoints.map((p) => p.properties.img);
                  onClusterClick(clusterImages);
                }}
              />
            </div>
          );
        }

        return <ImageMarker key={`img-${feature.properties.imgId}`} img={feature.properties.img} />;
      })}
    </>
  );
}

function ClusterMarker({ position, count, previewUrl, onClick }) {
  const icon = useMemo(
    () =>
      L.divIcon({
        html: `
      <div class="group" style="width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="position: absolute; width: 48px; height: 48px; background: #fff; border-radius: 12px; transform: rotate(-3deg) translate(-2px, -2px); border: 1.5px solid rgba(0,0,0,0.1); z-index: 1;"></div>
        <div style="position: absolute; width: 48px; height: 48px; background: #fff; border-radius: 12px; transform: rotate(3deg) translate(2px, 2px); border: 1.5px solid rgba(0,0,0,0.1); z-index: 2;"></div>

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
          <img src="${previewUrl}" loading="lazy" decoding="async" style="width: 100%; height: 100%; object-fit: cover;" />

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
        className: "custom-cluster-icon",
        iconSize: [70, 70],
        iconAnchor: [35, 35],
      }),
    [count, previewUrl]
  );

  return <Marker position={position} icon={icon} eventHandlers={{ click: onClick }} />;
}

export default function MapView({ darkMode }) {
  const { mapImages, loading } = useImages();
  const [selectedClusterImages, setSelectedClusterImages] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  const onTouchStart = (e) => {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const nextImage = useCallback(() => {
    if (selectedClusterImages) {
      setCurrentIdx((prev) => (prev + 1) % selectedClusterImages.length);
    }
  }, [selectedClusterImages]);

  const prevImage = useCallback(() => {
    if (selectedClusterImages) {
      setCurrentIdx((prev) => (prev - 1 + selectedClusterImages.length) % selectedClusterImages.length);
    }
  }, [selectedClusterImages]);

  useEffect(() => {
    if (!selectedClusterImages) return;

    const onKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        nextImage();
      } else if (event.key === "ArrowLeft") {
        prevImage();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nextImage, prevImage, selectedClusterImages]);

  const onTouchEnd = (e) => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      nextImage();
      e.stopPropagation();
    }

    if (isRightSwipe) {
      prevImage();
      e.stopPropagation();
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
          keepBuffer={2}
          updateWhenIdle={true}
        />

        {!loading && (
          <ClusterLayer
            images={mapImages}
            onClusterClick={(imgs) => {
              setSelectedClusterImages(imgs);
              setCurrentIdx(0);
            }}
          />
        )}
      </MapContainer>

      <Dialog open={!!selectedClusterImages} onOpenChange={(open) => !open && setSelectedClusterImages(null)}>
        <DialogContent className="max-w-5xl w-[calc(100vw-0.75rem)] sm:w-[95vw] md:w-[90vw] h-[calc(100dvh-0.75rem)] sm:h-[85vh] md:h-[80vh] p-0 overflow-hidden bg-white/95 dark:bg-black/95 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] md:rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] transition-all duration-500 animate-in fade-in zoom-in-95 focus:outline-none">
          {selectedClusterImages && (
            <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
              <img
                key={`bg-${selectedClusterImages[currentIdx].image_url}`}
                src={selectedClusterImages[currentIdx].image_url}
                className="w-full h-full object-cover blur-[50px] md:blur-[80px] scale-125 transition-all duration-1000"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          <div className="relative z-10 w-full h-full flex flex-col">
            <div className="w-full p-4 sm:p-6 md:p-8 pr-14 sm:pr-16 flex items-center justify-between">
              <div className="flex flex-col max-w-[85%] sm:max-w-[70%]">
                <DialogTitle className="text-2xl md:text-3xl font-black tracking-tighter text-black dark:text-white lowercase">
                  indianskyimages archive.
                </DialogTitle>
                <DialogDescription className="sr-only">
                  View full-resolution images from this location.
                </DialogDescription>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 md:px-3 md:py-1 bg-black/5 dark:bg-white/10 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase text-black/50 dark:text-white/50 truncate max-w-[58vw] sm:max-w-[150px]">
                    {selectedClusterImages?.[currentIdx].location_name || "Somewhere in India"}
                  </span>
                  <span className="text-[10px] font-black text-black/20 dark:text-white/20 hidden md:inline">•</span>
                  <span className="text-[9px] md:text-[10px] font-black tracking-widest uppercase text-black/40 dark:text-white/40">
                    {currentIdx + 1} of {selectedClusterImages?.length}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="flex-1 w-full flex items-center justify-center group overflow-hidden px-3 sm:px-4 md:px-10 relative"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="absolute inset-y-0 left-0 w-24 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-50">
                <Button variant="ghost" onClick={prevImage} className="rounded-full w-16 h-16 p-0 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-2xl border border-black/5 dark:border-white/5 active:scale-90 transition-all">
                  <LuChevronLeft className="text-3xl" />
                </Button>
              </div>

              {selectedClusterImages && (
                <div className="relative h-full w-full flex items-center justify-center touch-pan-y">
                  <img
                    key={selectedClusterImages[currentIdx].image_url}
                    src={selectedClusterImages[currentIdx].image_url}
                    className="max-h-full max-w-full object-contain rounded-2xl md:rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-left-10 md:slide-in-from-left-20 duration-700 cubic-bezier(0.23, 1, 0.32, 1) pointer-events-none select-none"
                    alt="Gallery view"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              )}

              <div className="absolute inset-y-0 right-0 w-24 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-50">
                <Button variant="ghost" onClick={nextImage} className="rounded-full w-16 h-16 p-0 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-2xl border border-black/5 dark:border-white/5 active:scale-90 transition-all">
                  <LuChevronRight className="text-3xl" />
                </Button>
              </div>
            </div>

            <div className="w-full p-4 sm:p-6 md:p-10 pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-3 sm:gap-4 md:gap-6 border-t border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/60 backdrop-blur-xl">
              <div className="flex md:hidden items-center gap-5 mb-1">
                <button onClick={prevImage} className="w-12 h-12 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 active:bg-black/10 dark:active:bg-white/10 text-black dark:text-white border border-black/5 dark:border-white/5">
                  <LuChevronLeft className="text-xl" />
                </button>
                <div className="text-[10px] font-black tracking-widest text-black/20 dark:text-white/20 uppercase">Swipe or Tap</div>
                <button onClick={nextImage} className="w-12 h-12 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 active:bg-black/10 dark:active:bg-white/10 text-black dark:text-white border border-black/5 dark:border-white/5">
                  <LuChevronRight className="text-xl" />
                </button>
              </div>

              <div className="flex gap-2.5 md:gap-3 overflow-x-auto pb-2 sm:pb-4 max-w-full no-scrollbar px-2 sm:px-4">
                {selectedClusterImages?.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-12 h-12 md:w-14 md:h-14 flex-shrink-0 rounded-lg md:rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${currentIdx === idx ? "border-black dark:border-white scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"}`}
                  >
                    <img src={img.image_url} className="w-full h-full object-cover" alt="" loading="lazy" decoding="async" />
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

      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_200px_rgba(0,0,0,0.8)] mix-blend-multiply" />
    </div>
  );
}

