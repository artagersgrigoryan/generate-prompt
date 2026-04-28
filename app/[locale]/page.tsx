import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Website Prompt Generator — AI briefs for Bolt, Cursor, v0 & Lovable",
  description:
    "Answer 13 focused questions about your website. Claude AI writes a complete, professional brief you can paste into Bolt, Cursor, v0, Lovable, or Arena.ai and start building immediately.",
  openGraph: {
    title: "Website Prompt Generator",
    description:
      "13 focused questions → a complete AI brief for Bolt, Cursor, v0, Lovable, or Arena.ai. Free. Takes under 2 minutes.",
    type: "website",
  },
};

const PLATFORMS = ["Bolt", "Lovable", "Cursor", "v0", "Arena.ai"];

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-black"
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

  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="px-6 py-24 sm:py-32 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-xs font-semibold text-neutral-500 tracking-wide">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              {t("badge")}
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.1]">
              {t("heroLine1")}{" "}
              <span className="italic text-neutral-400">{t("heroEmphasis")}</span>
              <br />
              {t("heroLine2")}
            </h1>

            <p className="mx-auto max-w-xl text-lg text-neutral-500 leading-relaxed">
              {t("heroSubtitle")}
            </p>

            <div className="pt-2">
              <Link
                href="/generator"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-neutral-800 active:bg-neutral-900"
              >
                {t("heroCta")}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Platform trust strip ─────────────────────────────────────────── */}
        <section className="border-y border-neutral-100 bg-neutral-50 px-6 py-5">
          <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mr-1">
              {t("platformsLabel")}
            </span>
            {PLATFORMS.map((p) => (
              <span
                key={p}
                className="rounded-lg border border-neutral-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm"
              >
                {p}
              </span>
            ))}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-16 text-center text-3xl font-bold text-neutral-900">
              {t("howItWorksTitle")}
            </h2>

            <div className="relative">
              <div className="absolute left-[1.375rem] top-11 h-[calc(100%-5.5rem)] w-px bg-neutral-200" />
              <div className="space-y-12">
                {steps.map((s, i) => (
                  <div key={i} className="relative flex gap-7">
                    <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="space-y-1.5 pt-2">
                      <h3 className="text-lg font-bold text-neutral-900">
                        {s.title}
                      </h3>
                      <p className="text-neutral-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── What the 13 questions cover ──────────────────────────────────── */}
        <section className="border-y border-neutral-100 bg-neutral-50 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-neutral-900">
              {t("coveredTitle")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {covered.map((c, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <h3 className="font-bold text-neutral-900">{c.title}</h3>
                  </div>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {c.items}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Output dimensions ────────────────────────────────────────────── */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center space-y-3">
              <h2 className="text-3xl font-bold text-neutral-900">
                {t("outputTitle")}
              </h2>
              <p className="text-neutral-500">{t("outputSubtitle")}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {outputItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3.5"
                >
                  <CheckIcon />
                  <span className="text-sm font-medium text-neutral-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Real examples ────────────────────────────────────────────────── */}
        <section className="border-y border-neutral-100 bg-neutral-50 px-6 py-24">
          <div className="mx-auto max-w-5xl space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-neutral-900">
                {t("examplesTitle")}
              </h2>
              <p className="text-neutral-500">{t("examplesSubtitle")}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { platform: "Lovable", logo: "/logos/lovable.svg", img: "/examples/lovable.png", url: "https://id-preview--2118436b-021d-4d75-bbdd-04253c8bebe5.lovable.app/", time: "7–10" },
                { platform: "v0",      logo: "/logos/v0.svg",      img: "/examples/v0.png",      url: "https://v0-portfolio-website-build-black-mu.vercel.app/",               time: "6–8"  },
                { platform: "Bolt",    logo: "/logos/bolt.svg",    img: "/examples/bolt.png",    url: "https://artagers-grigoryan-v-ficr.bolt.host/",                          time: "5–7"  },
              ].map((ex) => (
                <a
                  key={ex.platform}
                  href={ex.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="overflow-hidden border-b border-neutral-100">
                    <img
                      src={ex.img}
                      alt={`${ex.platform} example`}
                      className="w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      style={{ height: "220px" }}
                    />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={ex.logo} alt="" className="h-4 w-4 rounded-sm object-contain" />
                      <span className="text-sm font-semibold text-neutral-700">{ex.platform}</span>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
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

        {/* ── Final CTA ────────────────────────────────────────────────────── */}
        <section className="bg-black px-6 py-24 text-center">
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

      <footer className="border-t border-neutral-100 bg-white px-6 py-10">
        <div className="mx-auto max-w-5xl flex flex-col items-center gap-6">
          <p className="text-xs text-neutral-400">{t("footer")}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <a
              href="https://t.me/artagers"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              {/* Telegram */}
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span className="font-medium">@artagers</span>
            </a>
            <span className="text-neutral-200 select-none">·</span>
            <a
              href="https://www.instagram.com/artagers.grigoryan/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              {/* Instagram */}
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
              <span className="font-medium">@artagers.grigoryan</span>
            </a>
            <span className="text-neutral-200 select-none">·</span>
            <a
              href="https://www.linkedin.com/in/artagers-grigoryan/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              {/* LinkedIn */}
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="font-medium">Artagers Grigoryan</span>
            </a>
            <span className="text-neutral-200 select-none">·</span>
            <a
              href="mailto:artagersgrigoryan@gmail.com"
              className="flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              {/* Email */}
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-10 7L2 7"/>
              </svg>
              <span className="font-medium">artagersgrigoryan@gmail.com</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
