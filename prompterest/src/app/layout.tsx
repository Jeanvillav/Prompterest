import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Keeping Geist as it's nice
import "./globals.css";
import Navbar from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prompterest | Discover & Share AI Prompts",
  description: "The premium social network for AI prompt engineering. Find, save, and share the best prompts for Midjourney, ChatGPT, and more.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prompterest.vercel.app",
    siteName: "Prompterest",
    title: "Prompterest | Discover & Share AI Prompts",
    description: "The premium social network for AI prompt engineering.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompterest | Discover & Share AI Prompts",
    description: "The premium social network for AI prompt engineering.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-[#0d0d0d] text-gray-100`}
      >
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
