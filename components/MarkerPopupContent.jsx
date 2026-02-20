"use client";

import Link from "next/link";
import { useReverseGeocode } from "../hooks/useReverseGeocde";
import { buildFastImageUrl } from "../lib/images";

export default function MarkerPopupContent({ img }) {
  const lat = parseFloat(img.latitude);
  const lon = parseFloat(img.longitude);
  const locationName = useReverseGeocode({ latitude: lat, longitude: lon });

  return (
    <div className="w-[min(78vw,20rem)] sm:w-72 overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-white/95 dark:bg-black/95 backdrop-blur-3xl border border-black/5 dark:border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-500">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={buildFastImageUrl(img.image_url, { width: 700, quality: "auto:good" })}
          alt="Sky"
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">Contributor</p>
          <p className="text-sm font-bold text-white tracking-tight max-w-[14rem] truncate">
            {img.uploaded_by || "Anonymous"}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">
          Archive Location
        </span>
        <p className="text-sm font-semibold text-black dark:text-white leading-snug tracking-tight break-words">
          {locationName ? locationName : `${lat.toFixed(4)} deg, ${lon.toFixed(4)} deg`}
        </p>
        {img?._id ? (
          <Link
            href={`/image/${img._id}`}
            className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
          >
            Open Detail
          </Link>
        ) : null}
      </div>
    </div>
  );
}
