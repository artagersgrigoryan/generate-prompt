"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Sample = {
  tool: string;
  color: string;
  text: string;
};

const SAMPLES: Sample[] = [
  {
    tool: "LinkedIn Summary",
    color: "#0077b5",
    text: `Results-driven product designer with 6 years building SaaS tools at the intersection of design systems and developer experience. Currently leading design at a Series B startup where I've reduced onboarding friction by 40% and rebuilt the component library from scratch.

Core strengths: interaction design, user research, cross-functional collaboration, Figma systems.`,
  },
  {
    tool: "Cover Letter",
    color: "#7c3aed",
    text: `I'm excited to apply for the Senior Product Manager role at Notion. Over the past four years at Figma, I've shipped features used by millions of teams — most recently leading the Dev Mode launch, which became the fastest-adopted feature in company history.

What draws me to Notion is the challenge of building tools that shape how people think, not just how they work.`,
  },
  {
    tool: "Cold Outreach Email",
    color: "#2563eb",
    text: `Subject: Quick question about your onboarding flow

Hi Sarah,

I noticed Coframe recently started A/B testing your signup flow — your experiment with social proof in the first step caught my attention. I've been working on similar problems at Amplitude.

Would you be open to a 20-minute call? I have a few ideas that might be relevant to what you're testing.`,
  },
  {
    tool: "Website Brief",
    color: "#16a34a",
    text: `# Brew & Grounds — Website Brief

**Client**    Brew & Grounds Café, Portland OR
**Goal**      Online presence + online ordering
**Audience**  Coffee enthusiasts aged 25–42

## Visual Direction
Warm-modern editorial. Generous white space,
earth-toned accents, high-contrast typography.

## Pages
1. Home — hero story + featured drinks
2. Menu — filterable by category
3. About — origin + team profiles
4. Order — integrated third-party widget`,
  },
];

const INTERVAL = 4000;
const FADE_DURATION = 400;

export default function OutputTicker() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActive((i) => (i + 1) % SAMPLES.length);
        setVisible(true);
      }, FADE_DURATION);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const sample = SAMPLES[active];

  return (
    <div className="animate-hero-in mx-auto mt-14 max-w-3xl" style={{ animationDelay: "500ms" }}>
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">

        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-950">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white transition-opacity duration-300",
              visible ? "opacity-100" : "opacity-0"
            )}
            style={{ backgroundColor: sample.color }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/80" />
            {sample.tool}
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:border-green-900 dark:bg-green-950/60 dark:text-green-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            Ready to use
          </span>
        </div>

        {/* Content */}
        <div className="relative h-52 overflow-hidden p-6">
          <pre
            className={cn(
              "min-w-0 select-none whitespace-pre-wrap font-mono text-[0.8rem] leading-[1.75] text-neutral-600 transition-opacity dark:text-neutral-400",
              visible ? "opacity-100" : "opacity-0"
            )}
            style={{ transitionDuration: `${FADE_DURATION}ms` }}
          >
            {sample.text}
          </pre>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent" />
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pb-4">
          {SAMPLES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setVisible(false); setTimeout(() => { setActive(i); setVisible(true); }, FADE_DURATION); }}
              aria-label={`Show ${SAMPLES[i].tool} sample`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active
                  ? "w-5 bg-neutral-900 dark:bg-neutral-100"
                  : "w-1.5 bg-neutral-300 hover:bg-neutral-500 dark:bg-neutral-600 dark:hover:bg-neutral-400"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
