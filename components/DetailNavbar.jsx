"use client";

import { useState } from "react";
import Header from "./header";

export default function DetailNavbar() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGlobeView, setIsGlobeView] = useState(false);

  return (
    <Header
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
      isGlobeView={isGlobeView}
      setIsGlobeView={setIsGlobeView}
    />
  );
}
