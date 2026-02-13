"use client";

import { AlertCircle } from "lucide-react";

export default function MessageBox({ error }) {
  if (!error) return null;

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white shadow-xl animate-in shake-in-1">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <p className="text-[10px] uppercase font-black tracking-widest leading-tight">{error}</p>
    </div>
  );
}
