"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type NavToggleValue = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

const NavToggleContext = createContext<NavToggleValue | null>(null);

export function NavToggleProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo<NavToggleValue>(
    () => ({ open, toggle, close }),
    [open, toggle, close],
  );
  return <NavToggleContext.Provider value={value}>{children}</NavToggleContext.Provider>;
}

export function useNavToggle(): NavToggleValue {
  const ctx = useContext(NavToggleContext);
  if (!ctx) {
    return { open: false, toggle: () => {}, close: () => {} };
  }
  return ctx;
}

export default useNavToggle;
