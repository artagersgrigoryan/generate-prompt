import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Script from "next/script";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { auth } from "@/lib/auth";
import "../globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function buildAlternates(locale: string, path: string = "") {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    // Absolute base for resolving OG/Twitter image URLs (incl. opengraph-image
    // routes). Without this, Next falls back to localhost.
    ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
    title: "Website Prompt Generator",
    description:
      "Answer 12 quick questions and generate a detailed AI brief for your website.",
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

  return (
    <html lang={locale} className={`${geist.variable} h-full antialiased`}>
      <head>
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

      <body className="min-h-full bg-white font-[family-name:var(--font-geist-sans)] dark:bg-neutral-950">

        <Providers session={session}>
          <NextIntlClientProvider messages={messages}>
            <Header />
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
