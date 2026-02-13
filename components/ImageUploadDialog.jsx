"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { LuUpload, LuX } from "react-icons/lu";

import FileDropzone from "./FileDropzone";
import PreviewCard from "./PreviewCard";
import MessageBox from "./MessageBox";
import { useUpload } from "../hooks/useUpload";
import { toast } from "sonner";
import exifr from "exifr";

export default function ImageUploadDialog({ isDialogOpen, setIsDialogOpen }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadedBy, setUploadedBy] = useState("");
  const [gps, setGps] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [error, setError] = useState(null);

  const { uploadImage, uploading, error: uploadError, setUploadError } = useUpload(() => {
    setIsDialogOpen(false);
    resetForm();
  });

  const resetForm = useCallback(() => {
    setImage(null);
    setPreview(null);
    setUploadedBy("");
    setGps(null);
    setLocationName("");
    setError(null);
  }, []);

  useEffect(() => {
    if (!gps) {
      setLocationName("");
      return;
    }
    const fetchName = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${gps.latitude}&lon=${gps.longitude}`);
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const district = addr.district || addr.city_district || addr.county || addr.suburb;
          const state = addr.state;
          const country = addr.country;

          let parts = [];
          if (district) parts.push(district);
          if (state) parts.push(state);
          if (country) parts.push(country);

          setLocationName(parts.length > 0 ? parts.join(", ") : "Unknown Location");
        }
      } catch (e) {
        console.error("Preview geocode error:", e);
      }
    };
    fetchName();
  }, [gps]);

  const readFile = async (file) => {
    if (!file) return;
    setError(null);
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      const output = await exifr.gps(file);
      if (output) {
        setGps({ latitude: output.latitude, longitude: output.longitude });
      } else {
        setGps(null);
      }
    } catch (e) {
      console.error("EXIF Error:", e);
      setGps(null);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent
        className="max-w-4xl w-[95vw] sm:w-full rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.4)] p-0 overflow-hidden bg-white/80 dark:bg-black/80 backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-700 animate-in zoom-in-95"
      >
        {/* Subtle Apple-style top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent opacity-50" />

        <div className="p-8 sm:p-12 space-y-10">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <DialogTitle className="text-4xl font-black tracking-tight text-black dark:text-white">
                Contribute
              </DialogTitle>
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                Preserve the horizon in our collaborative archive.
              </p>
            </div>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <LuX className="text-xl text-gray-400" />
            </button>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              {/* Monochromatic Input */}
              <div className="space-y-3 group">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                  Photographer
                </label>
                <input
                  type="text"
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value)}
                  placeholder="Anonymous"
                  className="w-full rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 p-4 text-sm focus:ring-1 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white outline-none transition-all duration-300 placeholder:text-gray-300 dark:text-white"
                />
              </div>

              {/* Monochromatic Dropzone */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                  Sky Capture
                </label>
                <div className="group transition-transform hover:scale-[1.01] active:scale-[0.99]">
                  <FileDropzone onFileSelect={readFile} preview={preview} />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                  Preview & Meta
                </label>
                <div className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/5 p-2 min-h-[260px] shadow-inner">
                  <PreviewCard
                    preview={preview}
                    locationName={locationName}
                    noLocation={!gps}
                  />
                </div>
              </div>

              {/* Error messages */}
              {(error || uploadError) && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <MessageBox error={error || uploadError} />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[11px] font-bold text-gray-400 tracking-wide uppercase">
                Privacy-First Encryption Active
              </p>
            </div>

            <div className="flex gap-4 w-full sm:w-auto">
              <Button
                onClick={() => {
                  if (!gps && preview) {
                    toast.info("No GPS found. Mapping to global center.");
                  }
                  uploadImage({ image, uploadedBy, gps, locationName });
                }}
                disabled={uploading || !image}
                className="rounded-full px-10 py-6 bg-black dark:bg-white text-white dark:text-black font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 min-w-[180px]"
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Sync to Archive"
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
