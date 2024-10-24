import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/nav";
import { Toaster } from "@/components/ui/toaster";

const mainFont = localFont({
  src: "../../public/fonts/ADLaMDisplay-Regular.ttf",
  variable: "--font-main",
});

export const metadata: Metadata = {
  title: "High Seas | Hack Club",
  description: "Build cool projects. Get cool stuff.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mainFont.variable} antialiased`}>
        <Nav />
        <main className="pt-14">{children}</main>
        <SpeedInsights />
        <Toaster />
      </body>
    </html>
  );
}
