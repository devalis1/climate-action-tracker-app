import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

// Archia is not freely hosted on Google Fonts; Space Grotesk is the closest geometric substitute for headings.
const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "City Climate Action Tracker",
  description: "Open Earth-style climate action tracker for city climate programs.",
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${heading.variable} ${body.variable} ${mono.variable} flex min-h-screen flex-col bg-brand-bg font-sans text-white antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:border focus:border-brand-accent focus:bg-brand-surface focus:px-4 focus:py-2 focus:font-heading focus:text-sm focus:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-accent/60"
        >
          Skip to main content
        </a>
        <ToastProvider>
          <SiteHeader />
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
