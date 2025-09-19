import { MapPin } from "lucide-react";

export default function PreviewCard({ preview, locationName }) {
  if (!preview) return null;

  return (
    <div className="mt-3 space-y-2">
      <img
        src={preview}
        alt="Preview"
        className="w-full max-h-64 object-cover rounded-lg shadow"
      />
      {locationName && (
        <p className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          <MapPin className="h-4 w-4 mr-1 text-indigo-500" />
          {locationName}
        </p>
      )}
    </div>
  );
}
