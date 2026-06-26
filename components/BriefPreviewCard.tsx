"use client";

import { useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

export default function BriefPreviewCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const smoothX = useSpring(rawX, { stiffness: 280, damping: 28 });
  const smoothY = useSpring(rawY, { stiffness: 280, damping: 28 });

  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  // Glare position in percentage
  const glareX = useTransform(smoothX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(smoothY, [-0.5, 0.5], [0, 100]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.13) 0%, transparent 60%)`;

  // Scroll-driven parallax: text drifts upward as card scrolls out of view
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      rawX.set((e.clientX - rect.left) / rect.width - 0.5);
      rawY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [rawX, rawY]
  );

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <div
      className="animate-hero-in mx-auto mt-16 max-w-4xl"
      style={{ animationDelay: "500ms", perspective: "1200px" }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{
          scale: 1.025,
          boxShadow:
            "0 32px 72px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
        whileTap={{ scale: 0.975 }}
        initial={{
          boxShadow: "0 20px 40px rgba(0,0,0,0.10)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left dark:border-neutral-800 dark:bg-neutral-900"
      >
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
          <motion.div style={{ y: textY }}>
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
          </motion.div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent" />
        </div>

        {/* Cursor-following glare overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: glareBackground }}
        />
      </motion.div>
    </div>
  );
}
