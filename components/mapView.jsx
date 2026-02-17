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

const INITIAL_CLUSTER_LOAD = 80;

function buildFastImageUrl(url, { width = 1600, quality = "auto:good" } = {}) {
  if (!url || typeof url !== "string") return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_${quality},c_limit,w_${width}/`);
}

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
          return (
            <ClusterMarker
              key={`cluster-${feature.id}`}
              position={[latitude, longitude]}
              count={pointCount}
              onClick={() => {
                const initialCount = Math.min(pointCount, INITIAL_CLUSTER_LOAD);
                const initialPoints = index.getLeaves(feature.id, initialCount, 0);
                const initialImages = initialPoints.map((p) => p.properties.img);
                onClusterClick(initialImages, false);

                if (pointCount > initialCount) {
                  setTimeout(() => {
                    const remainingPoints = index.getLeaves(feature.id, pointCount - initialCount, initialCount);
                    const remainingImages = remainingPoints.map((p) => p.properties.img);
                    onClusterClick(remainingImages, true);
                  }, 0);
                }
              }}
            />
          );
        }

        return <ImageMarker key={`img-${feature.properties.imgId}`} img={feature.properties.img} />;
      })}
    </>
  );
}

function ClusterMarker({ position, count, onClick }) {
  const size = count > 99 ? 56 : count > 19 ? 48 : 40;

  const icon = useMemo(
    () =>
      L.divIcon({
        html: `
      <div style="width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.85);
          color: #fff;
          border: 2px solid rgba(255,255,255,0.75);
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, system-ui, sans-serif;
          font-weight: 800;
          font-size: ${count > 99 ? 14 : 15}px;
          letter-spacing: -0.02em;
          line-height: 1;
        ">
          ${count}
        </div>
      </div>`,
        className: "custom-cluster-icon",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      }),
    [count, size]
  );

  return <Marker position={position} icon={icon} eventHandlers={{ click: onClick }} />;
}

export default function MapView({ darkMode }) {
  const { mapImages, loading } = useImages({ enabled: true });
  const [selectedClusterImages, setSelectedClusterImages] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasImageError, setHasImageError] = useState(false);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const currentImage = selectedClusterImages?.[currentIdx];
  const currentImageUrl = currentImage?.image_url || "";
  const currentDisplayUrl = useMemo(
    () => buildFastImageUrl(currentImageUrl, { width: 1800, quality: "auto:good" }),
    [currentImageUrl]
  );
  const currentBackdropUrl = useMemo(
    () => buildFastImageUrl(currentImageUrl, { width: 480, quality: "auto:low" }),
    [currentImageUrl]
  );

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

  useEffect(() => {
    if (!currentImageUrl) return;
    setIsImageLoading(true);
    setHasImageError(false);
  }, [currentImageUrl]);

  useEffect(() => {
    if (!selectedClusterImages?.length) return;

    const preloadIdxs = [
      (currentIdx + 1) % selectedClusterImages.length,
      (currentIdx - 1 + selectedClusterImages.length) % selectedClusterImages.length,
    ];

    preloadIdxs.forEach((idx) => {
      const nextUrl = selectedClusterImages[idx]?.image_url;
      if (!nextUrl) return;
      const img = new Image();
      img.decoding = "async";
      img.src = buildFastImageUrl(nextUrl, { width: 1400, quality: "auto:good" });
    });
  }, [selectedClusterImages, currentIdx]);

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
            onClusterClick={(imgs, append = false) => {
              const validImages = imgs.filter((img) => !!img?.image_url);
              const nextBatch = validImages.length > 0 ? validImages : imgs;
              setSelectedClusterImages((prev) => {
                if (!append || !prev) return nextBatch;
                return [...prev, ...nextBatch];
              });
              if (!append) {
                setCurrentIdx(0);
              }
            }}
          />
        )}
      </MapContainer>

      <Dialog open={!!selectedClusterImages} onOpenChange={(open) => !open && setSelectedClusterImages(null)}>
        <DialogContent className="max-w-5xl w-[calc(100vw-1.5rem)] sm:w-[95vw] md:w-[90vw] h-[84dvh] sm:h-[85vh] md:h-[80vh] p-0 overflow-hidden bg-white/95 dark:bg-black/95 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[1.1rem] sm:rounded-[2.5rem] md:rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] transition-all duration-500 animate-in fade-in zoom-in-95 focus:outline-none">
          {selectedClusterImages && currentImageUrl && (
            <div className="absolute inset-0 z-0 opacity-30 dark:opacity-50 pointer-events-none">
              <img
                key={`bg-${currentBackdropUrl}`}
                src={currentBackdropUrl}
                className="w-full h-full object-cover blur-[100px] md:blur-[150px] scale-125 transition-all duration-[2000ms]"
                alt=""
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 dark:from-black/50 via-transparent to-white/50 dark:to-black/70" />
            </div>
          )}

          <div className="relative z-10 w-full h-full flex flex-col">
            <div className="w-full p-4 sm:p-8 md:p-10 pr-12 sm:pr-16 flex items-start justify-between">
              <div className="flex flex-col space-y-2 max-w-[85%] sm:max-w-[70%]">
                <DialogTitle className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter text-black dark:text-white lowercase leading-none">
                  indianskyimages
                </DialogTitle>
                <DialogDescription className="sr-only">
                  View full-resolution images from this location.
                </DialogDescription>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="text-[10px] font-black tracking-widest uppercase text-black/40 dark:text-white/40 bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full border border-black/5 dark:border-white/5 shadow-sm">
                    {currentIdx + 1} of {selectedClusterImages?.length}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="flex-1 w-full flex items-center justify-center group overflow-hidden px-2 sm:px-4 md:px-10 relative"
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
                  {currentImageUrl ? (
                    <>
                      <img
                        key={currentDisplayUrl}
                        src={currentDisplayUrl}
                        className={`max-h-[95%] max-w-[95%] object-contain rounded-3xl md:rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-left-10 md:slide-in-from-left-20 duration-700 cubic-bezier(0.23, 1, 0.32, 1) pointer-events-none select-none border border-white/10 ${isImageLoading ? "opacity-0" : "opacity-100"} transition-opacity`}
                        alt="Gallery view"
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        onLoad={() => {
                          setIsImageLoading(false);
                          setHasImageError(false);
                        }}
                        onError={() => {
                          setIsImageLoading(false);
                          setHasImageError(true);
                        }}
                      />
                      {isImageLoading && !hasImageError && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-[88%] h-[88%] rounded-3xl md:rounded-[3rem] border border-white/10 bg-white/10 dark:bg-white/5 animate-pulse" />
                        </div>
                      )}
                      {hasImageError && (
                        <div className="absolute inset-0 flex items-center justify-center px-6">
                          <div className="w-[88%] h-[88%] rounded-3xl md:rounded-[3rem] border border-white/10 bg-white/15 dark:bg-white/5 backdrop-blur-xl flex items-center justify-center">
                            <p className="text-[11px] font-black tracking-widest uppercase text-black/50 dark:text-white/50 text-center">
                              Image unavailable
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-[88%] h-[88%] rounded-3xl md:rounded-[3rem] border border-white/10 bg-white/15 dark:bg-white/5 backdrop-blur-xl flex items-center justify-center">
                      <p className="text-[11px] font-black tracking-widest uppercase text-black/50 dark:text-white/50 text-center">
                        No image source
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="absolute inset-y-0 right-0 w-24 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-50">
                <Button variant="ghost" onClick={nextImage} className="rounded-full w-16 h-16 p-0 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 backdrop-blur-2xl border border-black/5 dark:border-white/5 active:scale-90 transition-all">
                  <LuChevronRight className="text-3xl" />
                </Button>
              </div>
            </div>

            <div className="w-full p-2.5 sm:p-4 md:p-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-2 sm:gap-3 md:gap-4 border-t border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/60 backdrop-blur-xl">
              <div className="flex md:hidden items-center gap-3 mb-1">
                <button onClick={prevImage} className="w-12 h-12 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 active:bg-black/10 dark:active:bg-white/10 text-black dark:text-white border border-black/5 dark:border-white/5">
                  <LuChevronLeft className="text-xl" />
                </button>
                <div className="text-[10px] font-black tracking-widest text-black/20 dark:text-white/20 uppercase">Swipe</div>
                <button onClick={nextImage} className="w-12 h-12 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 active:bg-black/10 dark:active:bg-white/10 text-black dark:text-white border border-black/5 dark:border-white/5">
                  <LuChevronRight className="text-xl" />
                </button>
              </div>

              <div className="hidden md:flex bg-black/5 dark:bg-white/5 backdrop-blur-2xl border border-black/5 dark:border-white/10 px-6 py-2 rounded-full">
                <p className="text-black/60 dark:text-white/60 text-[10px] font-black tracking-widest uppercase">
                  By {currentImage?.uploaded_by || "Anonymous"}
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
              Loading Images
            </p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_200px_rgba(0,0,0,0.8)] mix-blend-multiply" />
    </div>
  );
}
