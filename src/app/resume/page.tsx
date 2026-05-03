import type { Metadata } from "next";
import { Suspense } from "react";
import Container from "@/components/primitives/Container";
import Stack from "@/components/primitives/Stack";
import DownloadCTA from "@/components/resume/DownloadCTA";
import PrintMode from "@/components/resume/PrintMode";
import ResumeIdentity from "@/components/resume/ResumeIdentity";
import ResumeSkills from "@/components/resume/ResumeSkills";
import ResumeSummary from "@/components/resume/ResumeSummary";
import ResumeTimeline from "@/components/resume/ResumeTimeline";
import ResumeWriting from "@/components/resume/ResumeWriting";
import education from "@/content/resume/education";
import experience from "@/content/resume/experience";
import identity from "@/content/resume/identity";
import leadership from "@/content/resume/leadership";
import skills from "@/content/resume/skills";
import summary from "@/content/resume/summary";
import writing from "@/content/resume/writing";

const RESUME_DESCRIPTION =
  "Resume of Michael Quintin — University of Chicago student, founder of The Nash Lab / Hivemind, and operator-researcher.";

export const metadata: Metadata = {
  title: "Resume",
  description: RESUME_DESCRIPTION,
  alternates: { canonical: "/resume" },
  openGraph: {
    type: "profile",
    url: "/resume",
    title: `Resume — ${identity.name}`,
    description: RESUME_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `Resume — ${identity.name}`,
    description: RESUME_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function ResumePage() {
  return (
    <>
      <Suspense fallback={null}>
        <PrintMode />
      </Suspense>
      <Container
        as="section"
        size="wide"
        className="site-page"
      >
        <Stack gap={7}>
          <ResumeIdentity
            name={identity.name}
            role={identity.role}
            email={identity.email}
            phone={identity.phone}
            location={identity.location}
            links={identity.links}
          />
          <ResumeSummary text={summary} />
          {education.length > 0 && (
            <ResumeTimeline heading="education" items={education} />
          )}
          <ResumeTimeline heading="experience" items={experience} />
          <ResumeTimeline heading="leadership & activities" items={leadership} />
          <ResumeSkills groups={skills} />
          {writing.length > 0 && <ResumeWriting items={writing} />}
          <DownloadCTA />
        </Stack>
      </Container>
    </>
  );
}
