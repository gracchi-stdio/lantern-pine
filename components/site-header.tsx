"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn, getDictionary } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Locale, LOCALES } from "@/lib/settings";
import { logout } from "@/lib/actions";

const navigationItems = [
  { name: "Home", href: "/" },
  // { name: "Features", href: "/features" },
  // { name: "Pricing", href: "/pricing" },
  // { name: "About", href: "/about" },
  // { name: "Contact", href: "/contact" },
];

interface SiteHeaderProps {
  dict: Awaited<ReturnType<typeof getDictionary>>;
  lang: Locale;
  isLogged?: boolean;
}

export function SiteHeader({ dict, lang, isLogged = false }: SiteHeaderProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  const hideHeader = LOCALES.map((locale) => [`/${locale}`, `/${locale}/login`])
    .flat()
    .some((path) => pathname === path);
  return (
    <>
      {!hideHeader && (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
          <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <Link href={`/${lang}`} className="font-bold text-lg">
                {dict.site_name}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:gap-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Navigation */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col gap-4 py-4">
                  <Link
                    href="/"
                    className="text-xl font-bold"
                    onClick={() => setOpen(false)}
                  >
                    Brand
                  </Link>
                  <nav className="flex flex-col gap-3">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary",
                          pathname === item.href
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop CTA */}
            {isLogged && (
              <div className="hidden md:block">
                <Button onClick={async () => logout()}>logout</Button>
              </div>
            )}
          </div>
        </header>
      )}
    </>
  );
}
