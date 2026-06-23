import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import HeroCta from "@/components/HeroCta";
import ResumeBanner from "@/components/ResumeBanner";
import { buildAlternates } from "@/app/[locale]/layout";
import { DEFAULT_TOOL_SLUG } from "@/lib/tools/slugs";
import { ToolsGallery } from "@/components/ToolsGallery";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

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
    /* -mt-16 cancels the layout's header offset (pt-16) for the whole landing
       page, so the hero sits under the transparent header (which turns into a
       glass pill on scroll). Other pages keep the offset and clear the header. */
    <div className="-mt-16 min-h-screen bg-white dark:bg-neutral-950">
      <ResumeBanner />
      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-neutral-950 px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center overflow-hidden">
          <div className="mx-auto max-w-4xl">
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
                  },
                },
                item: {
                  hidden: { opacity: 0, filter: "blur(12px)", y: 16 },
                  visible: {
                    opacity: 1,
                    filter: "blur(0px)",
                    y: 0,
                    transition: { type: "spring", bounce: 0.3, duration: 1.4 },
                  },
                },
              }}
            >
              {/* Badge */}
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-neutral-200 bg-neutral-100 px-4 py-1.5 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                {t("badge")}
                <svg className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Headline */}
              <h1 className="text-balance text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05]">
                {t("heroH1Lead")}{" "}
                <em className="italic text-neutral-500 dark:text-neutral-400">{t("heroH1Emphasis")}</em>
              </h1>

              {/* Subtitle */}
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {t("heroSubtitle")}
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <HeroCta />
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                >
                  {t("footerHowLink")} →
                </a>
              </div>
              <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-600">{t("heroMicrocopy")}</p>

              {/* Brief preview card */}
              <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-xl shadow-black/10 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-black/40">
                {/* Card header bar */}
                <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-950">
                  <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Generated brief
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:border-green-900 dark:bg-green-950/60 dark:text-green-400">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                    Ready to paste
                  </span>
                </div>

                {/* Content */}
                <div className="relative h-72 overflow-x-auto overflow-y-hidden p-6">
                  <pre className="min-w-0 select-none whitespace-pre-wrap font-mono text-[0.8rem] leading-[1.75] text-neutral-600 dark:text-neutral-400">
{`# Coffee Shop Website Brief

**Client**    Brew & Grounds Café, Portland OR
**Goal**      Online presence + online ordering
**Audience**  Coffee enthusiasts aged 25–42

## Visual Direction
Warm-modern editorial. Generous white space,
earth-toned accents, high-contrast typography.
Reference: Blue Bottle Coffee, Kinfolk magazine.

## Pages & Hierarchy
1. Home    — hero story + featured drinks
2. Menu    — filterable by category
3. About   — origin + team profiles
4. Order   — integrated third-party widget
5. Contact — map, hours, reservation link

## Code & Tech
Next.js 14 · Tailwind CSS · TypeScript
Mobile-first. WCAG 2.1 AA. No CMS for v1.`}
                  </pre>
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent" />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>

        {/* ── Tools gallery (hub) ───────────────────────────────────────────── */}
        <ToolsGallery />

        {/* ── Platform slider ───────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-neutral-950 pb-20 border-b border-neutral-100 dark:border-neutral-800">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col items-center md:flex-row">
              <div className="shrink-0 md:max-w-44 border-neutral-200 dark:border-neutral-800 md:border-r md:pr-6">
                <p className="text-center text-sm text-neutral-500 md:text-end">
                  {t("platformsLabel")}
                </p>
              </div>
              <div className="relative w-full py-6 md:w-[calc(100%-11rem)]">
                <InfiniteSlider duration={40} gap={80}>
                  {[
                    { src: "/logos/bolt.svg", alt: "Bolt", h: "h-5" },
                    { src: "/logos/cursor.svg", alt: "Cursor", h: "h-5" },
                    { src: "/logos/lovable.svg", alt: "Lovable", h: "h-5" },
                    { src: "/logos/v0.svg", alt: "v0", h: "h-5" },
                  ].map((logo) => (
                    <div key={logo.alt} className="flex items-center">
                      <img
                        src={logo.src}
                        alt={`${logo.alt} logo`}
                        className={`${logo.h} w-auto opacity-40 dark:invert dark:opacity-50`}
                      />
                    </div>
                  ))}
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-600">Arena.ai</span>
                  </div>
                </InfiniteSlider>

                <ProgressiveBlur
                  className="pointer-events-none absolute left-0 top-0 h-full w-20"
                  direction="left"
                  blurIntensity={1}
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute right-0 top-0 h-full w-20"
                  direction="right"
                  blurIntensity={1}
                />
              </div>
            </div>
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
              href={`/tools/${DEFAULT_TOOL_SLUG}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-black transition-colors hover:bg-neutral-100"
            >
              {t("ctaButton")}
            </Link>
          </div>
        </section>
      </main>

    </div>
  );
}
