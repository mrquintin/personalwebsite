"use client";
import Form, { type Field } from "./Form";

const FIELDS: Field[] = [
  { name: "name",   label: "Name",   type: "text",  required: true,  span: 1 },
  { name: "email",  label: "Email",  type: "email", required: true,  span: 1 },
  { name: "use",    label: "How you'd use Hivemind", type: "textarea", required: true, span: 2,
    placeholder: "Operator, founder, writer, researcher — describe one decision you'd run through it." },
];

export default function WaitlistForm() {
  return (
    <Form
      source="waitlist"
      fields={FIELDS}
      submitLabel="Join waitlist"
      successTitle="You're on the list."
      successBody="The individual tier is in design. We'll write directly when there's something concrete to try — no marketing email between now and then."
    />
  );
}
