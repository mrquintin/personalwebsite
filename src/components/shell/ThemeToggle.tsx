"use client";

import { useCallback, useEffect, useState } from "react";
import { microcopy } from "@/content/microcopy";

type ThemeChoice = "dark" | "light" | "system";

const STORAGE_KEY = "theme";
const ORDER: ThemeChoice[] = ["dark", "light", "system"];
const GLYPH: Record<ThemeChoice, string> = {
  dark: "●",
  light: "○",
  system: "◐",
};

function readSystem(): "dark" | "light" {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyEffective(choice: ThemeChoice) {
  const effective = choice === "system" ? readSystem() : choice;
  document.documentElement.setAttribute("data-theme", effective);
}

function readStored(): ThemeChoice {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* localStorage may be unavailable */
  }
  return "system";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => {
    setChoice(readStored());
  }, []);

  // When in system mode, follow OS changes live.
  useEffect(() => {
    if (choice !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const update = () => applyEffective("system");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [choice]);

  const cycle = useCallback(() => {
    setChoice((prev) => {
      const next = ORDER[(ORDER.indexOf(prev) + 1) % ORDER.length];
      try {
        localStorage.setItem("theme", next);
      } catch {
        /* localStorage may be unavailable */
      }
      applyEffective(next);
      return next;
    });
  }, []);

  const label = microcopy.meta.themeAriaLabel(choice);

  return (
    <button
      type="button"
      className={["shell-theme-toggle", className].filter(Boolean).join(" ")}
      aria-label={label}
      title={label}
      onClick={cycle}
      data-theme-choice={choice}
    >
      <span aria-hidden="true">{GLYPH[choice]}</span>
    </button>
  );
}

export default ThemeToggle;
