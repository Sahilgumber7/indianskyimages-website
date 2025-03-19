"use client";
import { FaInstagram, FaXTwitter } from "react-icons/fa6"; 

import { Button } from "@/components/ui/button";
import ImageUploadDialog from "./ImageUploadDialog";

export default function Header({ isDialogOpen, setIsDialogOpen }) {
  return (
    <div className="absolute top-0 left-0 w-full flex justify-between items-center p-4 bg-white shadow-lg z-50">
      <h1 className="font-bold text-xl md:text-3xl ">indianskyimages.</h1>

      <div className="flex items-center space-x-4">
      <a href="https://t.co/DenLkvA9pO" target="_blank" rel="noopener noreferrer">
  <FaInstagram size={24} className="text-black hover:text-gray-600 transition" />
</a>

<a href="https://x.com/indianskyimages" target="_blank" rel="noopener noreferrer">
  <FaXTwitter size={24} className="text-black hover:text-gray-600 transition" />
</a>
      <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="bg-black text-white">
        Upload Image
      </Button>
      </div>
      {/* Image Upload Dialog (Now Controlled by State) */}
      <ImageUploadDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
    </div>
  );
}
