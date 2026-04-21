import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://lucid-seven-pied.vercel.app";
const OG_DESCRIPTION =
  "LUCID analyzes short-form video manipulation. Paste a TikTok URL, get a Scroll Trap Score across six psychological manipulation dimensions, with research citations and a 'See Through It' rewrite.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LUCID — See the engineering behind the scroll",
  description: OG_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "LUCID — See the engineering behind the scroll",
    description: OG_DESCRIPTION,
    siteName: "LUCID",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LUCID — Wake up inside the scroll.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LUCID — See the engineering behind the scroll",
    description: OG_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <body className="min-h-screen bg-black text-white">{children}</body>
    </html>
  );
}
