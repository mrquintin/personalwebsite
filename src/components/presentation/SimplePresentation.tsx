"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Surface from "../primitives/Surface";
import Cluster from "../primitives/Cluster";
import Button from "../primitives/Button";
import Prose from "../prose/Prose";
import type { DeckProps } from "./types";

const FADE_OUT_MS = 180;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export default function SimplePresentation({ id, title, phases }: DeckProps) {
  if (phases.length < 3 || phases.length > 5) {
    throw new Error(
      `SimplePresentation: phases.length must be 3-5 (got ${phases.length})`,
    );
  }

  const [index, setIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pendingIndexRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusOnNextRenderRef = useRef(false);

  const N = phases.length;
  const phase = phases[index];

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= N || next === index) return;
      if (prefersReducedMotion()) {
        setIndex(next);
        focusOnNextRenderRef.current = true;
        return;
      }
      pendingIndexRef.current = next;
      setFadingOut(true);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = setTimeout(() => {
        const target = pendingIndexRef.current;
        pendingIndexRef.current = null;
        setFadingOut(false);
        if (target !== null) {
          setIndex(target);
          focusOnNextRenderRef.current = true;
        }
      }, FADE_OUT_MS);
    },
    [N, index],
  );

  useEffect(() => {
    if (focusOnNextRenderRef.current) {
      focusOnNextRenderRef.current = false;
      headingRef.current?.focus();
    }
  }, [index]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(index - 1);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(index + 1);
        return;
      }
      if (/^[1-5]$/.test(e.key)) {
        const target = Number(e.key) - 1;
        if (target < N) {
          e.preventDefault();
          goTo(target);
        }
      }
    },
    [goTo, index, N],
  );

  const phaseClass = [
    "p-presentation__phase",
    fadingOut ? "p-presentation__phase--out" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Surface
      tone="raise"
      border
      padding={6}
      className="p-presentation"
      role="region"
      aria-label={title}
      data-deck-id={id}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <Cluster gap={3} align="baseline">
        <h2 className="t-h3">{title}</h2>
        <span className="t-meta">
          phase {index + 1} of {N}
        </span>
      </Cluster>

      <div aria-live="polite" className={phaseClass}>
        <h3
          className="t-h3 p-presentation__heading"
          tabIndex={-1}
          ref={headingRef}
        >
          {phase.heading}
        </h3>
        <Prose>{phase.body}</Prose>
      </div>

      <div className="p-presentation__nav">
        <Button
          type="button"
          onClick={prev}
          disabled={index === 0}
          aria-disabled={index === 0 || undefined}
          tabIndex={index === 0 ? -1 : undefined}
          className="p-presentation__nav-btn"
        >
          ← previous
        </Button>
        <span
          className="p-presentation__dots"
          role="tablist"
          aria-label="phase navigation"
        >
          {phases.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to phase ${i + 1}`}
              className={[
                "p-presentation__dot",
                i === index ? "p-presentation__dot--active" : null,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => goTo(i)}
            />
          ))}
        </span>
        <Button
          type="button"
          onClick={next}
          disabled={index === N - 1}
          aria-disabled={index === N - 1 || undefined}
          tabIndex={index === N - 1 ? -1 : undefined}
          className="p-presentation__nav-btn"
        >
          next →
        </Button>
      </div>
    </Surface>
  );
}
