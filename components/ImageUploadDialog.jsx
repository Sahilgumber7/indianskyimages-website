import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

import FileDropzone from "./FileDropzone";
import PreviewCard from "./PreviewCard";
import MessageBox from "./MessageBox";
import { useImagePreview } from "../hooks/useImagePreview";
import { useReverseGeocode } from "../hooks/useReverseGeocde";
import { useUploadImage } from "../hooks/useImageUpload";


export default function ImageUploadDialog({ isDialogOpen, setIsDialogOpen, darkMode }) {
  const { image, preview, gps, error, readFile, setError } = useImagePreview();
  const locationName = useReverseGeocode(gps);

  const [uploadedBy, setUploadedBy] = useState("");

  const resetForm = () => {
    setUploadedBy("");
    setError(null);
  };

  const { uploadImage, uploading, error: uploadError, setError: setUploadError } = useUploadImage({
    resetForm,
    closeDialog: () => setIsDialogOpen(false),
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent
        className={`max-w-md w-full rounded-2xl shadow-xl p-6 ${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload Sky Image</DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Only images with location metadata will be accepted.
          </p>
        </DialogHeader>

        {/* Name Input */}
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

        {/* File Upload Zone */}
        <FileDropzone onFileSelect={readFile} preview={preview} darkMode={darkMode} />

        {/* Errors */}
        <MessageBox error={error || uploadError} />

        {/* Preview + Location */}
        <PreviewCard preview={preview} locationName={locationName} />

        {/* Footer Buttons */}
        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setIsDialogOpen(false);
              resetForm();
              setUploadError(null);
            }}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              uploadImage({ image, uploadedBy, gps, locationName })
            }
            disabled={uploading || !image || !gps}
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
