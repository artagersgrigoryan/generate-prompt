import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Script from "next/script";
import { Header } from "@/components/Header";
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
  return {
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
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-W2P8MNK9');
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
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W2P8MNK9"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
  
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
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
