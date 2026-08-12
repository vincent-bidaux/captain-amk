import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback — Captain AMK",
  robots: { index: false, follow: false },
};

export default function FeedbacksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
