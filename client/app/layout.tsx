import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InsightDesk",
  description: "Support intelligence demo for chat-to-insights workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
