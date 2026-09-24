import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DiffMind AI",
  description: "AI-powered code review for GitHub Pull Requests. Understand changes before they become problems.",
  keywords: ["code review", "GitHub", "AI", "pull request", "Nemotron", "developer tools"],
  authors: [{ name: "DiffMind AI" }],
  openGraph: {
    title: "DiffMind AI — AI Code Review for GitHub",
    description: "Understand changes before they become problems.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DiffMind AI",
    description: "AI-powered code review for GitHub Pull Requests.",
  },
  robots: "index, follow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased dm-bg-pattern">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}