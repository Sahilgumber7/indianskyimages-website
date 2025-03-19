import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import * as exifr from "exifr"; // ✅ Better EXIF extraction

export default function LocationExtractor() {
  const [isOpen, setIsOpen] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  // Handle Image Upload & Extract GPS Data
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("❌ Please select a valid image file.");
      return;
    }

    setPreview(URL.createObjectURL(file));

    try {
      // ✅ Extract metadata with `exifr`
      const metadata = await exifr.parse(file);
      if (!metadata || !metadata.GPSLatitude || !metadata.GPSLongitude) {
        setMessage("⚠️ No location data found in this image.");
        setLatitude(null);
        setLongitude(null);
        return;
      }

      setLatitude(metadata.GPSLatitude);
      setLongitude(metadata.GPSLongitude);
      setMessage("✅ Location data extracted!");
    } catch (error) {
      console.error("EXIF read error:", error);
      setMessage("❌ Error extracting location data.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {/* Upload Button to Open Dialog */}
      <Button onClick={() => setIsOpen(true)}>Upload Image</Button>

      {/* Dialog Component */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="z-[100] bg-white max-w-md w-full p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle>Extract Location from Image</DialogTitle>
          </DialogHeader>

          <label className="block border-2 border-dashed p-4 text-center cursor-pointer hover:border-gray-500 transition">
            <p className="text-gray-600">
              {preview ? "Change image" : "Click to upload an image"}
            </p>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          {/* Message Display */}
          {message && <p className="text-center text-sm mt-2">{message}</p>}

          {/* Image Preview */}
          {preview && (
            <div className="mt-2 text-center">
              <img src={preview} alt="Preview" className="w-full h-auto rounded-md max-h-64 object-cover" />
              <p className="text-gray-600 mt-2">📍 {latitude}, {longitude}</p>
            </div>
          )}

          <DialogFooter className="flex justify-end mt-4">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
