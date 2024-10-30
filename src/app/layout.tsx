import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/nav";
import { Toaster } from "@/components/ui/toaster";

import { Analytics } from "@vercel/analytics/react";
import Fullstory from "@/components/fullstory";

const mainFont = localFont({
  src: "../../public/fonts/arialroundedmtbold.ttf",
  variable: "--font-main",
});

export const metadata: Metadata = {
  title: "High Seas | Hack Club",
  description: "Build cool projects. Get cool stuff.",
  openGraph: {
    images: [
      {
        url: "/ogcard.png",
        width: 1200,
        height: 630,
        alt: "High Seas OG Image",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mainFont.variable} antialiased`}>
        <link
          rel="icon"
          type="image/png"
          href="/favicons/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicons/favicon.svg" />
        <link rel="shortcut icon" href="/favicons/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicons/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="High Seas" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <Nav />
        <main className="pt-14">{children}</main>
        <Analytics />
        <Fullstory />
        <SpeedInsights />
        <Toaster />
      </body>
    </html>
  );
}
