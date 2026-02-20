"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useImages } from "../hooks/useImage";
import { buildFastImageUrl } from "../lib/images";

const columnItem = "break-inside-avoid mb-8 transition-all duration-700 hover:z-10";

function toStateSlug(name = "") {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function Gallery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [queryInput, setQueryInput] = useState(searchParams.get("q") || "");

  const page = Number(searchParams.get("page") || 1);
  const filters = useMemo(
    () => ({
      q: searchParams.get("q") || "",
      state: searchParams.get("state") || "",
      uploader: searchParams.get("uploader") || "",
      dateFrom: searchParams.get("dateFrom") || "",
      dateTo: searchParams.get("dateTo") || "",
      includeNoLocation: true,
    }),
    [searchParams]
  );

  const { images, loading, error, pagination, topStates, leaderboards } = useImages({
    enabled: true,
    filters,
    page,
    limit: 36,
  });

  const setParam = (name, value) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) next.delete(name);
    else next.set(name, value);
    if (name !== "page") next.delete("page");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 animate-in fade-in">
        <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[2rem] border border-black/10 dark:border-white/10 text-center max-w-md">
          <p className="text-black dark:text-white font-bold tracking-tight text-xl mb-2">Archive Offline.</p>
          <p className="text-gray-500 mb-6 text-sm">Synchronizing with the horizon failed. Please check your signal.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
          >
            Retry Sync
          </button>
        </div>
      </div>
    );

  const skeletons = Array.from({ length: 8 }, (_, i) => (
    <div key={i} className={`${columnItem} animate-pulse`}>
      <div className="w-full bg-gray-100 dark:bg-white/5 rounded-[2.5rem]" style={{ height: `${250 + (i % 3) * 120}px` }} />
      <div className="mt-6 space-y-3 px-2">
        <div className="w-2/3 h-5 bg-gray-100 dark:bg-white/5 rounded-full" />
        <div className="w-1/2 h-3 bg-gray-50 dark:bg-white/5 rounded-full opacity-50" />
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-700">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-10 lg:px-16 py-24 sm:py-40">
        <div className="mb-10 sm:mb-12 space-y-4 sm:space-y-6 max-w-4xl animate-in fade-in slide-in-from-left-8 duration-1000">
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-black dark:text-white lowercase">
            indianskyimages <span className="opacity-20 italic">archive.</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-base sm:text-xl leading-relaxed">
            Search by place, contributor, date, and explore state archives.
          </p>
        </div>

        <section className="mb-8 isi-surface p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setParam("q", queryInput.trim())}
              placeholder="Search location or uploader"
              className="h-11 md:col-span-2 rounded-xl border border-black/10 dark:border-white/10 px-3 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
              aria-label="Search images"
            />
            <input
              defaultValue={filters.state}
              onBlur={(e) => setParam("state", e.target.value.trim())}
              placeholder="State"
              className="h-11 rounded-xl border border-black/10 dark:border-white/10 px-3 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
              aria-label="Filter by state"
            />
            <input
              defaultValue={filters.uploader}
              onBlur={(e) => setParam("uploader", e.target.value.trim())}
              placeholder="Uploader"
              className="h-11 rounded-xl border border-black/10 dark:border-white/10 px-3 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
              aria-label="Filter by uploader"
            />
            <input
              type="date"
              defaultValue={filters.dateFrom}
              onChange={(e) => setParam("dateFrom", e.target.value)}
              className="h-11 rounded-xl border border-black/10 dark:border-white/10 px-3 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
              aria-label="Filter start date"
            />
            <input
              type="date"
              defaultValue={filters.dateTo}
              onChange={(e) => setParam("dateTo", e.target.value)}
              className="h-11 rounded-xl border border-black/10 dark:border-white/10 px-3 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
              aria-label="Filter end date"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setParam("q", queryInput.trim())}
              className="isi-btn isi-btn-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
            >
              Apply Search
            </button>
            <button
              onClick={() => router.push(pathname)}
              className="isi-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
            >
              Clear Filters
            </button>
            <Link
              href="/states"
              className="isi-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
            >
              Browse States
            </Link>
          </div>
          {topStates.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {topStates.map((item) => (
                <Link
                  key={item.name}
                  href={`/states/${toStateSlug(item.name)}`}
                  className="isi-chip h-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
                >
                  {item.name} ({item.count})
                </Link>
              ))}
            </div>
          )}
          {(leaderboards.week.length > 0 || leaderboards.month.length > 0) && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-black/10 dark:border-white/10 p-3 bg-black/[0.02] dark:bg-white/[0.02]">
                <p className="text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50 mb-2">Top This Week</p>
                <div className="space-y-1">
                  {leaderboards.week.map((row) => (
                    <Link key={`week-${row.name}`} href={`/contributor/${encodeURIComponent(row.name)}`} className="block text-xs underline underline-offset-2">
                      {row.name} ({row.count})
                    </Link>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-black/10 dark:border-white/10 p-3 bg-black/[0.02] dark:bg-white/[0.02]">
                <p className="text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50 mb-2">Top This Month</p>
                <div className="space-y-1">
                  {leaderboards.month.map((row) => (
                    <Link key={`month-${row.name}`} href={`/contributor/${encodeURIComponent(row.name)}`} className="block text-xs underline underline-offset-2">
                      {row.name} ({row.count})
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 sm:gap-10 space-y-6 sm:space-y-10">
          {loading
            ? skeletons
            : images.map((img, i) => (
              <Link
                key={img._id || i}
                href={`/image/${img._id}`}
                className={`${columnItem} block group relative overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:shadow-[0_32px_64px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_32px_64px_rgba(255,255,255,0.05)] hover:scale-[1.03] transition-all duration-700 animate-in fade-in slide-in-from-bottom-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white`}
                style={{ animationDelay: `${i * 35}ms`, animationFillMode: "both" }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={buildFastImageUrl(img.image_url, { width: 900 })}
                    alt={img.location_name ? `Sky image from ${img.location_name}` : "Sky image from India"}
                    className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                    loading={i < 2 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/65 to-transparent">
                    <span className="block text-white font-black text-sm tracking-tight line-clamp-2 mb-1">
                      {img.location_name || "Unknown Location"}
                    </span>
                    <span className="block text-white/75 text-[10px] font-bold uppercase tracking-[0.18em]">
                      By {img.uploaded_by || "Anonymous"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {!loading && (
          <div className="mt-8 flex justify-center gap-3">
            {page > 1 && (
              <button
                onClick={() => setParam("page", String(page - 1))}
                className="isi-btn px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
              >
                Previous
              </button>
            )}
            {pagination.hasMore && (
            <button
              onClick={() => setParam("page", String(page + 1))}
              className="isi-btn px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
            >
              Next Page
            </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
