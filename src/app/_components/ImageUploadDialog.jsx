import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import EXIF from "exif-js"; // ✅ Use exif-js for better Android support

export default function ImageUploadDialog({ isDialogOpen, setIsDialogOpen }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Convert GPS DMS to decimal format
  const convertDMSToDecimal = (gpsArray, ref) => {
    if (!gpsArray) return null;
    let decimal = gpsArray[0] + gpsArray[1] / 60 + gpsArray[2] / 3600;
    if (ref === "S" || ref === "W") decimal *= -1;
    return decimal;
  };

  // Handle file selection and extract EXIF metadata
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ text: "❌ Please select a valid image file.", type: "error" });
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      const img = new Image();
      img.src = imageData;
      img.onload = () => {
        EXIF.getData(img, function () {
          const lat = EXIF.getTag(this, "GPSLatitude");
          const lon = EXIF.getTag(this, "GPSLongitude");
          const latRef = EXIF.getTag(this, "GPSLatitudeRef");
          const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

          if (!lat || !lon) {
            setMessage({ text: "⚠️ No location data found. Try another image.", type: "error" });
            setLatitude(null);
            setLongitude(null);
            return;
          }

          const latitudeDecimal = convertDMSToDecimal(lat, latRef);
          const longitudeDecimal = convertDMSToDecimal(lon, lonRef);

          setLatitude(latitudeDecimal);
          setLongitude(longitudeDecimal);
          setMessage({ text: "✅ Location data extracted!", type: "success" });
        });
      };
    };
    reader.readAsDataURL(file); // Ensure correct base64 encoding
  };

  // Upload function
  const handleUpload = async () => {
    if (!image || !latitude || !longitude) return;
    setUploading(true);

    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("sky-images")
      .upload(fileName, image);

    if (error) {
      setMessage({ text: "❌ Upload failed. Please try again.", type: "error" });
      setUploading(false);
      return;
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/sky-images/${fileName}`;

    const { error: insertError } = await supabase
      .from("images")
      .insert([{ image_url: imageUrl, latitude, longitude, uploaded_at: new Date() }]);

    if (insertError) {
      setMessage({ text: "❌ Database save failed. Please try again.", type: "error" });
      setUploading(false);
      return;
    }

    setMessage({ text: "✅ Image uploaded successfully!", type: "success" });

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

        {/* Display Message */}
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
