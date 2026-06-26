import type { ToolConfig, SeoContent } from "./types";
import { COLD_OUTREACH_EMAIL_GENERATOR_SLUG } from "./slugs";

const seoContent: SeoContent = {
  tagline: "Write a cold email that gets replies — plus a ready-to-send follow-up included.",
  benefits: [
    { icon: "mail", title: "Email + follow-up included", description: "Get the initial email and a follow-up message in one generation — no extra steps." },
    { icon: "target", title: "Personalised to the recipient", description: "Describe who you're emailing and the output is specific enough to feel handwritten." },
    { icon: "sparkles", title: "Hooks that earn replies", description: "Opening lines trained to avoid 'I hope this email finds you well' and other templates that get ignored." },
    { icon: "briefcase", title: "Any outreach context", description: "Sales, partnerships, job applications, networking, or freelance pitches — all covered." },
  ],
  howItWorks: [
    { title: "Describe yourself and your offer", description: "Who you are, what you do, and what you're reaching out about in clear, plain language." },
    { title: "Tell us about the recipient", description: "Who they are, their role, and one specific thing you know or admire about them or their company." },
    { title: "Get your email and follow-up", description: "A personalised cold email with a subject line, plus a follow-up ready to send if they don't reply." },
  ],
  useCases: [
    { title: "Sales prospecting", description: "Open conversations with potential clients without sounding like a mass email campaign." },
    { title: "Partnership outreach", description: "Reach out to potential collaborators or integration partners with a clear and compelling pitch." },
    { title: "Freelance pitching", description: "Approach potential clients directly with a specific, relevant offer that addresses their likely needs." },
    { title: "Career networking", description: "Reach out to people at companies you want to work for, or ask for advice from someone you admire." },
  ],
  faqs: [
    { question: "What's the best length for a cold email?", answer: "Short. 3–5 sentences or under 100 words performs best. Longer emails get skimmed or deleted." },
    { question: "How do I personalise cold emails efficiently?", answer: "Use this tool to write one strong template, then manually personalise the first sentence for each recipient — 1–2 minutes of personalisation dramatically increases reply rates." },
    { question: "How many follow-ups should I send?", answer: "One follow-up after 3–5 days is standard. A second after 7–10 more days is acceptable. After that, move on — persistence beyond three touches usually hurts more than it helps." },
    { question: "What's the biggest mistake in cold outreach?", answer: "Making it about you instead of them. The best cold emails open with something about the recipient's world, not your product or credentials." },
    { question: "Should I include an attachment in the first email?", answer: "No. Attachments in cold emails reduce deliverability and look spammy. Share a link if you need to send supporting material, and only after you've had a reply." },
  ],
};

export const coldOutreachEmailGenerator: ToolConfig = {
  slug: COLD_OUTREACH_EMAIL_GENERATOR_SLUG,
  name: "Cold Outreach Email Generator",
  description: "Write a cold email that gets replies — plus a ready-to-send follow-up.",
  resultMode: "letter",
  profileQuestionIds: [1],
  maxOutputTokens: 2048,

  sections: [
    { name: "The Context", key: "theContext" },
    { name: "The Ask", key: "theAsk" },
  ],

  questions: [
    {
      id: 1,
      section: "The Context",
      label: "Your name + your role / what you do",
      type: "fields",
      required: true,
      fields: [
        { key: "name", label: "Your full name", placeholder: "e.g. Alex Johnson", required: true },
        { key: "role", label: "Your role / what you do", placeholder: "e.g. Frontend Developer & Freelancer", required: true },
      ],
    },
    {
      id: 2,
      section: "The Context",
      label: "Recipient's name + their role",
      type: "fields",
      required: true,
      fields: [
        { key: "recipient_name", label: "Recipient's name", placeholder: "e.g. Sarah Chen", required: true },
        { key: "recipient_role", label: "Their role", placeholder: "e.g. CTO at Acme Corp", required: true },
      ],
    },
    {
      id: 3,
      section: "The Context",
      label: "Company name + one thing you know/admire about them",
      type: "text",
      required: true,
      rows: 2,
      placeholder: "e.g. Acme Corp — love how they rebuilt their onboarding to cut day-7 churn. Saw the case study last week.",
    },
    {
      id: 4,
      section: "The Ask",
      label: "Your ask",
      type: "single",
      required: true,
      options: ["Informational interview", "Job referral", "Introductory call", "Freelance opportunity", "Write it myself"],
    },
    {
      id: 5,
      section: "The Ask",
      label: "Your relevant experience in 1–2 sentences",
      type: "text",
      required: true,
      rows: 2,
      placeholder: "e.g. I've built React apps for 5 years and recently shipped a design system used by 200+ engineers.",
    },
    {
      id: 6,
      section: "The Ask",
      label: "Tone",
      type: "single",
      required: true,
      options: ["Confident", "Friendly", "Formal", "Write it myself"],
    },
  ],

  systemPrompt: "",
  seoContent,
};
