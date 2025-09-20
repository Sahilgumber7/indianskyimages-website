import { Upload } from "lucide-react";

export default function FileDropzone({ onFileSelect, preview, darkMode }) {
  return (
    <div
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) onFileSelect(file);
      }}
      onDragOver={(e) => e.preventDefault()}
      className={`mt-4 flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed p-6 cursor-pointer transition relative ${
        darkMode
          ? "border-gray-700 hover:border-gray-500 bg-gray-800/40"
          : "border-gray-300 hover:border-gray-400 bg-gray-50"
      }`}
    >
      <Upload className="h-6 w-6 mb-2 text-gray-500" />
      <span className="text-sm">
        {preview ? "Click to change image" : "Click or drag an image here"}
      </span>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onFileSelect(e.target.files?.[0])}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );
}
