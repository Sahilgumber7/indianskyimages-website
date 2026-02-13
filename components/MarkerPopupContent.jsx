"use client";

import { useReverseGeocode } from "../hooks/useReverseGeocde";

export default function MarkerPopupContent({ img }) {
  const lat = parseFloat(img.latitude);
  const lon = parseFloat(img.longitude);

  // Fetch location name using hook
  const locationName = useReverseGeocode({ latitude: lat, longitude: lon });

  return (
    <div className="w-64 overflow-hidden rounded-[2rem] bg-white/95 dark:bg-black/95 backdrop-blur-3xl border border-black/5 dark:border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-500">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={img.image_url}
          alt="Sky"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">Contributor</p>
          <p className="text-sm font-bold text-white tracking-tight">{img.uploaded_by || "Anonymous"}</p>
        </div>
      </div>

      <div className="p-6 space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">Archive Location</span>
        <p className="text-sm font-semibold text-black dark:text-white leading-snug tracking-tight">
          {locationName ? locationName : `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`}
        </p>
      </div>
    </div>
  );
}
