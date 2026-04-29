export default function AboutBody({ paragraphs }: { paragraphs: string[] }) {
  const [lead, ...details] = paragraphs;

  return (
    <section className="about-body" aria-label="Biography">
      {lead && <p className="about-body__lead">{lead}</p>}
      {details.length > 0 && (
        <div className="about-body__details">
          {details.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </section>
  );
}
