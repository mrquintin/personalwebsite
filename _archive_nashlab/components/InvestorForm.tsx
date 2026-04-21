"use client";
import Form, { type Field } from "./Form";

const FIELDS: Field[] = [
  { name: "name",   label: "Name",   type: "text",  required: true,  span: 1 },
  { name: "email",  label: "Email",  type: "email", required: true,  span: 1 },
  { name: "firm",   label: "Firm",   type: "text",  required: true,  span: 1 },
  { name: "stage",  label: "Stage focus", type: "select", required: false, span: 1,
    placeholder: "Select…",
    options: ["Pre-seed", "Seed", "Series A", "Series B+", "Growth"] },
  { name: "thesis", label: "What you'd want to see in the deck", type: "textarea", required: false, span: 2,
    placeholder: "Optional. Helps us tailor the materials." },
];

export default function InvestorForm() {
  return (
    <Form
      source="investor"
      fields={FIELDS}
      submitLabel="Request the deck"
      successTitle="Materials inbound."
      successBody="The deck and the technical brief will be in your inbox within one business day. We answer follow-ups directly — no analyst gating."
    />
  );
}
