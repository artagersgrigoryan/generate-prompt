import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_SEGMENTS = ["/dashboard", "/settings"];

function isProtected(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(en|hy|ru)/, "") || "/";
  return PROTECTED_SEGMENTS.some((seg) => withoutLocale.startsWith(seg));
}

export default auth((req) => {
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
