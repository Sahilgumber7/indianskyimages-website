"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  FaInstagram,
  FaXTwitter,
  FaMoon,
  FaSun,
} from "react-icons/fa6";
import { IoEarthOutline } from "react-icons/io5";
import { CiMap } from "react-icons/ci";
import { LuUpload, LuImage } from "react-icons/lu";
import { Button } from "./ui/button";
import ImageUploadDialog from "./ImageUploadDialog";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";

export default function Header({
  isDialogOpen,
  setIsDialogOpen,
  isGlobeView,
  setIsGlobeView,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isDark = mounted && (theme === "dark" || resolvedTheme === "dark");

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl px-6 py-3 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.1)] z-50 flex justify-between items-center transition-all duration-700 animate-in fade-in slide-in-from-top-4">
      {/* Apple-style Logo */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <h1 className="font-bold text-xl md:text-2xl text-black dark:text-white tracking-tight hover:opacity-70 transition-opacity cursor-pointer">
            indianskyimages.
          </h1>
        </Link>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60">Live Archive</span>
        </div>
      </div>

      {/* Modern Desktop Menu */}
      <div className="hidden sm:flex items-center space-x-6">
        <div className="flex items-center space-x-1">
          {[
            { href: "https://t.co/DenLkvA9pO", icon: <FaInstagram /> },
            { href: "https://x.com/indianskyimages", icon: <FaXTwitter /> },
          ].map(({ href, icon }, idx) => (
            <a
              key={idx}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300 active:scale-90"
            >
              {icon}
            </a>
          ))}
        </div>

        <div className="h-6 w-[1px] bg-black/10 dark:bg-white/10 mx-2" />

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <button
            onClick={() => setIsGlobeView((prev) => !prev)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white hover:scale-105 transition-transform"
            aria-label="Toggle View"
          >
            {isGlobeView ? <CiMap className="text-xl" /> : <IoEarthOutline className="text-xl" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white hover:scale-105 transition-transform"
            aria-label="Toggle Theme"
          >
            {mounted ? (
              resolvedTheme === "dark" ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />
            ) : (
              <div className="w-4 h-4 animate-spin border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full" />
            )}
          </button>

          {/* Gallery Link */}
          <Link href="/gallery">
            <Button variant="ghost" className="rounded-full px-6 font-semibold text-sm hover:bg-black/5 dark:hover:bg-white/10">
              Gallery
            </Button>
          </Link>

          {/* Primary Upload */}
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-black dark:bg-white text-white dark:text-black rounded-full px-6 py-5 font-bold text-sm shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
          >
            <LuUpload className="text-lg" />
            Upload
          </Button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="flex sm:hidden items-center gap-2">
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-black dark:bg-white text-white dark:text-black rounded-full w-10 h-10 p-0 flex items-center justify-center"
        >
          <LuUpload className="text-lg" />
        </Button>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white"
        >
          {mobileMenuOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-[calc(100%+12px)] right-0 w-64 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2rem] p-4 flex flex-col gap-2 shadow-2xl animate-in fade-in slide-in-from-top-4">
          {/* Mobile Items */}
          <button
            onClick={() => { setIsGlobeView(!isGlobeView); setMobileMenuOpen(false); }}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 text-left transition-colors"
          >
            {isGlobeView ? <CiMap className="text-xl" /> : <IoEarthOutline className="text-xl" />}
            <span className="font-semibold">{isGlobeView ? "Map View" : "Globe View"}</span>
          </button>

          <Link href="/gallery" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <LuImage className="text-xl" />
              <span className="font-semibold">Gallery</span>
            </div>
          </Link>

          <button
            onClick={() => { toggleDarkMode(); setMobileMenuOpen(false); }}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 text-left transition-colors"
          >
            {resolvedTheme === "dark" ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            <span className="font-semibold">Appearance</span>
          </button>
        </div>
      )}

      {/* Dialog remains same, but we will polish it next */}
      <ImageUploadDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </header>
  );
}
