"use client";

import { MapPin, Info } from "lucide-react";

export default function PreviewCard({ preview, locationName, noLocation = false }) {
  if (!preview) return null;

  return (
    <div className="space-y-4 animate-in fade-in zoom-in-95">
      <div className="relative group overflow-hidden rounded-2xl bg-gray-100 dark:bg-black border border-black/5 dark:border-white/5 shadow-inner">
        <img
          src={preview}
          alt="Preview"
          className="w-full max-h-72 sm:max-h-80 object-cover"
        />
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full text-[10px] uppercase font-black text-white tracking-widest border border-white/10 shadow-lg">
          Preview
        </div>
      </div>

      <div className="px-2 space-y-3">
        {locationName && !noLocation ? (
          <div className="flex items-start gap-3 text-sm text-gray-800 dark:text-white/90 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
            <MapPin className="h-4 w-4 mt-0.5 text-black dark:text-white shrink-0" />
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-black text-black/40 dark:text-white/40 tracking-widest">Location Data</span>
              <p className="font-bold leading-tight line-clamp-2 tracking-tight">{locationName}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5 italic">
            <Info className="h-4 w-4 shrink-0" />
            <span>Missing coordinates. Mapping to center.</span>
          </div>
        )}
      </div>
    </div>
  );
}
