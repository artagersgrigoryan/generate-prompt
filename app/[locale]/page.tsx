import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import ResumeBanner from "@/components/ResumeBanner";
import { buildAlternates } from "@/app/[locale]/layout";
import { ToolsGallery } from "@/components/ToolsGallery";
import OutputTicker from "@/components/OutputTicker";
import { getToolIcon } from "@/lib/toolIcons";
import { SITE_URL } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      absolute: "AI Writing Tools for Career & Code — Prompt Station",
    },
    description:
      "12 AI generators for cover letters, LinkedIn profiles, resume bullets, cold emails, personal bios, website briefs, and more. Free, 2 minutes each.",
    openGraph: {
      title: "AI Writing Tools for Career & Code",
      description:
        "12 focused AI generators — cover letters, LinkedIn summaries, resume bullets, cold outreach, personal bios, website briefs, and more. Free. Under 2 minutes each.",
      type: "website",
      url: SITE_URL ? `${SITE_URL}/${locale}` : undefined,
      images: [
        {
          url: "/og-image.png",
          width: 1512,
          height: 784,
          alt: "AI Writing Tools — 12 generators for career and code",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "AI Writing Tools for Career & Code",
      description:
        "12 focused AI generators. Free. Under 2 minutes each.",
      images: ["/og-image.png"],
    },
    alternates: buildAlternates(locale),
  };
}

type Category = {
  nameKey: string;
  descKey: string;
  toolsKey: string;
  slugs: string[];
  accent: string;
};

const CATEGORIES: Category[] = [
  {
    nameKey: "cat0name",
    descKey: "cat0desc",
    toolsKey: "cat0tools",
    slugs: ["cover-letter-generator", "resume-bullet-point-generator", "elevator-pitch-generator", "thank-you-email-generator"],
    accent: "#16a34a",
  },
  {
    nameKey: "cat1name",
    descKey: "cat1desc",
    toolsKey: "cat1tools",
    slugs: ["linkedin-summary-generator", "personal-bio-generator", "social-bio-generator", "linkedin-recommendation-generator"],
    accent: "#0077b5",
  },
  {
    nameKey: "cat2name",
    descKey: "cat2desc",
    toolsKey: "cat2tools",
    slugs: ["cold-outreach-email-generator", "email-subject-line-generator"],
    accent: "#ea580c",
  },
  {
    nameKey: "cat3name",
    descKey: "cat3desc",
    toolsKey: "cat3tools",
    slugs: ["website-prompt-generator", "resignation-letter-generator"],
    accent: "#6366f1",
  },
];

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

  const faqs = [
    { q: t("faq0q"), a: t("faq0a") },
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
    { q: t("faq4q"), a: t("faq4a") },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="-mt-16 min-h-screen bg-white dark:bg-neutral-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }}
      />
      <div className="pt-16">
        <ResumeBanner />
      </div>
      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-neutral-950 px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center overflow-hidden">
          <div className="mx-auto max-w-4xl">
            {/* Badge */}
            <div
              className="animate-hero-in mb-8 inline-flex items-center gap-2.5 rounded-full border border-neutral-200 bg-neutral-100 px-4 py-1.5 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
              style={{ animationDelay: "100ms" }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              {t("badge")}
              <svg className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Headline */}
            <h1
              className="animate-hero-in text-balance text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05]"
              style={{ animationDelay: "180ms" }}
            >
              {t("heroH1Lead")}{" "}
              <em className="italic text-neutral-500 dark:text-neutral-400">{t("heroH1Emphasis")}</em>
            </h1>

            {/* Subtitle */}
            <p
              className="animate-hero-in mx-auto mt-6 max-w-2xl text-pretty text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed"
              style={{ animationDelay: "260ms" }}
            >
              {t("heroSubtitle")}
            </p>

            {/* CTAs */}
            <div
              className="animate-hero-in mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              style={{ animationDelay: "340ms" }}
            >
              <a
                href="#tools"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-neutral-800 active:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-100"
              >
                {t("heroCta")}
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                {t("footerHowLink")} →
              </a>
            </div>
            <p
              className="animate-hero-in mt-3 text-xs text-neutral-500 dark:text-neutral-600"
              style={{ animationDelay: "420ms" }}
            >
              {t("heroMicrocopy")}
            </p>

            {/* Output ticker */}
            <OutputTicker />
          </div>
        </section>

        {/* ── Tools gallery ─────────────────────────────────────────────────── */}
        <ToolsGallery />

        {/* ── Use case categories ───────────────────────────────────────────── */}
        <section className="border-y border-neutral-100 bg-neutral-50 px-6 py-20 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center space-y-3">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {t("categoriesTitle")}
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400">{t("categoriesSubtitle")}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CATEGORIES.map((cat) => {
                const icons = cat.slugs.slice(0, 3).map((slug) => getToolIcon(slug));
                return (
                  <div
                    key={cat.nameKey}
                    className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    {/* Icon cluster */}
                    <div className="flex items-center gap-1.5">
                      {icons.map((Icon, i) => (
                        <span
                          key={i}
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${cat.accent}18`, color: cat.accent }}
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                      ))}
                    </div>

                    {/* Text */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                          {t(cat.nameKey as Parameters<typeof t>[0])}
                        </span>
                        <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                          {t(cat.toolsKey as Parameters<typeof t>[0])}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                        {t(cat.descKey as Parameters<typeof t>[0])}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="px-6 py-24"
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

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section
          id="faq"
          className="border-t border-neutral-100 bg-neutral-50 px-6 py-24 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {t("faqTitle")}
            </h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
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
            <a
              href="#tools"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-black transition-colors hover:bg-neutral-100"
            >
              {t("ctaButton")}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
