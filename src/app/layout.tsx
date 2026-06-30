import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/public-api";
import { AppProviders } from "./providers";
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
  metadataBase: new URL(SITE_URL),
  title: "biyeon.log",
  description:
    "라이프로그, 북 노트, 기술 노트, 비즈니스 기록을 남기는 개인 블로그",
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/rss.xml`,
    },
  },
  openGraph: {
    title: "biyeon.log",
    description:
      "라이프로그, 북 노트, 기술 노트, 비즈니스 기록을 남기는 개인 블로그",
    url: SITE_URL,
    siteName: "biyeon.log",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "biyeon.log",
    description:
      "라이프로그, 북 노트, 기술 노트, 비즈니스 기록을 남기는 개인 블로그",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
