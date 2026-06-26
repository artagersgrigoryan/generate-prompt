import type { Question } from "@/lib/questions";
import type { ToolConfig, ToolSection, SeoContent } from "./types";
import { WEBSITE_PROMPT_GENERATOR_SLUG } from "./slugs";

// Ordered sections. `name` matches Question.section; `key` is the i18n key
// under the `sections` namespace in messages/*.json.
const sections: ToolSection[] = [
  { name: "Basics", key: "basics" },
  { name: "Audience & Brand", key: "audience" },
  { name: "Content & Pages", key: "content" },
  { name: "Features & Tech", key: "tech" },
];

const questions: Question[] = [
  // Section 1 — Basics
  {
    id: 1,
    section: "Basics",
    label: "Tell us about your business",
    type: "fields",
    required: true,
    hint: "Your contact details will appear directly in your website — the AI uses them to populate the contact section with real information instead of placeholders.",
    fields: [
      { key: "name",     label: "Business / project name", placeholder: "e.g. Acme Studio", required: true },
      { key: "tagline",  label: "Tagline or slogan",        placeholder: "e.g. Design that works harder", required: false },
      { key: "email",    label: "Contact email",            placeholder: "e.g. hello@acme.com", required: false },
      { key: "phone",    label: "Phone number",             placeholder: "e.g. +1 555 010 0101", required: false },
      { key: "location", label: "City / location",          placeholder: "e.g. San Francisco, CA", required: false },
    ],
  },
  {
    id: 2,
    section: "Basics",
    label: "What type of website do you need?",
    type: "single",
    required: true,
    options: [
      "Business/Company",
      "Portfolio/Personal",
      "E-commerce shop",
      "Blog/Magazine",
      "SaaS/Product landing",
      "Booking/Appointments",
      "Restaurant/Food",
      "Nonprofit/Community",
      "Event/Conference",
      "Other",
      "Write it myself",
    ],
  },
  {
    id: 3,
    section: "Basics",
    label: "What is your industry and niche?",
    type: "text",
    required: true,
    placeholder:
      "e.g. sustainable fashion brand, B2B SaaS for accountants, local Italian restaurant...",
  },
  {
    id: 4,
    section: "Basics",
    label: "What is the primary goal of your website?",
    type: "single",
    required: true,
    options: [
      "Generate leads/inquiries",
      "Sell products online",
      "Showcase work/portfolio",
      "Build brand awareness",
      "Get bookings/appointments",
      "Drive newsletter signups",
      "Provide information",
      "Build a community",
      "Write it myself",
    ],
  },
  // Section 2 — Audience & Brand
  {
    id: 5,
    section: "Audience & Brand",
    label: "Who is your target audience?",
    type: "text",
    required: true,
    placeholder:
      "e.g. female entrepreneurs aged 28–45, small business owners who are not tech-savvy, Gen Z gamers...",
  },
  {
    id: 6,
    section: "Audience & Brand",
    label: "What visual style fits your brand?",
    type: "single",
    required: true,
    showStylePreviews: true,
    options: [
      "Minimal & clean",
      "Bold & modern",
      "Warm & friendly",
      "Elegant & luxury",
      "Playful & colorful",
      "Dark & dramatic",
      "Corporate & trustworthy",
      "Retro/Vintage",
      "Editorial/Magazine",
      "Futuristic/Tech",
      "Write it myself",
    ],
  },
  {
    id: 7,
    section: "Audience & Brand",
    label: "What tone of voice should the website use?",
    type: "single",
    required: true,
    options: [
      "Professional & formal",
      "Friendly & conversational",
      "Inspiring & motivational",
      "Witty & playful",
      "Calm & reassuring",
      "Direct & confident",
      "Empathetic & caring",
      "Educational & informative",
      "Write it myself",
    ],
  },
  {
    id: 8,
    section: "Audience & Brand",
    label: "Do you have brand colors?",
    type: "text",
    required: false,
    showColorPalettes: true,
    placeholder:
      "e.g. #1A1A2E and warm gold — or 'deep navy, cream, and terracotta'",
  },
  // Section 3 — Content & Pages
  {
    id: 9,
    section: "Content & Pages",
    label: "Which pages do you need?",
    type: "multi",
    required: true,
    options: [
      "Home/Hero",
      "About us",
      "Services/Features",
      "Portfolio/Work",
      "Pricing",
      "Blog/News",
      "Contact form",
      "Testimonials/Reviews",
      "FAQ",
      "Team",
      "Case studies",
      "Map/Location",
      "Newsletter signup",
      "Partners/Clients",
      "Write it myself",
    ],
  },
  {
    id: 10,
    section: "Content & Pages",
    label: "What is the status of your content?",
    type: "single",
    required: true,
    options: [
      "I have all text and images ready",
      "I have text but need image guidance",
      "I need placeholder text and image suggestions",
      "I need the AI to write all copy too",
      "Write it myself",
    ],
    contentAlertOptions: [
      "I have all text and images ready",
      "I have text but need image guidance",
    ],
  },
  // Section 4 — Features & Tech
  {
    id: 11,
    section: "Features & Tech",
    label: "Any special features or functionality?",
    type: "text",
    required: false,
    placeholder:
      "e.g. booking calendar, user login, live chat, product filters, payment checkout, map, multi-language...",
  },
  {
    id: 12,
    section: "Features & Tech",
    label: "Where will you build or host your website?",
    type: "single",
    required: true,
    hint: "Not sure? Pick the first option — the AI will choose the best fit. If you're using an AI coding tool (Bolt, v0, Lovable, Cursor), choose React/Next.js or Plain HTML.",
    options: [
      "Not sure — AI picks the best fit",
      "React / Next.js — for Bolt, v0, Lovable, Cursor",
      "Plain HTML + CSS — simple, works everywhere",
      "Framer — has built-in AI generation",
      "Vue.js — JavaScript framework",
      "Other",
      "Write it myself",
    ],
  },
  {
    id: 13,
    section: "Features & Tech",
    label: "Any references, inspiration, or extra context?",
    type: "text",
    required: false,
    placeholder:
      "e.g. I love stripe.com for its clarity. Budget ~$3k, need it live in 6 weeks.",
  },
];

