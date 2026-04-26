import type { Metadata } from "next";
import ChatSurface from "@/components/llm/ChatSurface";
import identity from "@/content/about/identity";

const CHAT_DESCRIPTION =
  "A retrieval-augmented model grounded in Michael Quintin's essays, project notes, and public writing — answers from the corpus, not the man.";

export const metadata: Metadata = {
  title: "Chat",
  description: CHAT_DESCRIPTION,
  alternates: { canonical: "/chat" },
  openGraph: {
    type: "website",
    url: "/chat",
    title: `Chat — ${identity.name}`,
    description: CHAT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `Chat — ${identity.name}`,
    description: CHAT_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function ChatPage() {
  return <ChatSurface />;
}
