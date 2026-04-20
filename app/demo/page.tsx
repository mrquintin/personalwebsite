import type { Metadata } from "next";
import DemoForm from "@/components/DemoForm";

export const metadata: Metadata = {
  title: "Request a demo",
  description: "See the Hivemind deliberate live, against your real strategic question.",
};

export default function DemoPage() {
  return (
    <section className="mx-auto max-w-72rem px-6 pt-24 pb-32 grid gap-12 md:grid-cols-12">
      <div className="md:col-span-5">
        <div className="eyebrow">REQUEST A DEMO</div>
        <h1 className="display text-display-lg mt-4 max-w-[20ch]">
          See the Hivemind
          <br />
          <span className="display-italic text-theory">deliberate live.</span>
        </h1>
        <p className="mt-6 text-paper-muted leading-relaxed max-w-[44ch]">
          A 45-minute walkthrough, tailored to your industry. A
          forward-deployed engineer drives; a researcher answers theory
          questions. The session is recorded and summarized in writing.
        </p>
        <p className="mt-4 text-paper-muted leading-relaxed max-w-[44ch]">
          Bring a real strategic question — Hivemind runs against your prompt,
          not a sandbox. The output is yours regardless of whether we
          subsequently engage.
        </p>
      </div>
      <div className="md:col-span-7">
        <DemoForm />
      </div>
    </section>
  );
}
