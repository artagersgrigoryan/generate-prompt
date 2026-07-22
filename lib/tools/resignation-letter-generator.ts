import type { ToolConfig, SeoContent } from "./types";
import { RESIGNATION_LETTER_GENERATOR_SLUG } from "./slugs";

const systemPrompt = `You are a career advisor who helps people resign gracefully and protect the relationships they've built. A resignation letter is a professional courtesy and a permanent record — it should be warm, clear, and impossible to hold against them, no matter why they're leaving.

You will receive: the employee's name, their manager's name, their job title, the company name, their last working day, an optional reason for leaving, and a desired tone.

Write a complete, ready-to-send resignation letter that, in a natural flow, includes:
- A direct opening that clearly states they are resigning from their position (use the exact job title) and their final working day (use the exact date provided).
- A brief expression of genuine gratitude — for the opportunity, growth, or a specific experience at the company.
- An offer to help ensure a smooth transition and hand off responsibilities during the notice period.
- A warm closing that wishes the team or company continued success, followed by a sign-off with the employee's name, addressed to the manager by name.

Handle the reason for leaving with discretion:
- If a reason is provided, reference it briefly and positively (e.g. "to pursue a new opportunity," "for personal reasons," "as I relocate") — one clause, never a detailed explanation or complaint.
- If the reason is "Prefer not to say" or none was given, do not mention a reason at all — simply state the resignation.

Match the tone:
- Formal: professional and measured, no contractions, respectful distance.
- Warm: sincere and personal, natural contractions, genuine appreciation that still reads as professional.
- Brief & simple: short and factual — role, last day, a brief thanks, a transition offer. Professional without forced warmth (ideal when the relationship is difficult).

Rules:
- Never criticise the company, the manager, or anyone else — this letter must burn no bridges under any circumstances.
- Never invent details (specific projects, dates, or reasons) beyond what was provided.
- Format it as a proper letter: greeting ("Dear [Manager],"), body, and sign-off.

Output only the letter — no preamble, no notes, no explanation. Always write in English, even if the answers are in another language.`;

const seoContent: SeoContent = {
  tagline: "Leave on the best possible terms with a graceful, professional resignation letter that protects relationships.",
  benefits: [
    { icon: "check", title: "Burns no bridges", description: "Trained to keep the tone professional and warm — regardless of the circumstances of your departure." },
    { icon: "clock", title: "Ready in minutes", description: "Answer 5 questions and have a complete letter ready to hand or email to your manager." },
    { icon: "pencil", title: "Customisable tone", description: "Choose from formal, warm, or brief — depending on your relationship with your employer." },
    { icon: "target", title: "Covers the essentials", description: "Last working day, transition willingness, and expressions of gratitude — all included, nothing awkward." },
  ],
  howItWorks: [
    { title: "Share the basics", description: "Your name, your manager's name, your role, and your last day of work." },
    { title: "Tell us your context", description: "Reason for leaving (optional), and your preferred tone — formal, warm, or brief." },
    { title: "Get your letter", description: "A complete, professional resignation letter that handles the conversation gracefully." },
  ],
  useCases: [
    { title: "Leaving for a new job", description: "Handle the resignation professionally without oversharing about your new opportunity." },
    { title: "Changing careers", description: "Frame your departure positively when moving to a completely different field or life chapter." },
    { title: "Leaving a difficult situation", description: "Protect your professional reputation even when leaving under difficult circumstances." },
    { title: "Retiring", description: "Acknowledge your career journey with warmth and leave a lasting positive impression on your way out." },
  ],
  faqs: [
    { question: "Do I need to say why I'm resigning?", answer: "No. You're not obligated to provide a reason. A simple 'I have decided to pursue a new opportunity' is professional and sufficient." },
    { question: "How much notice should I give?", answer: "Check your employment contract — two weeks is standard in most countries, but some roles require more. If in doubt, give as much notice as you're able to." },
    { question: "Should I email or hand-deliver my resignation?", answer: "Ideally, tell your manager in person first, then follow up with the written letter or email. This shows respect and avoids them feeling blindsided." },
    { question: "Should I mention a counter-offer in the letter?", answer: "No. The resignation letter is not the place for negotiation. If you're open to a counter-offer, discuss that in a conversation — not in writing." },
    { question: "What if my relationship with my manager is difficult?", answer: "Choose the 'brief and simple' tone — it's professional without being overly warm in a way that would feel insincere. Keep it factual: your role, your last day, and a wish for the team's success." },
  ],
};

export const resignationLetterGenerator: ToolConfig = {
  slug: RESIGNATION_LETTER_GENERATOR_SLUG,
  name: "Resignation Letter Generator",
  description: "Leave on the best possible terms with a graceful, professional resignation letter.",
  resultMode: "letter",
  profileQuestionIds: [1],
  maxOutputTokens: 2048,

  sections: [
    { name: "The Situation", key: "theSituation" },
    { name: "Your Letter", key: "yourLetter" },
  ],

  questions: [
    {
      id: 1,
      section: "The Situation",
      label: "Your name + manager's name",
      type: "fields",
      required: true,
      fields: [
        { key: "your_name", label: "Your full name", placeholder: "e.g. Alex Johnson", required: true },
        { key: "manager_name", label: "Manager's name", placeholder: "e.g. Sarah Chen", required: true },
      ],
    },
    {
      id: 2,
      section: "The Situation",
      label: "Your job title + company name",
      type: "fields",
      required: true,
      fields: [
        { key: "job_title", label: "Your job title", placeholder: "e.g. Senior Designer", required: true },
        { key: "company_name", label: "Company name", placeholder: "e.g. Acme Corp", required: true },
      ],
    },
    {
      id: 3,
      section: "The Situation",
      label: "Last working day",
      type: "text",
      required: true,
      rows: 1,
      placeholder: "e.g. July 31, 2026",
    },
    {
      id: 4,
      section: "Your Letter",
      label: "Reason for leaving — optional",
      type: "single",
      required: false,
      options: ["New opportunity", "Career change", "Personal reasons", "Relocation", "Prefer not to say"],
    },
    {
      id: 5,
      section: "Your Letter",
      label: "Tone",
      type: "single",
      required: true,
      options: ["Formal", "Warm", "Brief & simple", "Write it myself"],
    },
  ],

  systemPrompt,
  seoContent,
};
