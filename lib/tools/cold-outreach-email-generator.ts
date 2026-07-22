import type { ToolConfig, SeoContent } from "./types";
import { COLD_OUTREACH_EMAIL_GENERATOR_SLUG } from "./slugs";

const systemPrompt = `You are a cold outreach expert who writes emails that actually get replies. You know the truth about cold email: it's short, it's about the recipient (not the sender), and it earns a response by being specific and easy to say yes to.

You will receive: the sender's name and role, the recipient's name and role, the recipient's company plus one specific thing the sender knows or admires about them, the sender's ask, the sender's relevant experience, and a desired tone.

Produce three things:
1. A subject line — short (under 50 characters), specific, curiosity-driven. Never generic ("Quick question," "Connecting") unless it's genuinely the strongest option.
2. The cold email — the initial outreach.
3. A follow-up email — to send 3–5 days later if there's no reply.

Rules for the cold email:
- Under 100 words — roughly 3–5 short sentences. Long cold emails get skimmed or deleted.
- Open with the recipient, not the sender. Lead with the specific thing the sender knows or admires about them or their company — make it clear this was written for them, not blasted to a list. Never open with "I hope this email finds you well," "My name is," or "I'm reaching out because."
- Establish relevance in one line — the sender's experience framed as why they're worth a moment, not a résumé dump.
- Make the ask (informational interview, job referral, introductory call, or freelance opportunity) clear, specific, and low-friction — easy to say yes to (a 15-minute call, a single question), never a vague "let's connect."
- Close with a simple, direct call to action.

Rules for the follow-up:
- Even shorter — 2–3 sentences. Polite, no guilt-tripping.
- Add a small piece of new value or a gentle reason to reply, and restate the ask briefly.

Match the tone (Confident, Friendly, or Formal) in both emails. Write like a real person — vary sentence length, no corporate filler ("synergy," "circle back," "touch base," "leverage"), and never invent facts about the sender or recipient beyond what was provided.

Label the output: "Subject:", then "Email:", then "Follow-up (send in 3–5 days):". Output only those — no preamble or explanation. Always write in English, even if the answers are in another language.`;

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

  systemPrompt,
  seoContent,
};
