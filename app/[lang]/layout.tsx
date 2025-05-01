import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css"; // Adjusted import path relative to [lang]
import { getDictionary, getLangDir } from "@/lib/utils";
import { getCurrentSession } from "@/lib/db/session";
import { TZDate } from "react-day-picker";
import { Locale, LOCALES } from "@/lib/settings";
import { SiteHeader } from "@/components/site-header";
import { AudioPlayerLayoutWrapper } from "@/components/audio-player";
import { headers } from "next/headers";

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
  params: { lang: Locale };
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
  const pathname = (await headers()).get("x-pathname") || "";
  const hideHeader = LOCALES.map((locale) => [`/${locale}/login`, `/${locale}`])
    .flat()
    .some((path) => pathname.includes(path));
  const showHeader = !hideHeader;
  const showFooter = true;

  console.log("s", pathname);

  const { user } = await getCurrentSession();
  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AudioPlayerLayoutWrapper>
          <div className="min-h-screen">
            {/* Header Section */}
            {showHeader && (
              <SiteHeader isLogged={!!user} dict={dict} lang={lang} />
            )}
            {children}
            {showFooter && (
              <footer className="container mx-auto px-4 py-6 text-center border-t">
                <p className="text-sm text-muted-foreground">
                  {dict?.footnote.credit.replace(
                    "{date}",
                    TZDate.tz("Asia/Tehran")
                      .toLocaleString(lang, { year: "numeric" })
                      .split("/")[0],
                  )}
                </p>
              </footer>
            )}
          </div>
        </AudioPlayerLayoutWrapper>
      </body>
    </html>
  );
}
