import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_SEGMENTS = ["/dashboard", "/settings"];

// The default *.vercel.app deployment domain serves the same content as the
// custom domain, which Google treats as duplicate content. Vercel's Domains UI
// can't redirect the system domain, so we do it here: permanently send every
// generate-prompt-five.vercel.app request to the canonical custom domain.
const CANONICAL_HOST = "www.promptstation.online";
const VERCEL_HOST = "generate-prompt-five.vercel.app";

function isProtected(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(en|hy|ru)/, "") || "/";
  return PROTECTED_SEGMENTS.some((seg) => withoutLocale.startsWith(seg));
}

export default auth((req) => {
  if (req.headers.get("host") === VERCEL_HOST) {
    const url = req.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.protocol = "https";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  if (req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/en";
    return NextResponse.redirect(url, 301);
  }

  if (isProtected(req.nextUrl.pathname) && !req.auth) {
    const locale = req.nextUrl.pathname.match(/^\/(en|hy|ru)/)?.[1] ?? "en";
    const signInUrl = new URL(`/${locale}/auth/signin`, req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
