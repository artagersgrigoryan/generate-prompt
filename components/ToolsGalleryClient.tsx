"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getToolIcon } from "@/lib/toolIcons";
import { Link } from "@/i18n/routing";
import type { ToolPublicConfig } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

const TOOLS_PER_PAGE = 6;

type ToolVisual = {
  blob1: string;
  blob2: string;
  stroke: string;
  glow: string;
  glowHover: string;
};

const TOOL_VISUALS: Record<string, ToolVisual> = {
  "website-prompt-generator":          { blob1: "#2563eb", blob2: "#4f46e5", stroke: "rgba(96,165,250,0.28)",   glow: "0 0 18px 0 rgba(59,130,246,0.18)",  glowHover: "0 0 32px 4px rgba(96,165,250,0.38)"   },
  "cover-letter-generator":            { blob1: "#7c3aed", blob2: "#0d9488", stroke: "rgba(167,139,250,0.28)",  glow: "0 0 18px 0 rgba(124,58,237,0.18)",  glowHover: "0 0 32px 4px rgba(167,139,250,0.38)"  },
  "linkedin-summary-generator":        { blob1: "#0077b5", blob2: "#00a0dc", stroke: "rgba(0,168,224,0.28)",    glow: "0 0 18px 0 rgba(0,119,181,0.18)",   glowHover: "0 0 32px 4px rgba(0,168,224,0.38)"    },
  "resume-bullet-point-generator":     { blob1: "#16a34a", blob2: "#15803d", stroke: "rgba(74,222,128,0.28)",   glow: "0 0 18px 0 rgba(22,163,74,0.18)",   glowHover: "0 0 32px 4px rgba(74,222,128,0.38)"   },
  "elevator-pitch-generator":          { blob1: "#f59e0b", blob2: "#d97706", stroke: "rgba(251,191,36,0.28)",   glow: "0 0 18px 0 rgba(245,158,11,0.18)",  glowHover: "0 0 32px 4px rgba(251,191,36,0.38)"   },
  "thank-you-email-generator":         { blob1: "#ec4899", blob2: "#db2777", stroke: "rgba(249,168,212,0.28)",  glow: "0 0 18px 0 rgba(236,72,153,0.18)",  glowHover: "0 0 32px 4px rgba(249,168,212,0.38)"  },
  "personal-bio-generator":            { blob1: "#0891b2", blob2: "#0e7490", stroke: "rgba(34,211,238,0.28)",   glow: "0 0 18px 0 rgba(8,145,178,0.18)",   glowHover: "0 0 32px 4px rgba(34,211,238,0.38)"   },
  "resignation-letter-generator":      { blob1: "#dc2626", blob2: "#b91c1c", stroke: "rgba(252,165,165,0.28)",  glow: "0 0 18px 0 rgba(220,38,38,0.18)",   glowHover: "0 0 32px 4px rgba(252,165,165,0.38)"  },
  "linkedin-recommendation-generator": { blob1: "#7c3aed", blob2: "#6d28d9", stroke: "rgba(196,181,253,0.28)",  glow: "0 0 18px 0 rgba(124,58,237,0.18)",  glowHover: "0 0 32px 4px rgba(196,181,253,0.38)"  },
  "email-subject-line-generator":      { blob1: "#ea580c", blob2: "#c2410c", stroke: "rgba(253,186,116,0.28)",  glow: "0 0 18px 0 rgba(234,88,12,0.18)",   glowHover: "0 0 32px 4px rgba(253,186,116,0.38)"  },
  "cold-outreach-email-generator":     { blob1: "#2563eb", blob2: "#1d4ed8", stroke: "rgba(147,197,253,0.28)",  glow: "0 0 18px 0 rgba(37,99,235,0.18)",   glowHover: "0 0 32px 4px rgba(147,197,253,0.38)"  },
  "social-bio-generator":              { blob1: "#9333ea", blob2: "#7e22ce", stroke: "rgba(216,180,254,0.28)",  glow: "0 0 18px 0 rgba(147,51,234,0.18)",  glowHover: "0 0 32px 4px rgba(216,180,254,0.38)"  },
};

const FALLBACK_VISUALS: ToolVisual = {
  blob1: "#6366f1", blob2: "#8b5cf6",
  stroke: "rgba(129,140,248,0.28)", glow: "0 0 18px 0 rgba(99,102,241,0.18)", glowHover: "0 0 32px 4px rgba(129,140,248,0.38)",
};

function ToolCard({ tool, openLabel }: { tool: ToolPublicConfig; openLabel: string }) {
  const v = TOOL_VISUALS[tool.slug] ?? FALLBACK_VISUALS;
  const Icon = getToolIcon(tool.slug);
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="tool-card group relative flex min-h-56 flex-col overflow-hidden rounded-3xl p-5"
      style={{
        background: "#111113",
        border: `1px solid ${v.stroke}`,
        boxShadow: v.glow,
        ["--card-glow-hover" as string]: v.glowHover,
      }}
    >
      <div aria-hidden="true" className="tool-blob-1 absolute opacity-40 group-hover:opacity-[0.72]"
        style={{ bottom: "-30%", left: "-10%", width: "70%", aspectRatio: "1", background: v.blob1, borderRadius: "50%", filter: "blur(60px)" }} />
      <div aria-hidden="true" className="tool-blob-2 absolute opacity-35 group-hover:opacity-[0.65]"
        style={{ bottom: "-20%", right: "-10%", width: "60%", aspectRatio: "1", background: v.blob2, borderRadius: "50%", filter: "blur(55px)" }} />
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
          <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
        </div>
        <h3 className="mt-4 text-base font-bold leading-snug text-white">{tool.name}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-white/50">{tool.description}</p>
        <span className="mt-4 flex items-center gap-1 text-xs font-medium text-white/70 transition-colors group-hover:text-white">
          {openLabel}<span className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </Link>
  );
}

