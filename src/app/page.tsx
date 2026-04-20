"use client";
import { useState } from "react";
import Accordion from "@/components/shell/Accordion";
import BootSequence from "@/components/boot/BootSequence";
import AboutTeaser from "@/components/panels/AboutTeaser";
import HivemindTeaser from "@/components/panels/HivemindTeaser";
import PurposelessTeaser from "@/components/panels/PurposelessTeaser";
import TheseusTeaser from "@/components/panels/TheseusTeaser";
import ResumeTeaser from "@/components/panels/ResumeTeaser";

export default function HomePage() {
  const [bootDone, setBootDone] = useState(false);

  // Determine initial expanded panel from URL hash on first render
  const initialIdx =
    typeof window !== "undefined" && /^#0[1-5]$/.test(window.location.hash)
      ? parseInt(window.location.hash.slice(1), 10)
      : 1;

  return (
    <>
      <BootSequence onComplete={() => setBootDone(true)} />
      <Accordion
        initialExpandedIndex={initialIdx}
        panelContent={{
          ABT: <AboutTeaser />,
          HVM: <HivemindTeaser />,
          PRP: <PurposelessTeaser />,
          THS: <TheseusTeaser />,
          CV:  <ResumeTeaser />,
        }}
      />
    </>
  );
}
