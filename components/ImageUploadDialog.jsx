"use client";

import { useState, useCallback } from "react";
import exifr from "exifr";
import heic2any from "heic2any";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2, Upload, XCircle, CheckCircle, MapPin } from "lucide-react";

export default function ImageUploadDialog({ isDialogOpen, setIsDialogOpen, darkMode }) {
  const [image, setImage] = useState(null); // original file (upload)
  const [preview, setPreview] = useState(null); // preview URL (jpg/webp)
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [gpsData, setGpsData] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [uploadedBy, setUploadedBy] = useState("");

  const resetForm = () => {
    setImage(null);
    setPreview(null);
    setGpsData(null);
    setLocationName(null);
    setUploadedBy("");
    setMessage(null);
  };

  const fetchLocationName = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      return data.display_name || "Unknown location";
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      return "Unknown location";
    }
  };

  const readFile = async (file) => {
    if (!file) return;

    setMessage(null);

    let previewUrl = null;
    try {
      // Convert HEIF/HEIC to JPEG for preview
      if (
        file.type === "image/heif" ||
        file.type === "image/heic" ||
        file.name.endsWith(".heif") ||
        file.name.endsWith(".heic")
      ) {
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8,
        });
        previewUrl = URL.createObjectURL(convertedBlob);
      } else {
        previewUrl = URL.createObjectURL(file);
      }

      setPreview(previewUrl);

      // Read EXIF GPS
      const gps = await exifr.gps(file);
      if (!gps?.latitude || !gps?.longitude) {
        setMessage({ text: "❌ This image has no location metadata.", type: "error" });
        setImage(null);
        setGpsData(null);
        setLocationName(null);
        return;
      }

      setImage(file);
      setGpsData({ latitude: gps.latitude, longitude: gps.longitude });

      const locName = await fetchLocationName(gps.latitude, gps.longitude);
      setLocationName(locName);

      setMessage({ text: `📍 Location found: ${locName}`, type: "success" });
    } catch (err) {
      console.error("File handling error:", err);
      setMessage({ text: "❌ Could not read image metadata.", type: "error" });
      setImage(null);
      setGpsData(null);
      setLocationName(null);
      setPreview(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }, []);

  const handleUpload = async () => {
    if (!image || !gpsData) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("image", image); // keep original HEIF/JPG
    formData.append("uploaded_by", uploadedBy || "Anonymous");
    formData.append("latitude", gpsData.latitude);
    formData.append("longitude", gpsData.longitude);
    formData.append("location_name", locationName || "Unknown");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();

      if (!res.ok) {
        setMessage({ text: `❌ ${result.error || "Upload failed."}`, type: "error" });
      } else {
        setMessage({ text: "✅ Image uploaded successfully!", type: "success" });
        setTimeout(() => {
          setIsDialogOpen(false);
          resetForm();
        }, 1200);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage({ text: "❌ Upload failed. Please try again.", type: "error" });
    }

    setUploading(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent
        className={`max-w-md w-full rounded-2xl shadow-xl p-6 transition-colors ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload Sky Image</DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Only images with location metadata will be accepted.
          </p>
        </DialogHeader>

        {/* Name input */}
        <input
          type="text"
          value={uploadedBy}
          onChange={(e) => setUploadedBy(e.target.value)}
          placeholder="Your name (optional)"
          className={`mt-3 w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
            darkMode
              ? "bg-gray-800 border-gray-700 placeholder-gray-500"
              : "bg-gray-50 border-gray-300 placeholder-gray-400"
          }`}
        />

        {/* File upload */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`mt-4 flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed p-6 cursor-pointer transition relative ${
            darkMode
              ? "border-gray-700 hover:border-gray-500 bg-gray-800/40"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          }`}
        >
          <Upload className="h-6 w-6 mb-2 text-gray-500" />
          <span className="text-sm">
            {preview ? "Click to change image" : "Click or drag an image here"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-3 flex items-center gap-2 text-sm font-medium ${
              message.type === "error" ? "text-red-500" : "text-green-500"
            }`}
          >
            {message.type === "error" ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {message.text}
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mt-3 space-y-2">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-64 object-cover rounded-lg shadow"
            />
            {locationName && (
              <p className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                <MapPin className="h-4 w-4 mr-1 text-indigo-500" />
                {locationName}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setIsDialogOpen(false);
              resetForm();
            }}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || !image || !gpsData}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {uploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
