"use client";
import { useEffect, useState } from "react";
import Accordion from "@/components/shell/Accordion";
import BootSequence from "@/components/boot/BootSequence";
import AboutTeaser from "@/components/panels/AboutTeaser";
import HivemindTeaser from "@/components/panels/HivemindTeaser";
import PurposelessTeaser from "@/components/panels/PurposelessTeaser";
import TheseusTeaser from "@/components/panels/TheseusTeaser";
import ResumeTeaser from "@/components/panels/ResumeTeaser";

export default function HomePage() {
  const [, setBootDone] = useState(false);
  const [initialIdx, setInitialIdx] = useState<number | null>(1);

  useEffect(() => {
    const m = window.location.hash.match(/^#0([1-5])$/);
    if (m) setInitialIdx(parseInt(m[1], 10));
  }, []);

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
