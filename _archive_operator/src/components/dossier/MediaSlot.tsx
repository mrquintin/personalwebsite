type Props = { src?: string; alt?: string };
export default function MediaSlot({ src, alt }: Props) {
  if (!src) return null;
  // Naive: video for .mp4/.webm, otherwise an image
  const isVideo = /\.(mp4|webm|mov)$/i.test(src);
  return (
    <div style={{ marginTop: "var(--s-6)", border: "var(--border-hair)" }}>
      {isVideo ? (
        <video src={src} muted autoPlay loop playsInline style={{ width: "100%", display: "block" }} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? ""} style={{ width: "100%", display: "block" }} />
      )}
    </div>
  );
}
