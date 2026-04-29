import Cluster from "@/components/primitives/Cluster";
import Link from "@/components/primitives/Link";
import Stack from "@/components/primitives/Stack";

type ResumeLink = { label: string; href: string };

type Props = {
  name: string;
  role: string;
  email: string;
  location?: string;
  links: ResumeLink[];
};

export default function ResumeIdentity({ name, role, email, location, links }: Props) {
  return (
    <Stack gap={3} as="header">
      <h1 className="site-title">{name}</h1>
      <p className="site-subhead">{role}</p>
      <Cluster gap={3} className="resume-header__links">
        {location && <span>{location}</span>}
        <Link href={`mailto:${email}`} variant="subtle">
          {email}
        </Link>
        {links.map((l) => (
          <Link key={l.href} href={l.href} variant="subtle" external>
            {l.label}
          </Link>
        ))}
      </Cluster>
    </Stack>
  );
}
