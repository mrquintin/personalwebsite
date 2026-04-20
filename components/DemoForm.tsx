"use client";
import Form, { type Field } from "./Form";

const FIELDS: Field[] = [
  { name: "name",     label: "Name",         type: "text",     required: true,  span: 1 },
  { name: "email",    label: "Email",        type: "email",    required: true,  span: 1 },
  { name: "company",  label: "Company",      type: "text",     required: true,  span: 1 },
  { name: "role",     label: "Role",         type: "text",     required: false, span: 1 },
  { name: "size",     label: "Org size",     type: "select",   required: false, span: 1, placeholder: "Select…",
    options: ["1–50", "51–500", "501–5,000", "5,001+"] },
  { name: "industry", label: "Industry",     type: "text",     required: false, span: 1 },
  { name: "question", label: "A real strategic question to deliberate", type: "textarea", required: true, span: 2,
    placeholder: "Be specific. Hivemind runs against your prompt, not a sandbox." },
];

export default function DemoForm() {
  return (
    <Form
      source="demo"
      fields={FIELDS}
      submitLabel="Request demo"
      successTitle="Your request is logged."
      successBody="A forward-deployed engineer will reach out within two business days to schedule a 45-minute walkthrough against your question."
    />
  );
}
