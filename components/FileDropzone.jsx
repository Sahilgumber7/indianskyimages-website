"use client";

import { Upload } from "lucide-react";

export default function FileDropzone({ onFileSelect, preview }) {
  return (
    <div
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) onFileSelect(file);
      }}
      onDragOver={(e) => e.preventDefault()}
      className="group relative flex flex-col items-center justify-center w-full min-h-[160px] rounded-[2rem] border-2 border-dashed border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white bg-black/5 dark:bg-white/5 cursor-pointer transition-all duration-500 overflow-hidden"
    >
      <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 group-hover:scale-110 transition-transform duration-500">
          <Upload className="h-6 w-6 text-black dark:text-white" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black text-black dark:text-white uppercase tracking-widest">
            {preview ? "Replace" : "Import Capture"}
          </p>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
            {preview ? "Drop to swap file" : "Drag + Drop or Browse"}
          </p>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => onFileSelect(e.target.files?.[0])}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
    </div>
  );
}
