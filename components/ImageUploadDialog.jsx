"use client";

import { useState } from "react";
import exifr from "exifr"; // ✅ Frontend EXIF extraction
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

export default function ImageUploadDialog({ isDialogOpen, setIsDialogOpen, darkMode }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [gpsData, setGpsData] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setMessage({ text: "" });

    try {
      // ✅ Read GPS data from EXIF
      const gps = await exifr.gps(file);
      if (!gps || !gps.latitude || !gps.longitude) {
        setMessage({ text: "❌ This image has no location metadata.", type: "error" });
        setImage(null);
        setGpsData(null);
        return;
      }

      setImage(file);
      setGpsData({ latitude: gps.latitude, longitude: gps.longitude });
      setMessage({ text: `📍 Location found: ${gps.latitude.toFixed(5)}, ${gps.longitude.toFixed(5)}`, type: "success" });
    } catch (err) {
      console.error("EXIF read error:", err);
      setMessage({ text: "❌ Could not read image metadata.", type: "error" });
      setImage(null);
      setGpsData(null);
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage({ text: `❌ ${result.error || "Upload failed."}`, type: "error" });
      } else {
        setMessage({ text: "✅ Image uploaded successfully!", type: "success" });

        setTimeout(() => {
          setIsDialogOpen(false);
          setImage(null);
          setPreview(null);
          setGpsData(null);
          setMessage({ text: "" });
        }, 1000);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage({ text: "❌ Upload failed. Please try again.", type: "error" });
    }

    setUploading(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className={`z-[100] max-w-md w-full mx-auto p-4 rounded-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
        <DialogHeader>
          <DialogTitle className={`text-lg sm:text-xl ${darkMode ? "text-white" : "text-black"}`}>Upload Sky Image</DialogTitle>
        </DialogHeader>

        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Only images with location metadata will be accepted.
        </p>

        <label
          className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer p-4 text-center
          ${darkMode ? "border-gray-500 hover:border-gray-400" : "border-gray-400 hover:border-gray-500"}`}
        >
          <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {preview ? "Click to change image" : "Click to upload or drag an image"}
          </p>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>

        {message.text && (
          <p className={`text-sm font-medium text-center mt-2 ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
            {message.text}
          </p>
        )}

        {preview && (
          <div className="mt-2 flex flex-col items-center">
            <img src={preview} alt="Preview" className="w-full h-auto rounded-md max-h-64 object-cover" />
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 w-full">
          <Button
            variant="secondary"
            onClick={() => setIsDialogOpen(false)}
            className={`w-full sm:w-auto ${darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 text-black hover:bg-gray-300"}`}
          >
            Cancel
          </Button>

          <Button
            onClick={handleUpload}
            disabled={uploading || !image}
            className="w-full sm:w-auto bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
