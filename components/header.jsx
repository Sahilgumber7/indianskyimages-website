"use client";

import { useState, useEffect } from "react";
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
  setDarkMode,
  darkMode,
  isGlobeView,
  setIsGlobeView,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) setDarkMode(storedTheme === "dark");
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return (
    <header className="absolute top-0 left-0 w-full p-3 sm:p-4 bg-white dark:bg-gray-900 shadow-lg z-50 flex justify-between items-center">
      {/* Logo */}
      <Link href="/">
        <h1 className="font-bold text-lg md:text-3xl text-black dark:text-white">
          indianskyimages.
        </h1>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
        {/* Social Links */}
        {[ 
          { href: "https://t.co/DenLkvA9pO", icon: <FaInstagram /> },
          { href: "https://x.com/indianskyimages", icon: <FaXTwitter /> },
        ].map(({ href, icon }, idx) => (
          <a
            key={idx}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black dark:text-white hover:text-gray-600 transition text-lg sm:text-xl"
          >
            {icon}
          </a>
        ))}

        {/* Globe/Map Toggle */}
        <button
          onClick={() => setIsGlobeView((prev) => !prev)}
          className="p-1 sm:p-2 rounded-full bg-gray-200 dark:bg-gray-800"
        >
          {isGlobeView ? <CiMap className="text-lg" /> : <IoEarthOutline className="text-lg" />}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1 sm:p-2 rounded-full bg-gray-200 dark:bg-gray-800"
        >
          {darkMode ? (
            <FaSun className="text-yellow-500 text-lg sm:text-xl" />
          ) : (
            <FaMoon className="text-gray-800 dark:text-white text-lg sm:text-xl" />
          )}
        </button>

        {/* Upload Button */}
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-black dark:bg-white text-white dark:text-black flex items-center gap-2"
        >
          <LuUpload className="text-lg" />
          <span className="hidden sm:inline">Upload</span>
        </Button>

        {/* Gallery Button */}
        <Link href="/gallery">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white dark:text-white flex items-center gap-2">
            <LuImage className="text-lg" />
            <span className="hidden sm:inline">Gallery</span>
          </Button>
        </Link>
      </div>

      {/* Mobile Menu Buttons */}
      <div className="flex sm:hidden items-center space-x-2">
        {/* Upload Button */}
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-black dark:bg-white text-white dark:text-black flex items-center gap-2 p-2"
        >
          <LuUpload className="text-lg" />
        </Button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-800"
        >
          {darkMode ? (
            <FaSun className="text-yellow-500 text-lg" />
          ) : (
            <FaMoon className="text-gray-800 dark:text-white text-lg" />
          )}
        </button>

        {/* Hamburger Menu */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-800"
        >
          {mobileMenuOpen ? <HiX className="text-lg" /> : <HiMenu className="text-lg" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 flex flex-col space-y-3 z-50">
          {/* Social Links */}
          {[ 
            { href: "https://t.co/DenLkvA9pO", icon: <FaInstagram /> },
            { href: "https://x.com/indianskyimages", icon: <FaXTwitter /> },
          ].map(({ href, icon }, idx) => (
            <a
              key={idx}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-black dark:text-white hover:text-gray-600"
            >
              {icon}
              <span className="text-sm">Link</span>
            </a>
          ))}

          {/* Globe/Map Toggle */}
          <button
            onClick={() => setIsGlobeView((prev) => !prev)}
            className="flex items-center gap-2 p-2 rounded bg-gray-200 dark:bg-gray-800"
          >
            {isGlobeView ? <CiMap /> : <IoEarthOutline />}
            <span>Map / Globe</span>
          </button>

          {/* Gallery */}
          <Link href="/gallery">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white dark:text-white flex items-center gap-2 justify-center">
              <LuImage className="text-lg" />
              <span className="hidden sm:inline">Gallery</span>
            </Button>
          </Link>
        </div>
      )}

      {/* Image Upload Dialog */}
      <ImageUploadDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        darkMode={darkMode}
      />
    </header>
  );
}
