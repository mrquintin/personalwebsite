type Props = {
  name: string;
  role: string;
  email: string;
  location?: string;
  links: { label: string; href: string }[];
};

export default function IdentityHeader(p: Props) {
  return (
    <div className="metadata-pane" style={{ marginBottom: "var(--s-6)" }}>
      <Row k="NAME"     v={p.name} />
      <Row k="ROLE"     v={p.role} />
      <Row k="EMAIL"    v={p.email} />
      {p.location && <Row k="LOCATION" v={p.location} />}
      <Row k="LINKS"    v={p.links.map((l) => l.label).join(" · ")} />
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="row">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}
