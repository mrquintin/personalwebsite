export default function Synopsis({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/);
  return (
    <div className="synopsis">
      {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}