const systemPrompt = `You are an expert web designer and senior developer writing a briefing document for an AI coding tool or developer. Based on the client answers, write a single cohesive prompt starting with "Build a website for..." that a developer can act on immediately without asking a single follow-up question.

Cover every section below in this exact order, written as flowing professional prose — no bullet points, no markdown headers, no numbered lists:

1. Project identity — what the website is, who it serves, what makes it unique, and the core value it delivers to visitors.

2. Design direction — visual style, color palette with specific hex values when provided, typography mood (e.g. geometric sans for modernity, editorial serif for authority), spacing feel (tight and dense vs open and airy), and the overall aesthetic the UI should evoke.

3. Tone and copy — the voice of the website, how headlines should feel, how CTAs should be phrased, the emotional register of all writing across the site.

4. Pages and content — each required page with a clear description of its purpose, the key sections or content blocks it must contain, and the hierarchy of information within it.

5. Features and functionality — every interactive element, form, animation, third-party integration, and special behaviour the site needs, described precisely enough to implement without guessing.

6. Code quality and architecture — specify the component breakdown and naming conventions, semantic HTML requirements, accessibility standards to meet (ARIA roles, keyboard navigation, focus management, colour contrast), performance practices to follow (lazy loading images, minimal JavaScript, code splitting if applicable), error states and loading states that must be handled, and any patterns or shortcuts to avoid.

7. Tech stack — the recommended platform or framework and the clear reasoning behind the choice given this project's scale, content, and functionality needs.

8. Content handling — state exactly what content is ready to use, what should use realistic placeholder text that matches the brand, and what copy the developer or AI should write from scratch guided by the tone described above. If the client has indicated they have existing copy or images ready, explicitly instruct the developer to look for that content attached directly after this prompt and to use it as the primary source — it overrides any placeholder or AI-written copy for those sections.

Make the brief precise, inspiring, and complete. Every decision should feel intentional.

Always write the brief in English, even if some of the client's answers are in a different language.`;

const seoContent: SeoContent = {
  tagline: "Generate a complete AI brief for your website — ready to paste into Bolt, Cursor, v0, Lovable, and more.",
  benefits: [
    { icon: "clock", title: "Save hours of planning", description: "Turn vague ideas into a structured brief in under 5 minutes, not hours." },
    { icon: "zap", title: "AI-platform ready", description: "Output is specifically optimised for Bolt, Cursor, v0, Lovable, and other AI coding tools." },
    { icon: "target", title: "Structured and precise", description: "Covers design, copy, pages, tech stack, and features — nothing left to guessing." },
    { icon: "copy", title: "One click to copy", description: "Copy your entire brief and paste it directly into any AI coding tool or send it to a developer." },
  ],
  howItWorks: [
    { title: "Answer 13 focused questions", description: "Tell us about your project, audience, visual style, pages, and tech stack. Takes under 5 minutes." },
    { title: "Claude structures your answers", description: "Our AI turns your answers into a complete, professional website brief with precise design and technical direction." },
    { title: "Paste into your AI builder", description: "Copy the result and paste it straight into Bolt, Cursor, v0, Lovable, or hand it to a developer." },
  ],
  useCases: [
    { title: "SaaS founders", description: "Generate a complete brief for your landing page or product site without needing a designer or product manager." },
    { title: "Freelance designers", description: "Use the brief as a client intake replacement — get all the information you need in one structured document." },
    { title: "Non-technical builders", description: "Describe your vision in plain English and get a brief a developer or AI tool can act on immediately." },
    { title: "Agencies", description: "Speed up the discovery phase and onboard clients faster with a standardised briefing process." },
  ],
  faqs: [
    { question: "What is a website prompt?", answer: "A website prompt is a detailed written brief that describes your website's purpose, design direction, content structure, and technical requirements. When fed into an AI coding tool like Bolt or Cursor, it guides the AI to generate a website that matches your vision — instead of producing something generic." },
    { question: "Which AI tools does this work with?", answer: "The output is optimised for Bolt.new, Cursor, v0.dev, Lovable, and Framer AI. It also works well as a brief for human developers or freelancers." },
    { question: "How long does it take?", answer: "Most users complete all 13 questions in under 5 minutes. The AI generates your brief in seconds." },
    { question: "Can I customise the output?", answer: "Yes. Copy the result and edit it directly before pasting into your AI tool. The generated text is plain English — easy to modify." },
    { question: "Is it free?", answer: "You can generate up to 3 briefs without signing in. After that, creating a free account gives you 20 generations per hour." },
    { question: "Can I save my answers for next time?", answer: "Yes. Sign in and your answers are saved to your profile so you don't need to re-enter your business details on your next visit." },
  ],
};

export const websitePromptGenerator: ToolConfig = {
  slug: WEBSITE_PROMPT_GENERATOR_SLUG,
  name: "Website Prompt Generator",
  description:
    "Answer a few questions and get a complete AI brief for your website — ready to paste into Bolt, Cursor, v0, Lovable, and more.",
  sections,
  questions,
  systemPrompt,
  maxOutputTokens: 4096,
  existingContentOptions: [
    "I have all text and images ready",
    "I have text but need image guidance",
  ],
  seoContent,
};
