import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import exifr from "exifr";

export default function ImageUploadDialog({ isDialogOpen, setIsDialogOpen, darkMode }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Convert DMS (Degrees, Minutes, Seconds) to decimal format
  const convertDMSToDecimal = (dms, ref) => {
    if (!dms) return null;
    let decimal = dms[0] + dms[1] / 60 + dms[2] / 3600;
    if (ref === "S" || ref === "W") decimal *= -1; // South & West are negative
    return decimal;
  };

  // Handle image selection & extract GPS metadata
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Set preview immediately
    setImage(file);
    setPreview(URL.createObjectURL(file));

    try {
      // Extract EXIF metadata
      const metadata = await exifr.parse(file);
      console.log("Extracted Metadata:", metadata);

      // Extract latitude & longitude
      let lat = metadata?.latitude || convertDMSToDecimal(metadata?.GPSLatitude, metadata?.GPSLatitudeRef);
      let lon = metadata?.longitude || convertDMSToDecimal(metadata?.GPSLongitude, metadata?.GPSLongitudeRef);

      if (!lat || !lon) {
        setMessage({ text: "⚠️ This image has no location data! You can't upload it.", type: "error" });
        setLatitude(null);
        setLongitude(null);
        return;
      }

      // Clear error message & set location data
      setMessage({ text: "" });
      setLatitude(lat);
      setLongitude(lon);
    } catch (error) {
      console.error("EXIF Parsing Error:", error);
      setMessage({ text: "⚠️ Error reading image metadata. Try a different image.", type: "error" });
      setLatitude(null);
      setLongitude(null);
    }
  };

  // Upload to Supabase Storage & save metadata to "images" table
  const handleUpload = async () => {
    if (!image || !latitude || !longitude) return;
    setUploading(true);

    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage (Bucket: sky-images)
    const { data, error } = await supabase.storage
      .from("sky-images")
      .upload(fileName, image);

    if (error) {
      setMessage({ text: "❌ Upload failed. Please try again.", type: "error" });
      setUploading(false);
      return;
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sky-images/${fileName}`;

    // Insert into "images" table
    const { error: insertError } = await supabase
      .from("images")
      .insert([{ 
        image_url: imageUrl, 
        latitude, 
        longitude, 
        uploaded_at: new Date() 
      }]);

    if (insertError) {
      setMessage({ text: "❌ Database save failed. Please try again.", type: "error" });
      setUploading(false);
      return;
    }

    // Show success message
    setMessage({ text: "✅ Image uploaded successfully!", type: "success" });

    // Close dialog after 1 second
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
      <DialogContent className={`z-[100] max-w-md w-full mx-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl p-4 sm:p-6 rounded-lg transition
        ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-300"}`}>
        
        <DialogHeader>
          <DialogTitle className={`text-lg sm:text-xl ${darkMode ? "text-white" : "text-black"}`}>
            Upload Sky Image
          </DialogTitle>
        </DialogHeader>

        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Only images with location metadata accepted.
        </p>

        <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer transition p-4 text-center
          ${darkMode ? "border-gray-500 hover:border-gray-400" : "border-gray-400 hover:border-gray-500"}`}>
          <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {preview ? "Click to change image" : "Click to upload or drag an image"}
          </p>
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Display Message (Error or Success) */}
        {message.text && (
          <p className={`text-sm font-medium text-center mt-2
            ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
            {message.text}
          </p>
        )}

        {/* Image Preview */}
        {preview && (
          <div className="mt-2 flex flex-col items-center">
            <img src={preview} alt="Preview" className="w-full h-auto rounded-md max-h-64 object-cover" />
            <p className={`text-md mt-2 text-center ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              📍 {latitude}, {longitude}
            </p>
            <hr className={`my-4 w-full ${darkMode ? "border-gray-600" : "border-gray-300"}`} />
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 w-full">
          <Button 
            variant="secondary" 
            onClick={() => setIsDialogOpen(false)} 
            className={`w-full sm:w-auto ${darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 text-black hover:bg-gray-300"}`}>
            Cancel
          </Button>

          <Button 
            onClick={handleUpload} 
            disabled={uploading || !latitude || !longitude} 
            className="w-full sm:w-auto bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
