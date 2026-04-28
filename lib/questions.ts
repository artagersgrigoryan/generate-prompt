export type QuestionType = "single" | "multi" | "text" | "fields";

export interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export interface Question {
  id: number;
  section: string;
  label: string;
  type: QuestionType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  maxSelections?: number;
  fields?: FieldDef[];
  hint?: string;
  showColorPalettes?: boolean;
  showStylePreviews?: boolean;
  contentAlertOptions?: string[];
}

export const questions: Question[] = [
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
