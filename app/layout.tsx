import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eventlify",
  description: "Platform to discover, register, and manage campus events and clubs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
