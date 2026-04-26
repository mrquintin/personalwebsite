"use client";

import { useEffect, useState } from "react";
import Button from "@/components/primitives/Button";

type Theme = "dark" | "light";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const t = document.documentElement.getAttribute("data-theme");
  return t === "light" ? "light" : "dark";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem("theme", next);
    } catch {
      // ignore — quota or disabled storage
    }
    setTheme(next);
  }

  return (
    <Button
      onClick={toggle}
      variant="outline"
      size="sm"
      tone="accent"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      theme: {theme}  →  {theme === "dark" ? "light" : "dark"}
    </Button>
  );
}
