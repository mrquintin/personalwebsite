import type { Metadata } from "next";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Waitlist",
  description: "An individual tier for operators, founders, writers, and small organizations.",
};

export default function WaitlistPage() {
  return (
    <section className="mx-auto max-w-72rem px-6 pt-24 pb-32 grid gap-12 md:grid-cols-12">
      <div className="md:col-span-5">
        <div className="eyebrow">WAITLIST — INDIVIDUALS &amp; SMALL ORGS</div>
        <h1 className="display text-display-lg mt-4 max-w-[20ch]">
          Rigor, without the
          <br />
          <span className="display-italic text-theory">ivory tower.</span>
        </h1>
        <p className="mt-6 text-paper-muted leading-relaxed max-w-[44ch]">
          The Lab&apos;s thesis on consulting includes its consumers. The
          quality of strategic reasoning available to a solo operator,
          a researcher, or a small organization is a tax on the
          discipline — not a fact about it.
        </p>
        <p className="mt-4 text-paper-muted leading-relaxed max-w-[44ch]">
          The individual tier is in design. We&apos;ll write directly when
          there&apos;s something concrete to try. No marketing email between
          now and then.
        </p>
      </div>
      <div className="md:col-span-7">
        <WaitlistForm />
      </div>
    </section>
  );
}
