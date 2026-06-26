import type { ToolConfig, SeoContent } from "./types";
import { ELEVATOR_PITCH_GENERATOR_SLUG } from "./slugs";

const seoContent: SeoContent = {
  tagline: "Craft a memorable 30- and 60-second elevator pitch for networking events, interviews, and investor meetings.",
  benefits: [
    { icon: "clock", title: "Two lengths, one tool", description: "Get both a 30-second and 60-second version — use whichever the situation calls for." },
    { icon: "users", title: "Situation-specific", description: "Tailor your pitch for networking events, interviews, investor meetings, or social introductions." },
    { icon: "pencil", title: "Sounds like you", description: "Choose your tone and the language stays natural — not corporate-speak or rehearsed-sounding." },
    { icon: "sparkles", title: "Built on your real story", description: "We use your actual background and achievement, not generic templates that could belong to anyone." },
  ],
  howItWorks: [
    { title: "Share who you are", description: "Your name, role, industry, and years of experience. Takes about a minute." },
    { title: "Describe your value and goal", description: "What you're known for, a key achievement, and what kind of connection or outcome you're looking for." },
    { title: "Get your pitches", description: "Claude writes two versions — 30 and 60 seconds — in your chosen tone, ready to practise and deliver." },
  ],
  useCases: [
    { title: "Job seekers at networking events", description: "Introduce yourself confidently and make a memorable first impression with hiring managers." },
    { title: "Founders pitching investors", description: "Lead with the problem, your solution, and why you're the right person to solve it — concisely." },
    { title: "Freelancers winning clients", description: "Explain what you do and who you help in a way that makes potential clients want to know more." },
    { title: "Professionals at conferences", description: "Have a polished response ready for 'so, what do you do?' in any professional setting." },
  ],
  faqs: [
    { question: "How long should an elevator pitch be?", answer: "30 seconds (about 75 words) works for casual introductions and meet-and-greets. 60 seconds (about 150 words) is better for interviews or investor pitches where you have the floor." },
    { question: "Should I memorise my elevator pitch?", answer: "Know it well enough to deliver it naturally, but not word-for-word — that sounds rehearsed. Aim for comfort with the structure so you can adapt it on the spot." },
    { question: "What's the biggest mistake in elevator pitches?", answer: "Starting with your job title instead of the value you deliver. 'I help SaaS companies reduce churn' is more compelling than 'I'm a customer success manager.'" },
    { question: "Can I use this for investor pitches?", answer: "Yes. Tell us you're targeting investors in the audience field and the output will emphasise your problem, traction, and why now." },
    { question: "What if I have multiple roles or businesses?", answer: "Focus on the most relevant one for your audience. You can run the tool again with a different context to get a version tailored to a different situation." },
  ],
};

export const elevatorPitchGenerator: ToolConfig = {
  slug: ELEVATOR_PITCH_GENERATOR_SLUG,
  name: "Elevator Pitch Generator",
  description: "Craft a compelling 30- and 60-second elevator pitch that gets you remembered.",
  resultMode: "letter",
  profileQuestionIds: [1, 2, 4],
  maxOutputTokens: 2048,

  sections: [
    { name: "About You", key: "aboutYou" },
    { name: "The Pitch", key: "thePitch" },
  ],

  questions: [
    {
      id: 1,
      section: "About You",
      label: "Your name + job title / role",
      type: "fields",
      required: true,
      fields: [
        { key: "name", label: "Your full name", placeholder: "e.g. Alex Johnson", required: true },
        { key: "role", label: "Job title / role", placeholder: "e.g. UX Designer & Freelancer", required: true },
      ],
    },
    {
      id: 2,
      section: "About You",
      label: "What you do / what problem you solve",
      type: "text",
      required: true,
      rows: 2,
      placeholder: "e.g. I help B2B SaaS companies reduce churn by redesigning their onboarding experience.",
    },
    {
      id: 3,
      section: "The Pitch",
      label: "Primary audience",
      type: "single",
      required: true,
      options: ["Recruiters", "Clients", "Investors", "Networking contacts", "Write it myself"],
    },
    {
      id: 4,
      section: "The Pitch",
      label: "Your unique value — what sets you apart",
      type: "text",
      required: true,
      rows: 2,
      placeholder: "e.g. I combine engineering depth with design thinking — I've shipped products end-to-end solo.",
    },
    {
      id: 5,
      section: "The Pitch",
      label: "Desired outcome",
      type: "single",
      required: true,
      options: ["Job interview", "Client meeting", "Investment conversation", "Collaboration", "Write it myself"],
    },
  ],

  systemPrompt: "",
  seoContent,
};
