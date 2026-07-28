import type { Metadata } from "next";
import { Geist, Bebas_Neue } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Script from "next/script";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { auth } from "@/lib/auth";
import { listTools, toPublicTool } from "@/lib/tools";
import { SITE_URL } from "@/lib/site-url";
import "../globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});


export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function buildAlternates(locale: string, path: string = "") {
  const siteUrl = SITE_URL;
  if (!siteUrl) return {};
  return {
    canonical: `${siteUrl}/${locale}${path}`,
    languages: {
      ...Object.fromEntries(
        routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`])
      ),
      "x-default": `${siteUrl}/en${path}`,
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = SITE_URL;
  return {
    // Absolute base for resolving OG/Twitter image URLs (incl. opengraph-image
    // routes). Without this, Next falls back to localhost.
    ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
    title: {
      template: "%s | Prompt Station",
      default: "AI Writing Tools for Career & Code — Prompt Station",
    },
    description:
      "12 AI generators for cover letters, LinkedIn profiles, resume bullets, cold emails, personal bios, website briefs, and more. Free, 2 minutes each.",
    alternates: buildAlternates(locale),
  };
}

export { buildAlternates };

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const session = await auth();
  const tools = listTools().map(toPublicTool);

  return (
    <html lang={locale} className={`${geist.variable} ${bebasNeue.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-M5R9TQ7Y78"
          strategy="afterInteractive"
        />
        <Script
          id="ga-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-M5R9TQ7Y78');
            `,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>

      <body className="min-h-full bg-white font-[family-name:var(--font-geist-sans)] dark:bg-neutral-950" suppressHydrationWarning>
        {SITE_URL && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Prompt Station",
                url: SITE_URL,
              }).replace(/</g, "\\u003c"),
            }}
          />
        )}

        <Providers session={session}>
          <NextIntlClientProvider messages={messages}>
            <Header tools={tools} />
            {/*
              The <Header> is `position: fixed`, so it's out of the document
              flow and does NOT push content down. This wrapper reserves the
              header's height (h-16 / 64px) for EVERY page, so individual pages
              never need to add their own header offset.
              Pages that intentionally want content to sit *under* the
              transparent header (e.g. the landing hero) opt out with `-mt-16`.
            */}
            <div className="pt-16">{children}</div>
            <Footer />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
