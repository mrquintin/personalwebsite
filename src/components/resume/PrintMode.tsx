"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PrintMode() {
  const params = useSearchParams();
  const isPrint = params?.get("print") === "true";

  useEffect(() => {
    if (!isPrint) return;
    const cls = "print-mode";
    document.body.classList.add(cls);
    return () => {
      document.body.classList.remove(cls);
    };
  }, [isPrint]);

  return null;
}
