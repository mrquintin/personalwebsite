import Cluster from "@/components/primitives/Cluster";

export default function DownloadCTA() {
  return (
    <Cluster gap={3} data-affordance>
      <a
        href="/resume.pdf"
        download
        className="p-link p-link--underline"
        style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-sm-size)" }}
      >
        Download as PDF
      </a>
    </Cluster>
  );
}
