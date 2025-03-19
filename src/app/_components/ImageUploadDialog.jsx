import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import EXIF from "exif-js";
import piexif from "piexifjs";

export default function ImageUploadDialog({ isDialogOpen, setIsDialogOpen }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Convert DMS (Degrees, Minutes, Seconds) to Decimal
  const convertDMSToDecimal = (dms, ref) => {
    if (!dms) return null;
    let decimal = dms[0] + dms[1] / 60 + dms[2] / 3600;
    if (ref === "S" || ref === "W") decimal *= -1;
    return decimal;
  };

  // Extract GPS data using EXIF.js or Piexif.js
  const extractGPSData = (file, base64String) => {
    let lat = null, lon = null;
    
    // Try EXIF.js first
    const exifData = EXIF.readFromBinaryFile(file);
    if (exifData?.GPSLatitude && exifData?.GPSLongitude) {
      lat = convertDMSToDecimal(exifData.GPSLatitude, exifData.GPSLatitudeRef);
      lon = convertDMSToDecimal(exifData.GPSLongitude, exifData.GPSLongitudeRef);
    }

    // If EXIF.js fails, try piexif.js
    if (!lat || !lon) {
      try {
        const exifObj = piexif.load(base64String);
        if (exifObj.GPS[piexif.GPSIFD.GPSLatitude] && exifObj.GPS[piexif.GPSIFD.GPSLongitude]) {
          lat = convertDMSToDecimal(exifObj.GPS[piexif.GPSIFD.GPSLatitude], exifObj.GPS[piexif.GPSIFD.GPSLatitudeRef]);
          lon = convertDMSToDecimal(exifObj.GPS[piexif.GPSIFD.GPSLongitude], exifObj.GPS[piexif.GPSIFD.GPSLongitudeRef]);
        }
      } catch (error) {
        console.log("Piexif.js failed:", error);
      }
    }

    if (!lat || !lon) {
      setMessage({ text: "❌ No location data found! Please upload another image.", type: "error" });
    } else {
      setMessage({ text: "✅ Location data extracted!", type: "success" });
    }

    return { lat, lon };
  };

  // Handle image selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const arrayBuffer = e.target.result;
      const base64String = reader.result.split(",")[1]; // Extract Base64 for piexif.js

      // Extract GPS metadata
      const { lat, lon } = extractGPSData(arrayBuffer, base64String);

      // Set state
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setLatitude(lat);
      setLongitude(lon);
    };

    reader.readAsArrayBuffer(file); // Needed for EXIF.js
    reader.readAsDataURL(file); // Needed for piexif.js
  };

  // Upload Image to Supabase
  const handleUpload = async () => {
    if (!image || latitude === null || longitude === null) return;

    setUploading(true);
    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("sky-images")
      .upload(fileName, image);

    if (error) {
      setMessage({ text: "❌ Upload failed. Please try again.", type: "error" });
      setUploading(false);
      return;
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sky-images/${fileName}`;

    // Insert into Supabase Table
    const { error: insertError } = await supabase
      .from("images")
      .insert([{ image_url: imageUrl, latitude, longitude, uploaded_at: new Date() }]);

    if (insertError) {
      setMessage({ text: "❌ Database save failed. Please try again.", type: "error" });
      setUploading(false);
      return;
    }

    setMessage({ text: "✅ Image uploaded successfully!", type: "success" });

    // Reset after success
    setTimeout(() => {
      setIsDialogOpen(false);
      setImage(null);
      setPreview(null);
      setLatitude(null);
      setLongitude(null);
      setMessage({ text: "" });
      setUploading(false);
    }, 1000);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="z-[100] bg-white max-w-md w-full mx-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl p-4 sm:p-6 rounded-lg">  
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Upload Sky Image</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500 text-center">Only images with location metadata are accepted.</p>
        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-gray-500 transition p-4 text-center">
          <p className="text-sm text-gray-600">
            {preview ? "Click to change image" : "Click to upload or drag an image"}
          </p>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>

        {message.text && (
          <p className={`text-sm font-medium text-center ${message.type === "error" ? "text-red-500" : "text-green-500"} mt-2`}>
            {message.text}
          </p>
        )}

        {preview && (
          <div className="mt-2 flex flex-col items-center">
            <img src={preview} alt="Preview" className="w-full h-auto rounded-md max-h-64 object-cover" />
            {latitude !== null && longitude !== null ? (
              <p className="text-md text-gray-600 mt-2 text-center">📍 {latitude}, {longitude}</p>
            ) : (
              <p className="text-md text-red-500 mt-2 text-center">❌ No location data found</p>
            )}
            <hr className="my-4 border-gray-300 w-full" />
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 w-full">
          <Button variant="secondary" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={uploading || !image || latitude === null || longitude === null} 
            className="w-full sm:w-auto"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
