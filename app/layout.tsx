import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ACGC General Elections 2026",
  description:
    "Official Election Platform of the Ghanaian Community in Russia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-screen flex-col overflow-x-hidden bg-white">

        {/* Global ACGC Background Watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-[url('/images/acgc-watermark.png')] bg-center bg-no-repeat opacity-[0.035]"
          style={{
            backgroundSize: "min(75vw, 650px)",
          }}
        />

        {/* Website Header */}
        <div className="relative z-10">
          <Header />
        </div>

        {/* Main Website Content */}
        <main className="relative z-10 flex-1">
          {children}
        </main>

        {/* Website Footer */}
        <div className="relative z-10">
          <Footer />
        </div>

      </body>
    </html>
  );
}