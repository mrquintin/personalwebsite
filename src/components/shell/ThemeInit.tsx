/* ---------------------------------------------------------------------------
 * ThemeInit — pre-hydration theme injection (suite 14/P01)
 *
 * Renders an inline <script> that reads localStorage "theme" (or falls back
 * to prefers-color-scheme) and sets data-theme on <html> before paint, so
 * we never flash the wrong theme during hydration.
 * --------------------------------------------------------------------------- */

// Mirrors P07 §B3 exactly. Inlined into <head> via dangerouslySetInnerHTML so
// data-theme lands on <html> before paint, eliminating FOUC.
const SCRIPT = `(function(){try{var saved=localStorage.getItem("theme");var sys=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";var effective=(saved==="light"||saved==="dark")?saved:sys;document.documentElement.setAttribute("data-theme",effective);}catch(e){}})();`;

export function ThemeInit() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}

export default ThemeInit;
