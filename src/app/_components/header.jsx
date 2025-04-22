"use client";
import { FaInstagram, FaXTwitter, FaMoon, FaSun } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import ImageUploadDialog from "./ImageUploadDialog";
import { useState, useEffect } from "react";

export default function Header({ isDialogOpen, setIsDialogOpen, setDarkMode, darkMode, isGlobeView, setIsGlobeView }) {
  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setDarkMode(storedTheme === "dark");
    }
  }, []);


  function toggleDarkMode() {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  }

  return (
    <div className="absolute top-0 left-0 w-full flex justify-between items-center p-3 sm:p-4 bg-white dark:bg-gray-900 shadow-lg z-50 transition">
      <h1 className="font-bold text-lg md:text-3xl text-black dark:text-white">
        indianskyimages.
      </h1>

      <div className="flex items-center space-x-3 sm:space-x-4">
        <a href="https://t.co/DenLkvA9pO" target="_blank" rel="noopener noreferrer">
          <FaInstagram className="text-black dark:text-white hover:text-gray-600 transition text-lg sm:text-xl" />
        </a>

        <a href="https://x.com/indianskyimages" target="_blank" rel="noopener noreferrer">
          <FaXTwitter className="text-black dark:text-white hover:text-gray-600 transition text-lg sm:text-xl" />
        </a>

        <Button
        onClick={() => setIsGlobeView((prev) => !prev)}
        variant="outline"
        className="ml-2"
        >
        {isGlobeView ? "🗺 2D Map" : "🌍 3D Globe"}
        </Button>

        {/* Toggle Dark Mode */}
        <button onClick={toggleDarkMode} className="p-1 sm:p-2 rounded-full bg-gray-200 dark:bg-gray-800">
          {darkMode ? (
            <FaSun className="text-yellow-500 text-lg sm:text-xl" />
          ) : (
            <FaMoon className="text-gray-800 dark:text-white text-lg sm:text-xl" />
          )}
        </button>

        <Button onClick={() => setIsDialogOpen(true)} className="bg-black dark:bg-white text-white dark:text-black">
          Upload
        </Button>
      </div>

      {/* Image Upload Dialog */}
      <ImageUploadDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} darkMode={darkMode} />
    </div>
  );
}
