"use client";
import { Button } from "@/components/ui/button";
import ImageUploadDialog from "./ImageUploadDialog";

export default function Header({ isDialogOpen, setIsDialogOpen }) {
  return (
    <div className="absolute top-0 left-0 w-full flex justify-between items-center p-4 bg-white shadow-lg z-50">
      <h1 className="font-bold text-3xl">indianskyimages.</h1>
      <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="bg-black text-white">
        Upload Image
      </Button>
      {/* Image Upload Dialog (Now Controlled by State) */}
      <ImageUploadDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
    </div>
  );
}
