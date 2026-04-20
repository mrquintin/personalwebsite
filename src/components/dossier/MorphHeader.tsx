"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Wraps a header element with a framer-motion layout id so it can morph
// between the accordion teaser and the full dossier route.
export default function MorphHeader({ id, children }: { id: string; children: ReactNode }) {
  return (
    <motion.div layout layoutId={id}>
      {children}
    </motion.div>
  );
}
