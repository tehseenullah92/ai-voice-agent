import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

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

export const metadata: Metadata = {
  title: "Convaire",
  description: "Voice AI calling platform — SendGrid for AI phone calls.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body
        className={`${geistSans.className} min-h-screen bg-background antialiased text-foreground`}
      >
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
