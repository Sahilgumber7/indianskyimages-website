"use client";

import { Upload } from "lucide-react";

export default function FileDropzone({ onFilesSelect, selectedCount = 0 }) {
  return (
    <div
      onDrop={(e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files?.length) onFilesSelect(files);
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
            {selectedCount > 0 ? `${selectedCount} selected` : "Import Captures"}
          </p>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
            {selectedCount > 0 ? "Drop to replace selection" : "Drag + Drop or Browse"}
          </p>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => onFilesSelect(e.target.files)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
    </div>
  );
}
