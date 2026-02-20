"use client";

import { usePathname } from "next/navigation";
import SkyPulse from "./SkyPulse";
import CelestialCursor from "./CelestialCursor";

export default function GlobalEffects() {
  const pathname = usePathname();

  if (pathname?.startsWith("/image/")) {
    return null;
  }

  return (
    <>
      <SkyPulse />
      <CelestialCursor />
    </>
  );
}
