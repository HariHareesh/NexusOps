"use client";

import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

export default function ClientToaster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#0f172a",
          color: "#e5e7eb",
          border: "1px solid #22d3ee",
        },
      }}
    />
  );
}