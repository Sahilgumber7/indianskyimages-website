"use client";

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 sm:px-6 py-6 text-sm text-black/70 dark:text-white/70 sm:flex-row sm:items-center sm:justify-between">
        <p>Indian Sky Images</p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/" className="hover:opacity-70 transition-opacity">
            Home
          </Link>
          <Link href="/gallery" className="hover:opacity-70 transition-opacity">
            Gallery
          </Link>
          <Link href="/sitemap.xml" className="hover:opacity-70 transition-opacity">
            Sitemap
          </Link>
          <Link href="/robots.txt" className="hover:opacity-70 transition-opacity">
            Robots
          </Link>
          <Link href="/llms.txt" className="hover:opacity-70 transition-opacity">
            LLMs
          </Link>
        </nav>
      </div>
    </footer>
  );
}
