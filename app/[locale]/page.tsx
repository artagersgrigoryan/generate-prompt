import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import HeroCta from "@/components/HeroCta";
import ResumeBanner from "@/components/ResumeBanner";
import { buildAlternates } from "@/app/[locale]/layout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Website Prompt Generator — AI brief for any coding tool",
    description:
      "Answer 13 questions and Claude AI writes a complete website brief. Paste it into Bolt, Cursor, v0, Lovable, or any AI builder. Free. 2 minutes.",
    openGraph: {
      title: "Website Prompt Generator",
      description:
        "13 focused questions → a complete AI brief that works in any AI builder. Verified for Bolt, Cursor, v0, Lovable, Arena.ai. Also pastes cleanly into Replit, Windsurf, ChatGPT, and more. Free. Under 2 minutes.",
      type: "website",
      url: process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}`
        : undefined,
      images: [
        {
          url: "/og-image.png",
          width: 1512,
          height: 784,
          alt: "Website Prompt Generator — build your AI brief in 2 minutes",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Website Prompt Generator",
      description:
        "13 focused questions → a complete AI brief for any AI builder. Free. Under 2 minutes.",
      images: ["/og-image.png"],
    },
    alternates: buildAlternates(locale),
  };
}

const PLATFORMS = ["Bolt", "Lovable", "Cursor", "v0", "Arena.ai"];

function CheckIcon({ className = "h-4 w-4 shrink-0 text-black dark:text-white" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8l3.5 3.5L13 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon({ className = "h-4 w-4 shrink-0 text-neutral-400" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10h12m0 0l-5-5m5 5l-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const steps = [
    { title: t("step0title"), desc: t("step0desc") },
    { title: t("step1title"), desc: t("step1desc") },
    { title: t("step2title"), desc: t("step2desc") },
  ];

  const covered = [
    { title: t("covered0title"), items: t("covered0items") },
    { title: t("covered1title"), items: t("covered1items") },
    { title: t("covered2title"), items: t("covered2items") },
    { title: t("covered3title"), items: t("covered3items") },
  ];

  const outputItems = [
    t("output0"),
    t("output1"),
    t("output2"),
    t("output3"),
    t("output4"),
    t("output5"),
    t("output6"),
    t("output7"),
  ];

  const withoutItems = [t("withoutItem0"), t("withoutItem1"), t("withoutItem2")];
  const withItems = [t("withItem0"), t("withItem1"), t("withItem2")];

  const faqs = [
    { q: t("faq0q"), a: t("faq0a") },
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
    { q: t("faq4q"), a: t("faq4a") },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <ResumeBanner />
      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="px-6 py-24 sm:py-32 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-xs font-semibold text-neutral-500 tracking-wide dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              {t("badge")}
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1] dark:text-neutral-100">
              {t("heroH1Lead")}{" "}
              <span className="italic text-neutral-400">{t("heroH1Emphasis")}</span>
            </h1>

            <p className="mx-auto max-w-xl text-lg text-neutral-500 leading-relaxed dark:text-neutral-400">
              {t("heroSubtitle")}
            </p>

            <div className="pt-2 space-y-3">
              <HeroCta />
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                {t("heroMicrocopy")}
              </p>
            </div>
          </div>
        </section>

        {/* ── Platform trust strip ─────────────────────────────────────────── */}
        <section className="border-y border-neutral-100 bg-neutral-50 px-6 py-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto max-w-4xl space-y-2.5">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mr-1">
                {t("platformsLabel")}
              </span>
              {PLATFORMS.map((p) => (
                <span
                  key={p}
                  className="rounded-lg border border-neutral-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  {p}
                </span>
              ))}
            </div>
            <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
              {t("platformsCaption")}
            </p>
          </div>
        </section>

        {/* ── Without / With (objection handling) ──────────────────────────── */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center space-y-3">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {t("compareTitle")}
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400">{t("compareSubtitle")}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Without card */}
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-7 space-y-5 dark:border-neutral-800 dark:bg-neutral-900">
                <h3 className="text-base font-semibold text-neutral-500 dark:text-neutral-400">
                  {t("withoutHeading")}
                </h3>
                <pre className="whitespace-pre-wrap rounded-lg border border-neutral-200 bg-white px-4 py-3 font-mono text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400">
                  {t("withoutSample")}
                </pre>
                <ul className="space-y-2.5">
                  {withoutItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <XIcon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* With card */}
              <div className="rounded-2xl border-2 border-neutral-900 bg-white p-7 space-y-5 dark:border-neutral-100 dark:bg-neutral-900">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {t("withHeading")}
                </h3>
                <ul className="space-y-2.5 pt-1">
                  {withItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-900 dark:text-neutral-100" />
                      <span className="text-sm text-neutral-800 dark:text-neutral-200">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="border-t border-neutral-200 pt-4 text-sm italic text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
                  {t("withFooter")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="border-y border-neutral-100 bg-neutral-50 px-6 py-24 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-16 text-center text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {t("howItWorksTitle")}
            </h2>

            <div className="relative">
              <div className="absolute left-[1.375rem] top-11 h-[calc(100%-5.5rem)] w-px bg-neutral-200 dark:bg-neutral-700" />
              <div className="space-y-12">
                {steps.map((s, i) => (
                  <div key={i} className="relative flex gap-7">
                    <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white dark:bg-white dark:text-black">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="space-y-1.5 pt-2">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {s.title}
                      </h3>
                      <p className="text-neutral-500 leading-relaxed dark:text-neutral-400">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Input → Output (merged) ──────────────────────────────────────── */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 text-center space-y-3">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {t("ioTitle")}
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400">{t("ioSubtitle")}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr_auto_1fr] md:items-start">
              {/* Input column */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
                  {t("ioInputHeading")}
                </h3>
                <div className="space-y-3">
                  {covered.map((c, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-xs font-bold text-white dark:bg-white dark:text-black">
                          {i + 1}
                        </span>
                        <h4 className="font-bold text-neutral-900 dark:text-neutral-100">{c.title}</h4>
                      </div>
                      <p className="mt-2 text-sm text-neutral-500 leading-relaxed dark:text-neutral-400">
                        {c.items}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow connector (desktop only) */}
              <div className="hidden self-center text-neutral-300 dark:text-neutral-600 md:block">
                <ArrowRightIcon />
              </div>

              {/* Output column */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
                  {t("ioOutputHeading")}
                </h3>
                <div className="grid gap-2.5">
                  {outputItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      <CheckIcon />
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Real examples ────────────────────────────────────────────────── */}
        <section
          id="examples"
          className="border-y border-neutral-100 bg-neutral-50 px-6 py-24 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="mx-auto max-w-5xl space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {t("examplesTitle")}
              </h2>
              <p className="mx-auto max-w-2xl text-neutral-500 dark:text-neutral-400">
                {t("examplesSubtitle")}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { platform: "Lovable", logo: "/logos/lovable.svg", img: "/examples/lovable.png", url: "https://keen-art-essence.lovable.app/", time: "7–10" },
                { platform: "v0",      logo: "/logos/v0.svg",      img: "/examples/v0.png",      url: "https://v0-portfolio-website-build-black-mu.vercel.app/",               time: "6–8"  },
                { platform: "Bolt",    logo: "/logos/bolt.svg",    img: "/examples/bolt.png",    url: "https://artagers-grigoryan-v-ficr.bolt.host/",                          time: "5–7"  },
              ].map((ex) => (
                <a
                  key={ex.platform}
                  href={ex.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <div className="overflow-hidden border-b border-neutral-100 dark:border-neutral-700">
                    <img
                      src={ex.img}
                      alt={`${ex.platform} example`}
                      className="w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      style={{ height: "220px" }}
                    />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={ex.logo} alt={`${ex.platform} logo`} className="h-4 w-4 rounded-sm object-contain" />
                      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{ex.platform}</span>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400">
                      <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                        <circle cx="8" cy="8" r="6.5" />
                        <path d="M8 5v3.5l2 1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {ex.time} {t("examplesMins")}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section id="faq" className="px-6 py-24">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {t("faqTitle")}
            </h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100">{f.q}</h3>
                  <p className="mt-2 text-neutral-500 leading-relaxed dark:text-neutral-400">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────────── */}
        <section className="bg-black px-6 py-24 text-center dark:border-y dark:border-neutral-800">
          <div className="mx-auto max-w-xl space-y-5">
            <h2 className="text-3xl font-bold text-white">{t("ctaTitle")}</h2>
            <p className="text-neutral-400">{t("ctaDesc")}</p>
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-black transition-colors hover:bg-neutral-100"
            >
              {t("ctaButton")}
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer (restructured) ──────────────────────────────────────────── */}
      <footer className="border-t border-neutral-100 bg-white px-6 py-14 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 sm:grid-cols-3">
            {/* Product */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                {t("footerProductTitle")}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#how-it-works"
                    className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  >
                    {t("footerHowLink")}
                  </a>
                </li>
                <li>
                  <a
                    href="#examples"
                    className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  >
                    {t("footerExamplesLink")}
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  >
                    {t("footerFaqLink")}
                  </a>
                </li>
                <li className="pt-1">
                  <Link
                    href="/generator"
                    className="font-semibold text-neutral-900 transition-colors hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-400"
                  >
                    {t("footerCtaLink")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                {t("footerResourcesTitle")}
              </h3>
              <p className="text-sm italic text-neutral-400 dark:text-neutral-500">
                {t("footerComingSoon")}
              </p>
            </div>

            {/* Made by */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                {t("footerMadeByTitle")}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {t("footerMadeByLine")}
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://t.me/artagers"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  title="Telegram"
                  className="text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/artagers.grigoryan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Instagram"
                  className="text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/artagers-grigoryan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                  className="text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="mailto:artagersgrigoryan@gmail.com"
                  aria-label="Email"
                  title="artagersgrigoryan@gmail.com"
                  className="text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-10 7L2 7"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <p className="mt-12 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-400 dark:border-neutral-800">
            {t("footerTagline")}
          </p>
        </div>
      </footer>
    </div>
  );
}
