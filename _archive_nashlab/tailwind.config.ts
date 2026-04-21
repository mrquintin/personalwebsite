import type { Config } from "tailwindcss";

// TODO(.cursorrules): replace these palette values with the canonical
// tokens from 00-cursorrules.txt once supplied. Semantics preserved.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0a0a0a",
          800: "#141414",
          700: "#1c1c1c",
          600: "#2a2a2a",
          500: "#3a3a3a",
          400: "#4a4a4a",
        },
        paper: "#efe9dc",
        "paper-muted": "#c5beb0",
        "paper-dim": "#8a857a",
        theory: "#c4b6e0",
        "theory-dim": "#7a6f9c",
        pragma: "#e0a674",
        "pragma-dim": "#9c7548",
        monitor: "#7ba8c9",
        veto: "#cc6b6b",
      },
      fontFamily: {
        display: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 6.5vw, 6.25rem)", { lineHeight: "1.0", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.25rem, 4.5vw, 4rem)",  { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.75rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
      },
      maxWidth: { "72rem": "72rem" },
    },
  },
  plugins: [],
};
export default config;
