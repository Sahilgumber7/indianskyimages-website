import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import exifr from "exifr";

export default function ImageUploadDialog({ isDialogOpen, setIsDialogOpen }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Handle image selection & extract GPS metadata
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Extract EXIF metadata (GPS info)
    const metadata = await exifr.gps(file);

    if (!metadata || !metadata.latitude || !metadata.longitude) {
      setMessage({ text: "⚠️ This image has no location data! Please select another image.", type: "error" });
      return;
    }

    setMessage({ text: "" });
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setLatitude(metadata.latitude);
    setLongitude(metadata.longitude);
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
      <DialogContent className="z-[100] bg-white max-w-md w-full mx-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl p-4 sm:p-6 rounded-lg">  
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Upload Sky Image</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500 text-center">Only images with location metadata accepted.</p>
        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-gray-500 transition p-4 text-center">
          <p className="text-sm text-gray-600">
            {preview ? "Click to change image" : "Click to upload or drag an image"}
          </p>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>

        {/* Display Message (Error or Success) */}
        {message.text && (
          <p className={`text-sm font-medium text-center ${message.type === "error" ? "text-red-500" : "text-green-500"} mt-2`}>
            {message.text}
          </p>
        )}

        {/* Image Preview */}
        {preview && (
          <div className="mt-2 flex flex-col items-center">
            <img src={preview} alt="Preview" className="w-full h-auto rounded-md max-h-64 object-cover" />
            <p className="text-md text-gray-600 mt-2 text-center">📍 {latitude}, {longitude}</p>
            <hr className="my-4 border-gray-300 w-full" />
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 w-full">
          <Button variant="secondary" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading || !latitude || !longitude} className="w-full sm:w-auto">
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}