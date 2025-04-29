// middleware.ts
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "fa"];
const defaultLocale = "fa";

// ... getLocale function ...
function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales);
  try {
    return match(languages, locales, defaultLocale);
  } catch (e) {
    console.warn("Locale matching failed, falling back to default:", e);
    return defaultLocale;
  }
}


export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log(`Middleware processing path: ${pathname}`);

  // --- Skip checks for specific prefixes and static files ---
  if (
    pathname.startsWith('/admin') || // ADD THIS: Skip /admin routes
    pathname.includes('.') // Skip static files (heuristic)
  ) {
    console.log(` -> Path is /admin or contains '.', skipping locale handling.`);
    return undefined; // Allow the request to proceed without locale handling
  }
  // -------------------------------------------------------

  const pathnameIsMissingLocale = locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    const newPathname = `/${locale}${pathname}`;
    console.log(` -> Redirecting to: ${newPathname}`);
    return NextResponse.redirect(new URL(newPathname, request.url));
  }

  console.log(` -> Path already has locale, proceeding.`);
  return undefined;
}

// Matcher remains the same for now
export const config = {
  matcher: [
    '/((?!api|admin|_next/static|_next/image|favicon.ico).*)',
  ],
};
