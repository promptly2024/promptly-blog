import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    default: "Promptly Blog - Share Your Stories with the World",
    template: "%s | Promptly Blog"
  },
  description: "Join thousands of writers sharing their passion, expertise, and creativity. Start your blogging journey today and connect with readers worldwide on Promptly Blog.",
  keywords: [
    "blog",
    "blogging platform",
    "writing",
    "stories",
    "writers",
    "content creation",
    "publishing",
    "online writing",
    "creative writing",
    "blog posts"
  ],
  authors: [{ name: "Promptly Blog Team" }],
  creator: "Promptly Blog",
  publisher: "Promptly Blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        <ClerkProvider>
          <Navbar />
          {children}
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
