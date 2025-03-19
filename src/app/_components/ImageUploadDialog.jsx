import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import * as exifr from "exifr"; // Ensure exifr is installed

export default function LocationExtractor() {
  const [isOpen, setIsOpen] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  // Convert DMS format to Decimal format
  const convertDMSToDecimal = (dms, ref) => {
    if (!dms || dms.length < 3) return NaN; // Ensure valid data
    let decimal = dms[0] + dms[1] / 60 + dms[2] / 3600;
    if (ref === "S" || ref === "W") decimal *= -1; // Handle negative values
    return decimal.toFixed(6); // Return 6 decimal places for accuracy
  };

  // Extract GPS metadata
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("❌ Please select a valid image file.");
      return;
    }

    setPreview(URL.createObjectURL(file));

    try {
      // ✅ Extract metadata
      const metadata = await exifr.parse(file, { gps: true });
      console.log("EXIF Metadata:", metadata); // Debugging output

      let lat = null, lon = null;

      // ✅ Try standard GPSLatitude & GPSLongitude (DMS format)
      if (metadata.GPSLatitude && metadata.GPSLongitude) {
        lat = convertDMSToDecimal(metadata.GPSLatitude, metadata.GPSLatitudeRef);
        lon = convertDMSToDecimal(metadata.GPSLongitude, metadata.GPSLongitudeRef);
      }
      // ✅ Some Android devices store GPS as direct decimal coordinates
      else if (metadata.latitude && metadata.longitude) {
        lat = metadata.latitude.toFixed(6);
        lon = metadata.longitude.toFixed(6);
      }
      // ✅ Some Android devices store GPS as "GPSPosition"
      else if (metadata.GPSPosition) {
        const gpsArray = metadata.GPSPosition.split(" ");
        if (gpsArray.length === 2) {
          lat = parseFloat(gpsArray[0]).toFixed(6);
          lon = parseFloat(gpsArray[1]).toFixed(6);
        }
      }

      if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
        setMessage("⚠️ No valid GPS data found.");
        setLatitude(null);
        setLongitude(null);
        return;
      }

      setLatitude(lat);
      setLongitude(lon);
      setMessage("✅ Location data extracted!");
    } catch (error) {
      console.error("EXIF read error:", error);
      setMessage("❌ Error extracting location data.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Button onClick={() => setIsOpen(true)}>Upload Image</Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="z-[100] bg-white max-w-md w-full p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle>Extract Location from Image</DialogTitle>
          </DialogHeader>

          <label className="block border-2 border-dashed p-4 text-center cursor-pointer hover:border-gray-500 transition">
            <p className="text-gray-600">{preview ? "Change image" : "Click to upload an image"}</p>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          {/* Message Display */}
          {message && <p className="text-center text-sm mt-2">{message}</p>}

          {/* Image Preview & Coordinates */}
          {preview && (
            <div className="mt-2 text-center">
              <img src={preview} alt="Preview" className="w-full h-auto rounded-md max-h-64 object-cover" />
              {latitude && longitude ? (
                <p className="text-gray-600 mt-2">📍 {latitude}, {longitude}</p>
              ) : (
                <p className="text-red-500 mt-2">⚠️ No GPS data detected.</p>
              )}
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
