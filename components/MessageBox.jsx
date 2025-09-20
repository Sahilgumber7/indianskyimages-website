import { XCircle } from "lucide-react";

export default function MessageBox({ error }) {
  if (!error) return null;

  return (
    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-red-500">
      <XCircle className="h-4 w-4" />
      {error}
    </div>
  );
}
