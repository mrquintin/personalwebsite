import Prose from "@/components/prose/Prose";

export default function ResumeSummary({ text }: { text: string }) {
  return (
    <Prose>
      <p>{text}</p>
    </Prose>
  );
}
