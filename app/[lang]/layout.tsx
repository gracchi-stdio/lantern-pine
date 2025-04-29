import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css"; // Adjusted import path relative to [lang]
import { getLangDir } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Latern Pine",
  description: "Latern Pine Podcast",
};

type RootLayoutProps = {
  children: React.ReactNode;
  // params might resolve asynchronously
  params: { lang: string }; // Keep type simple, handle await below
};

// Make the function async
export default async function RootLayout({
  children,
  params,
}: Readonly<RootLayoutProps>) {
  // The error message suggests awaiting is needed here.
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  const dir = getLangDir(lang);

  return (
    <html lang={lang} dir={dir}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
