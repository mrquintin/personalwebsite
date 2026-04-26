import Badge from "@/components/primitives/Badge";
import Button from "@/components/primitives/Button";
import Card from "@/components/primitives/Card";
import Link from "@/components/primitives/Link";
import Surface from "@/components/primitives/Surface";

function Subhead({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="t-h3"
      style={{ marginTop: "var(--s-6)", marginBottom: "var(--s-3)" }}
    >
      {children}
    </h3>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--s-3)",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
}

export default function PrimitiveGallery() {
  const buttonVariants = ["solid", "outline", "ghost"] as const;
  const buttonTones = ["neutral", "accent", "danger"] as const;
  const buttonSizes = ["sm", "md", "lg"] as const;
  const surfaceTones = ["base", "mute", "raise"] as const;
  const badgeTones = ["neutral", "accent", "warn", "ok"] as const;

  return (
    <div>
      <Subhead>Button — variant × tone</Subhead>
      {buttonVariants.map((variant) => (
        <div key={variant} style={{ marginBottom: "var(--s-3)" }}>
          <div
            style={{
              fontFamily: "var(--t-mono)",
              fontSize: "var(--t-sm-size)",
              color: "var(--fg-mute)",
              marginBottom: "var(--s-2)",
            }}
          >
            variant: {variant}
          </div>
          <Row>
            {buttonTones.map((tone) => (
              <Button key={tone} variant={variant} tone={tone}>
                {tone}
              </Button>
            ))}
            <Button variant={variant} tone="accent" disabled>
              disabled
            </Button>
            <Button variant={variant} tone="accent" loading>
              loading
            </Button>
          </Row>
        </div>
      ))}

      <Subhead>Button — size</Subhead>
      <Row>
        {buttonSizes.map((s) => (
          <Button key={s} variant="outline" size={s}>
            size {s}
          </Button>
        ))}
      </Row>

      <Subhead>Link</Subhead>
      <Row>
        <Link href="/projects" variant="underline">
          underline (internal)
        </Link>
        <Link href="/about" variant="subtle">
          subtle (internal)
        </Link>
        <Link href="https://example.com" variant="underline" external>
          external
        </Link>
      </Row>

      <Subhead>Surface</Subhead>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--s-3)",
        }}
      >
        {surfaceTones.map((tone) => (
          <Surface key={tone} tone={tone} padding={4} border>
            <div
              style={{
                fontFamily: "var(--t-mono)",
                fontSize: "var(--t-sm-size)",
                color: "var(--fg)",
              }}
            >
              tone={tone}
            </div>
          </Surface>
        ))}
      </div>

      <Subhead>Card</Subhead>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--s-3)",
        }}
      >
        <Card title="Static card" meta="2026">
          A card without an href is presentational. Body uses serif body.
        </Card>
        <Card href="/projects" title="Linked card" meta="hover">
          A card with href becomes a clickable target. Hover changes border.
        </Card>
      </div>

      <Subhead>Badge</Subhead>
      <Row>
        {badgeTones.map((tone) => (
          <Badge key={tone} tone={tone}>
            {tone}
          </Badge>
        ))}
      </Row>
    </div>
  );
}
