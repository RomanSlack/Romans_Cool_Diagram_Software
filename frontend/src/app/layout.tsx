import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#D8E5F3",
};

export const metadata: Metadata = {
  title: {
    default: "Romans Cool Diagram Software (RCDS) - Free Open Source Diagram Editor",
    template: "%s | Romans Cool Diagram Software",
  },
  description:
    "Free, open-source diagram editor by Roman Slack. Create beautiful architecture diagrams, flowcharts, system designs, and network diagrams. A modern alternative to Draw.io, Lucidchart, and Figma for technical diagrams with publication-ready output.",
  keywords: [
    "diagram editor",
    "open source diagram tool",
    "draw.io alternative",
    "drawio alternative",
    "diagrams.net alternative",
    "lucidchart alternative",
    "figma alternative for diagrams",
    "free diagram software",
    "architecture diagram tool",
    "flowchart maker",
    "system design tool",
    "technical diagram editor",
    "academic diagram software",
    "publication-ready diagrams",
    "JSON diagram format",
    "self-hosted diagram tool",
    "network diagram maker",
    "UML diagram tool",
    "ERD diagram tool",
    "microservices architecture diagram",
    "cloud architecture diagram",
    "svg diagram export",
    "react diagram editor",
    "Romans Cool Diagram Software",
    "RCDS",
    "Roman Slack",
  ],
  authors: [{ name: "Roman Slack", url: "https://github.com/romanslack" }],
  creator: "Roman Slack",
  publisher: "Roman Slack",
  applicationName: "Romans Cool Diagram Software",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://rcds.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rcds.app",
    title: "Romans Cool Diagram Software (RCDS) - Free Open Source Diagram Editor",
    description:
      "Free, open-source diagram editor by Roman Slack. Create beautiful architecture diagrams, flowcharts, and system designs. A modern alternative to Draw.io and Lucidchart.",
    siteName: "Romans Cool Diagram Software",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Romans Cool Diagram Software Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Romans Cool Diagram Software (RCDS) - Free Open Source Diagram Editor",
    description:
      "Free, open-source diagram editor by Roman Slack. Create beautiful architecture diagrams, flowcharts, and system designs.",
    creator: "@romanslack",
    images: ["/android-chrome-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon-32x32.png",
        color: "#D8E5F3",
      },
    ],
  },
  manifest: "/site.webmanifest",
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
