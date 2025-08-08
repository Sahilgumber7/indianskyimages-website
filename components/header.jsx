"use client";

import { useEffect } from "react";
import {
  FaInstagram,
  FaXTwitter,
  FaMoon,
  FaSun,
} from "react-icons/fa6";
import { IoEarthOutline } from "react-icons/io5";
import { CiMap } from "react-icons/ci";
import { LuUpload } from "react-icons/lu";
import { Button } from "./ui/button";
import ImageUploadDialog from "./ImageUploadDialog";

export default function Header({
  isDialogOpen,
  setIsDialogOpen,
  setDarkMode,
  darkMode,
  isGlobeView,
  setIsGlobeView,
}) {
  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setDarkMode(storedTheme === "dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return (
    <div className="absolute top-0 left-0 w-full flex justify-between items-center p-3 sm:p-4 bg-white dark:bg-gray-900 shadow-lg z-50 transition">
      <h1 className="font-bold text-lg md:text-3xl text-black dark:text-white">
        indianskyimages.
      </h1>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {[
          {
            href: "https://t.co/DenLkvA9pO",
            icon: <FaInstagram />,
          },
          {
            href: "https://x.com/indianskyimages",
            icon: <FaXTwitter />,
          },
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

        <button
          onClick={() => setIsGlobeView((prev) => !prev)}
          className="p-1 sm:p-2 rounded-full bg-gray-200 dark:bg-gray-800"
        >
          {isGlobeView ? <CiMap className="text-lg" /> : <IoEarthOutline className="text-lg" />}
        </button>

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

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-black dark:bg-white text-white dark:text-black flex items-center gap-2"
        >
          <LuUpload className="text-lg" />
          <span className="hidden sm:inline">Upload</span>
        </Button>
      </div>

      <ImageUploadDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        darkMode={darkMode}
      />
    </div>
  );
}
