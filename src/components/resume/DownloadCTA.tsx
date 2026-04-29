import Cluster from "@/components/primitives/Cluster";

export default function DownloadCTA() {
  return (
    <Cluster gap={3} data-affordance>
      <a
        href="/resume.pdf"
        download
        className="site-action"
      >
        Download as PDF
      </a>
    </Cluster>
  );
}
