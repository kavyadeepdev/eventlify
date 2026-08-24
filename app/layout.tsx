import type { Metadata } from "next";
import { Anton, Space_Grotesk } from "next/font/google";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import NavigationLoader from "@/components/shared/navigation-loader";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AfterClass — BMSCE events, clubs & hackathons",
    template: "%s · AfterClass",
  },
  description:
    "The place to discover, register, and manage events and clubs at BMSCE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anton.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        <NavigationLoader>
          <div className="flex min-h-screen flex-col">
            <Header />
            {/* Reserve a viewport of space for the page. While a route is
                still streaming, `children` is empty and this slot would
                collapse to 0px, letting the footer ride up under the header —
                which read as a flash of the footer before the page appeared.
                The header is 76px; `svh` keeps it stable while mobile browser
                chrome shows and hides. */}
            <div className="min-h-[calc(100svh-76px)] flex-1">{children}</div>
            <Footer />
          </div>
        </NavigationLoader>
      </body>
    </html>
  );
}
