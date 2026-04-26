import Anchor from "@/components/prose/Anchor";
import Prose from "@/components/prose/Prose";
import Stack from "@/components/primitives/Stack";
import sections from "@/content/projects/purposeless-efficiency/body";

export default function Body() {
  return (
    <Prose>
      <Stack gap={6}>
        {sections.map((section) => (
          <section key={section.slug}>
            <Anchor id={section.slug}>{section.heading}</Anchor>
            {section.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        ))}
      </Stack>
    </Prose>
  );
}
