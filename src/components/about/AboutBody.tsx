import Prose from "@/components/prose/Prose";

export default function AboutBody({ paragraphs }: { paragraphs: string[] }) {
  return (
    <Prose>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </Prose>
  );
}
