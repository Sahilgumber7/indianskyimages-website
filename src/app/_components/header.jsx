"use client";
import { FaInstagram, FaXTwitter, FaMoon, FaSun } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import ImageUploadDialog from "./ImageUploadDialog";
import { useState, useEffect } from "react";

export default function Header({ isDialogOpen, setIsDialogOpen, setDarkMode, darkMode }) {
  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setDarkMode(storedTheme === "dark");
    }
  }, []);

  // Toggle Dark Mode and Save to LocalStorage
  function toggleDarkMode() {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  }

  return (
    <div className="absolute top-0 left-0 w-full flex justify-between items-center p-4 bg-white dark:bg-gray-900 shadow-lg z-50 transition">
      <h1 className="font-bold text-lg md:text-3xl text-black dark:text-white">
        indianskyimages.
      </h1>

      <div className="flex items-center space-x-4">
        <a href="https://t.co/DenLkvA9pO" target="_blank" rel="noopener noreferrer">
          <FaInstagram size={24} className="text-black dark:text-white hover:text-gray-600 transition" />
        </a>

        <a href="https://x.com/indianskyimages" target="_blank" rel="noopener noreferrer">
          <FaXTwitter size={24} className="text-black dark:text-white hover:text-gray-600 transition" />
        </a>

        {/* Toggle Dark Mode */}
        <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-200 dark:bg-gray-800">
          {darkMode ? <FaSun size={24} className="text-yellow-500" /> : <FaMoon size={24} className="text-gray-800 dark:text-white" />}
        </button>

        <Button onClick={() => setIsDialogOpen(true)}  className="bg-black dark:bg-white  text-white dark:text-black">
          Upload Image
        </Button>
      </div>

      {/* Image Upload Dialog */}
      <ImageUploadDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} darkMode={darkMode} />

    </div>
  );
}
