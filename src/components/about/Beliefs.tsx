import Stack from "@/components/primitives/Stack";
import type { Belief } from "@/content/about/beliefs";

export default function Beliefs({ items }: { items: Belief[] }) {
  return (
    <section aria-labelledby="beliefs-heading">
      <Stack gap={3}>
        <h2 id="beliefs-heading" className="site-eyebrow">
          beliefs
        </h2>
        <ul className="belief-list">
          {items.map((b) => (
            <li key={b.n} className="belief-list__item">
              <span className="belief-list__n">{b.n}</span>
              <span>{b.text}</span>
            </li>
          ))}
        </ul>
      </Stack>
    </section>
  );
}
