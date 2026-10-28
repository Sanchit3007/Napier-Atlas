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

export const metadata: Metadata = {
  title: {
    default: "NapierAtlas — Napier Grass Agronomy & Bio-CNG Planner",
    template: "%s · NapierAtlas",
  },
  description:
    "Compare Napier grass strains, simulate fodder and Bio-CNG yields for your land, and plan high-yield cultivation.",
};

// Wraps every page: loads the Geist fonts and sets the site-wide title and description.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
