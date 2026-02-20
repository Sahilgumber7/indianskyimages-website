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
import { LuUpload } from "react-icons/lu";

import FileDropzone from "./FileDropzone";
import PreviewCard from "./PreviewCard";
import MessageBox from "./MessageBox";
import { useUpload } from "../hooks/useUpload";
import { toast } from "sonner";
import exifr from "exifr";

export default function ImageUploadDialog({ isDialogOpen, setIsDialogOpen }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [uploadedBy, setUploadedBy] = useState("");
  const [error, setError] = useState(null);
  const [previewLocationName, setPreviewLocationName] = useState("");
  const [locationMode, setLocationMode] = useState("auto");
  const [manualLatitude, setManualLatitude] = useState("");
  const [manualLongitude, setManualLongitude] = useState("");

  const preview = selectedItems[0]?.preview || null;
  const exifGps = selectedItems[0]?.gps || null;
  const manualGps =
    manualLatitude !== "" && manualLongitude !== ""
      ? { latitude: Number(manualLatitude), longitude: Number(manualLongitude) }
      : null;
  const previewGps =
    locationMode === "manual"
      ? manualGps
      : locationMode === "none"
        ? null
        : exifGps;

  const { uploadImage, uploadImages, uploading, uploadStats, error: uploadError } = useUpload(() => {
    setIsDialogOpen(false);
    resetForm();
  });

  const resetForm = useCallback(() => {
    setSelectedItems([]);
    setUploadedBy("");
    setPreviewLocationName("");
    setLocationMode("auto");
    setManualLatitude("");
    setManualLongitude("");
    setError(null);
  }, []);

  useEffect(() => {
    const lat = Number(previewGps?.latitude);
    const lon = Number(previewGps?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      setPreviewLocationName("");
      return;
    }

    const fetchName = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
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

          setPreviewLocationName(parts.length > 0 ? parts.join(", ") : "Unknown Location");
        }
      } catch (e) {
        console.error("Preview geocode error:", e);
      }
    };
    fetchName();
  }, [previewGps]);

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const readFiles = async (fileList) => {
    const accepted = Array.from(fileList || []);
    const files = accepted.filter((file) => file?.type?.startsWith("image/"));
    if (files.length === 0) return;
    if (files.length !== accepted.length) {
      setError("Only image files are supported.");
      return;
    }
    if (files.some((file) => file.size > 10 * 1024 * 1024)) {
      setError("Each image must be 10MB or smaller.");
      return;
    }
    setError(null);

    const items = await Promise.all(
      files.map(async (file) => {
        const previewUrl = await readFileAsDataUrl(file);
        let gps = null;
        try {
          const output = await exifr.gps(file);
          if (output) {
            gps = { latitude: output.latitude, longitude: output.longitude };
          }
        } catch (e) {
          console.error("EXIF Error:", e);
        }

        return {
          image: file,
          preview: previewUrl,
          gps,
          locationName: "",
        };
      })
    );

    setSelectedItems(items);
    setLocationMode("auto");
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent
        className="max-w-5xl w-[calc(100vw-1.5rem)] sm:w-[95vw] max-h-[84dvh] sm:max-h-[90dvh] overflow-y-auto rounded-[1.3rem] sm:rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] p-0 bg-white/95 dark:bg-black/95 backdrop-blur-3xl border border-white/20 dark:border-white/10 transition-all duration-500 animate-in zoom-in-95 focus:outline-none no-scrollbar"
      >

        <div className="p-4 sm:p-10 lg:p-12 space-y-6 sm:space-y-8">
          <DialogHeader className="flex flex-col space-y-1">
            <DialogTitle className="pr-12 text-2xl sm:text-4xl font-black tracking-tighter text-black dark:text-white uppercase">
              Upload Image
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            <div className="space-y-6 sm:space-y-8">
              {/* Monochromatic Input */}
              <div className="space-y-2 sm:space-y-3 group">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                  Photographer
                </label>
                <input
                  type="text"
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value)}
                  placeholder="Anonymous"
                  className="w-full h-12 rounded-2xl border border-gray-100 dark:border-gray-800 bg-black/5 dark:bg-white/5 px-4 text-sm focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all duration-300 placeholder:text-gray-300 dark:text-white"
                />
              </div>

              {/* Monochromatic Dropzone */}
              <div className="space-y-2 sm:space-y-3">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                  Sky Capture
                </label>
                <div className="group transition-transform active:scale-[0.98]">
                  <FileDropzone onFilesSelect={readFiles} selectedCount={selectedItems.length} />
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">
                  Preview & Meta
                </label>
                <div className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/5 p-2 min-h-[220px] sm:min-h-[260px] shadow-inner">
                  <PreviewCard
                    preview={preview}
                    locationName={previewLocationName}
                    noLocation={!previewGps}
                  />
                </div>
                {selectedItems.length > 1 && (
                  <p className="text-[11px] uppercase tracking-widest text-black/40 dark:text-white/40 px-1">
                    {selectedItems.length} images selected
                  </p>
                )}
                {uploading && uploadStats.total > 1 && (
                  <p className="text-[11px] uppercase tracking-widest text-black/40 dark:text-white/40 px-1">
                    Uploading {uploadStats.completed} / {uploadStats.total}
                  </p>
                )}

                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-3 sm:p-4 space-y-3 bg-black/[0.02] dark:bg-white/[0.02]">
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-black/40 dark:text-white/40">
                    Location Mode
                  </p>
                  <select
                    value={locationMode}
                    onChange={(e) => setLocationMode(e.target.value)}
                    className="h-10 w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 text-xs font-bold uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
                    aria-label="Location mode"
                  >
                    <option value="auto">EXIF Auto</option>
                    <option value="manual">Manual Pin</option>
                    <option value="none">No Location</option>
                  </select>

                  {locationMode === "manual" && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        value={manualLatitude}
                        onChange={(e) => setManualLatitude(e.target.value)}
                        className="h-10 rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 text-sm outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        value={manualLongitude}
                        onChange={(e) => setManualLongitude(e.target.value)}
                        className="h-10 rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-3 text-sm outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                      />
                    </div>
                  )}
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

          <DialogFooter className="sticky bottom-0 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-0 flex flex-col sm:flex-row items-center justify-end gap-4 sm:gap-6 border-t border-gray-100 dark:border-white/5 bg-white/90 dark:bg-black/85 backdrop-blur-xl">
            <div className="flex gap-4 w-full sm:w-auto order-1 sm:order-2">
              <Button
                onClick={async () => {
                  const resolvedGps =
                    locationMode === "manual"
                      ? manualGps
                      : locationMode === "none"
                        ? null
                        : previewGps;
                  const resolvedLocation =
                    locationMode === "none"
                      ? ""
                      : previewLocationName || "Unknown";

                  if (locationMode === "manual" && (!manualGps || Number.isNaN(manualGps.latitude) || Number.isNaN(manualGps.longitude))) {
                    toast.error("Enter a valid latitude and longitude.");
                    return;
                  }

                  if (selectedItems.length > 1) {
                    await uploadImages({
                      items: selectedItems.map((item) => ({
                        ...item,
                        gps:
                          locationMode === "manual"
                            ? manualGps
                            : locationMode === "none"
                              ? null
                              : item.gps,
                        locationName: resolvedLocation,
                      })),
                      uploadedBy,
                    });
                    return;
                  }

                  await uploadImage({
                    image: selectedItems[0]?.image,
                    uploadedBy,
                    gps: resolvedGps,
                    locationName: resolvedLocation,
                  });
                }}
                disabled={uploading || selectedItems.length === 0}
                className="w-full sm:w-auto rounded-full px-8 h-12 sm:h-14 bg-black dark:bg-white text-white dark:text-black font-black text-[11px] sm:text-[12px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all disabled:opacity-30 min-w-[180px]"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  selectedItems.length > 1 ? `Upload ${selectedItems.length}` : "Upload"
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
