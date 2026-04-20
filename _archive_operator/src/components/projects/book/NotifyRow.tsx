export default function NotifyRow({ email }: { email: string }) {
  return (
    <p style={{ fontFamily: "var(--font-mono)", color: "var(--fg-dim)", fontSize: "var(--t-sm-size)", lineHeight: 1.6 }}>
      To be notified when Book I is available, write{" "}
      <a href={`mailto:${email}?subject=PRP%20%2F%20NOTIFY`} style={{ color: "var(--fg-hi)" }}>{email}</a>
      {" "}· subject: PRP / NOTIFY. For foreign rights, film, or press inquiries:
      write the same address with subject PRP / RIGHTS.
    </p>
  );
}
