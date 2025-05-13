import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "../globals.css"; // Adjusted import path relative to [lang]
import { cn, getDictionary, getLangDir } from "@/lib/utils";
import { getCurrentSession } from "@/lib/db/session";
import { TZDate } from "react-day-picker";
import { Locale } from "@/lib/settings";
import { SiteHeader } from "@/components/site-header";
import { AudioPlayerLayoutWrapper } from "@/components/audio-player";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Latern Pine",
  description: "Latern Pine Podcast",
};

type RootLayoutProps = {
  children: React.ReactNode;
  // params might resolve asynchronously
  params: Promise<{ lang: Locale }>;
};

// Make the function async
export default async function RootLayout({
  children,
  params,
}: Readonly<RootLayoutProps>) {
  // The error message suggests awaiting is needed here.
  const resolvedParams = await params;
  const { lang } = resolvedParams;
  const dir = getLangDir(lang);
  const dict = await getDictionary(lang);

  const showFooter = true;

  const { user } = await getCurrentSession();
  return (
    <html
      lang={lang}
      dir={dir}
      className={cn(lang === "fa" ? vazirmatn.className : undefined, "dark")}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AudioPlayerLayoutWrapper>
          <div className="min-h-screen flex flex-col justify-between">
            {/* Header Section */}

            <SiteHeader isLogged={!!user} dict={dict} lang={lang} />

            {children}
            {showFooter && (
              <footer className="container mx-auto px-4 py-6 text-center border-t">
                <p className="text-sm text-muted-foreground flex flex-col md:flex-row justify-center items-center">
                  {dict?.footnote.credit.replace(
                    "{date}",
                    TZDate.tz("Asia/Tehran")
                      .toLocaleString(lang, { year: "numeric" })
                      .split("/")[0],
                  )}
                  |
                  <a
                    href="https://t.me/lanternandpine"
                    target="_blank"
                    className="flex items-center"
                    rel="noopener noreferrer"
                  >
                    <Image
                      className="dark:invert"
                      src="/telegram.svg"
                      alt="telegram"
                      width={25}
                      height={25}
                      priority
                    />
                    Telegram
                  </a>
                </p>
              </footer>
            )}
          </div>
        </AudioPlayerLayoutWrapper>
        <Analytics />
      </body>
    </html>
  );
}
