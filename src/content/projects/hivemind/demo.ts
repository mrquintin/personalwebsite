// Discriminated union; renderer at DemoReceiver.tsx switches on `kind`.
export type DemoSource =
  | { kind: "video";       src: string; poster?: string }
  | { kind: "iframe";      src: string }
  | { kind: "placeholder"; message: string };

// TODO(michael): supply a real video URL or iframe src to swap modes
const demo: DemoSource = {
  kind: "placeholder",
  message: "[ demo pending upload ]",
};
export default demo;
