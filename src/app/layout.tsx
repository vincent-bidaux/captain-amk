import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Cotation NGAP en 1 clic pour kinésithérapeutes — AMK, AMS, AMC, majorations et indemnités";

export const metadata: Metadata = {
  metadataBase: new URL("https://captain-amk.netlify.app"),
  title: "Captain AMK",
  description,
  icons: {
    icon: "/captain-amk-favicon.png",
    apple: "/captain-amk-app-icon.png",
  },
  openGraph: {
    title: "Captain AMK",
    description,
    siteName: "Captain AMK",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/captain-amk-open-graph.png",
        width: 2848,
        height: 1504,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Captain AMK",
    description,
    images: ["/captain-amk-open-graph.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
