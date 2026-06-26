"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

const SCROLL_KEY = "category-strip-scroll";

const SHORT_LABELS: Record<string, string> = {
  "cold-outreach-email-generator": "Cold Email",
  "cover-letter-generator": "Cover Letter",
  "elevator-pitch-generator": "Elevator Pitch",
  "email-subject-line-generator": "Subject Lines",
  "linkedin-recommendation-generator": "LinkedIn Rec",
  "linkedin-summary-generator": "LinkedIn Summary",
  "personal-bio-generator": "Personal Bio",
  "resignation-letter-generator": "Resignation Letter",
  "resume-bullet-point-generator": "Resume Bullets",
  "social-bio-generator": "Social Bio",
  "thank-you-email-generator": "Thank You Email",
  "website-prompt-generator": "Website Prompt",
  general: "General",
};

export function getCategoryShortLabel(category: string): string {
  return (
    SHORT_LABELS[category] ??
    category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

const activePill =
  "shrink-0 rounded-full border border-neutral-900 bg-neutral-900 px-3.5 py-1.5 text-sm font-medium text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900";
const inactivePill =
  "shrink-0 rounded-full border border-neutral-200 px-3.5 py-1.5 text-sm text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200";

interface CategoryStripProps {
  categories: string[];
  activeCategory?: string;
}

export function CategoryStrip({ categories, activeCategory }: CategoryStripProps) {
  const router = useRouter();
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore saved scroll position after navigation
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved && scrollRef.current) {
      scrollRef.current.scrollLeft = Number(saved);
    }
  }, []);

  function navigate(href: string) {
    if (scrollRef.current) {
      sessionStorage.setItem(SCROLL_KEY, String(scrollRef.current.scrollLeft));
    }
    router.push(`/${locale}${href}`, { scroll: false });
  }

  return (
    <div className="relative mt-6">
      {/* Fade on the right to signal scrollability */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white dark:from-neutral-950" />

      <div ref={scrollRef} className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => navigate("/blog")}
          className={cn(activeCategory === undefined ? activePill : inactivePill)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => navigate(`/blog/category/${cat}`)}
            className={cn(cat === activeCategory ? activePill : inactivePill)}
          >
            {getCategoryShortLabel(cat)}
          </button>
        ))}
        {/* trailing spacer so last pill clears the fade */}
        <span className="shrink-0 w-8" aria-hidden="true" />
      </div>
    </div>
  );
}
