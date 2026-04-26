import type { ReactNode } from "react";

export type Phase = {
  id: string;
  heading: string;
  body: ReactNode;
};

export type DeckProps = {
  id: string;
  title: string;
  phases: Phase[];
};