function MobileCarousel({ tools, openLabel }: { tools: ToolPublicConfig[]; openLabel: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inViewRef = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const isDragging = useRef(false);

  // Clone first card at end — scroll to it looks seamless, then reset to real first card instantly
  const carouselItems = [...tools, tools[0]];

  const scrollTo = (i: number, instant = false) => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement;
    if (child) el.scrollTo({ left: child.offsetLeft, behavior: instant ? "instant" : "smooth" });
  };

  const pauseAutoScroll = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startAutoScroll = () => {
    pauseAutoScroll();
    if (!inViewRef.current) return;
    timerRef.current = setInterval(() => {
      if (activeRef.current === tools.length - 1) {
        // Smooth scroll to clone of first card, then instantly reset to real position 0
        scrollTo(tools.length);
        setTimeout(() => { scrollTo(0, true); activeRef.current = 0; setActive(0); }, 380);
      } else {
        scrollTo(activeRef.current + 1);
      }
    }, 3000);
  };

  // Track which card is visible; normalize clone index → 0
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = Array.from(el.children).indexOf(e.target as HTMLElement);
          if (i < 0) return;
          const normalized = i % tools.length;
          setActive(normalized);
          activeRef.current = normalized;
        });
      },
      { root: el, threshold: 0.6 }
    );
    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [tools.length]);

  // When user manually swipes to the clone, reset to real first card
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScrollEnd = () => {
      const clone = el.children[tools.length] as HTMLElement;
      if (clone && Math.abs(el.scrollLeft - clone.offsetLeft) < 5) {
        el.scrollTo({ left: 0, behavior: "instant" });
        activeRef.current = 0;
        setActive(0);
      }
    };
    el.addEventListener("scrollend", onScrollEnd);
    return () => el.removeEventListener("scrollend", onScrollEnd);
  }, [tools.length]);

  // Pause/resume based on section visibility in the viewport
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) startAutoScroll();
        else pauseAutoScroll();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); pauseAutoScroll(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mouse drag
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragScrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    scrollRef.current?.setPointerCapture(e.pointerId);
    pauseAutoScroll();
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    scrollRef.current.scrollLeft = dragScrollLeft.current + (dragStartX.current - e.clientX);
  };
  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    startAutoScroll();
  };

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory overflow-x-auto gap-3 cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={pauseAutoScroll}
        onTouchEnd={startAutoScroll}
      >
        {carouselItems.map((tool, i) => (
          <div key={`${tool.slug}-${i}`} className="w-full shrink-0 snap-start">
            <ToolCard tool={tool} openLabel={openLabel} />
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-center gap-1.5">
        {tools.map((_, i) => (
          <button
            key={i}
            onClick={() => { scrollTo(i); startAutoScroll(); }}
            aria-label={`Go to tool ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              i === active
                ? "w-5 bg-neutral-900 dark:bg-neutral-100"
                : "w-1.5 bg-neutral-300 hover:bg-neutral-500 dark:bg-neutral-600 dark:hover:bg-neutral-400"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function ToolsGalleryClient({ tools, openLabel }: { tools: ToolPublicConfig[]; openLabel: string }) {
  const totalPages = Math.ceil(tools.length / TOOLS_PER_PAGE);
  const [page, setPage] = React.useState(0);
  const [direction, setDirection] = React.useState(1);

  const paginate = (next: number) => {
    setDirection(next > page ? 1 : -1);
    setPage(next);
  };

  const pageTools = tools.slice(page * TOOLS_PER_PAGE, (page + 1) * TOOLS_PER_PAGE);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div>
      {/* Mobile: swipe carousel */}
      <div className="sm:hidden">
        <MobileCarousel tools={tools} openLabel={openLabel} />
      </div>

      {/* Desktop: paginated grid */}
      <div className="hidden sm:block">
      <div className="relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {pageTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} openLabel={openLabel} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => paginate(page - 1)}
            disabled={page === 0}
            aria-label="Previous page"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
              page === 0
                ? "cursor-not-allowed border-neutral-200 text-neutral-300 dark:border-neutral-700 dark:text-neutral-600"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => paginate(i)}
                aria-label={`Page ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-200",
                  i === page
                    ? "w-6 bg-neutral-900 dark:bg-neutral-100"
                    : "w-2 bg-neutral-300 hover:bg-neutral-500 dark:bg-neutral-600 dark:hover:bg-neutral-400"
                )}
              />
            ))}
          </div>

          <button
            onClick={() => paginate(page + 1)}
            disabled={page === totalPages - 1}
            aria-label="Next page"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
              page === totalPages - 1
                ? "cursor-not-allowed border-neutral-200 text-neutral-300 dark:border-neutral-700 dark:text-neutral-600"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
