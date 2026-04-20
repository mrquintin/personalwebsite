type Props = {
  name: string;
  roles: string[];
  based?: string;
  channels: { label: string; href: string }[];
};

export default function IdentityBlock({ name, roles, based, channels }: Props) {
  return (
    <div className="metadata-pane">
      <Row k="NAME"     v={name} />
      <Row k="ROLE(S)"  v={roles.join(" · ")} />
      {based && <Row k="BASED" v={based} />}
      <div className="row">
        <span className="k">CHANNELS</span>
        <span className="v">
          {channels.map((c, i) => (
            <span key={i}>
              <a href={c.href} style={{ color: "var(--fg)" }}>{c.label}</a>
              {i < channels.length - 1 ? " · " : ""}
            </span>
          ))}
        </span>
      </div>
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
