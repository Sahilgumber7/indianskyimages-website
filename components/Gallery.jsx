"use client";

import { useImages } from "../hooks/useImage";

// Default masonry styles
const columnItem = "break-inside-avoid mb-8 transition-all duration-700 hover:z-10";

export default function Gallery() {
  const { images, loading, error } = useImages();

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 animate-in fade-in">
      <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[2rem] border border-black/10 dark:border-white/10 text-center max-w-md">
        <p className="text-black dark:text-white font-bold tracking-tight text-xl mb-2">Archive Offline.</p>
        <p className="text-gray-500 mb-6 text-sm">Synchronizing with the horizon failed. Please check your signal.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
        >
          Retry Sync
        </button>
      </div>
    </div>
  );

  const skeletons = Array.from({ length: 8 }, (_, i) => (
    <div key={i} className={`${columnItem} animate-pulse`}>
      <div className="w-full bg-gray-100 dark:bg-white/5 rounded-[2.5rem]" style={{ height: `${250 + (i % 3) * 120}px` }}></div>
      <div className="mt-6 space-y-3 px-2">
        <div className="w-2/3 h-5 bg-gray-100 dark:bg-white/5 rounded-full"></div>
        <div className="w-1/2 h-3 bg-gray-50 dark:bg-white/5 rounded-full opacity-50"></div>
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-700">
      <div className="max-w-[1700px] mx-auto px-6 sm:px-10 lg:px-16 py-32 sm:py-48">
        <div className="mb-24 space-y-6 max-w-3xl animate-in fade-in slide-in-from-left-8 duration-1000">
          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter text-black dark:text-white lowercase">
            indianskyimages <span className="opacity-20 italic">archive.</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-xl leading-relaxed">
            A collective observation of the heavens above India.
          </p>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-10 space-y-10">
          {loading
            ? skeletons
            : images.map((img, i) => (
              <div
                key={img.id || i}
                className={`${columnItem} group relative overflow-hidden rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:shadow-[0_32px_64px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_32px_64px_rgba(255,255,255,0.05)] hover:scale-[1.03] transition-all duration-700 animate-in fade-in slide-in-from-bottom-12 cursor-none`}
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={img.image_url}
                    alt={
                      img.location_name
                        ? `Sky image from ${img.location_name}`
                        : "Sky image from India"
                    }
                    className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105 group-hover:blur-sm"
                    loading={i < 2 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  {/* High-quality Apple-style Overlay */}
                  <div className="absolute inset-0 bg-white/10 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-md flex flex-col justify-end p-10">
                    <span className="text-black dark:text-white font-black text-2xl tracking-tighter line-clamp-2 mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100 uppercase">
                      {img.location_name || img.locationName || "Somewhere in India"}
                    </span>
                    <span className="text-black/50 dark:text-white/50 text-xs font-bold uppercase tracking-[0.2em] translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-200">
                      By {img.uploaded_by || "Anonymous"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
