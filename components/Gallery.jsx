"use client";

import { useImages } from "../hooks/useImage";
import { useEffect, useState } from "react";

// Default masonry styles
const columnItem = {
  breakInside: "avoid",
  marginBottom: "1.5rem",
};

export default function Gallery() {
  const { images, loading, error } = useImages();
  const [columns, setColumns] = useState(4);

  // Update column count based on screen width
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) setColumns(2); // mobile
      else if (window.innerWidth < 1024) setColumns(3); // tablet
      else setColumns(4); // desktop
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  if (loading) return <p className="text-center py-4">Loading...</p>;
  if (error) return <p className="text-center py-4 text-red-500">{error}</p>;

  return (
    <div
      style={{ columnCount: columns, columnGap: "1.5rem" }}
      className="px-4 pt-24 bg-gray-50 dark:bg-gray-900 transition-colors"
    >
      {images.map((img, i) => (
        <div key={i} style={columnItem}>
          <img
            src={img.image_url}
            alt={img.locationName || "Sky"}
            className="
              w-full rounded-xl shadow-md transition-all duration-300
              hover:scale-105 hover:shadow-xl hover:rotate-1
              cursor-pointer
              dark:brightness-90
              active:scale-95 active:rotate-0
            "
          />
        </div>
      ))}
    </div>
  );
}
