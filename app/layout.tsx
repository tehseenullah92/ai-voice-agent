import type { ReactNode } from "react";
import "../src/styles/index.css";

export const metadata = {
  title: "AI Voice Agent",
  description: "AI voice agent dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

