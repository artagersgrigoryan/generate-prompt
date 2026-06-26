import type { ToolConfig, SeoContent } from "./types";
import { THANK_YOU_EMAIL_GENERATOR_SLUG } from "./slugs";

const seoContent: SeoContent = {
  tagline: "Send a genuine post-interview thank you email that keeps you memorable — without sounding like a template.",
  benefits: [
    { icon: "zap", title: "Done in 2 minutes", description: "Answer a few questions and get a ready-to-send email. No staring at a blank draft." },
    { icon: "target", title: "References the real conversation", description: "Include a specific moment from your interview to make the email feel authentic and personal." },
    { icon: "pencil", title: "Never sounds generic", description: "Trained to avoid the 'thank you for your time and consideration' clichés that hiring managers tune out." },
    { icon: "mail", title: "Works for any interviewer", description: "Generate separate personalised emails for each person you met — in one session." },
  ],
  howItWorks: [
    { title: "Tell us about your interview", description: "Who you spoke with, the role, the company, and one specific thing you discussed or that stood out." },
    { title: "Add your message goal", description: "Reinforce your interest, address something left unsaid, or simply leave a warm and positive impression." },
    { title: "Get your email", description: "Claude writes a genuine, professional thank you email that references the actual conversation." },
  ],
  useCases: [
    { title: "After a first-round interview", description: "Send within 24 hours to stand out from candidates who don't follow up at all." },
    { title: "After a panel interview", description: "Generate separate personalised emails for each interviewer referencing what you discussed with each one." },
    { title: "After a final-round interview", description: "Reinforce your fit for the role and express your excitement before the hiring decision is made." },
    { title: "After a networking coffee chat", description: "Keep the relationship warm with a thoughtful note that moves the conversation forward." },
  ],
  faqs: [
    { question: "Should I send a thank you email after every interview?", answer: "Yes. It's a small gesture that only helps — hiring managers notice, and it's a way to stand out when candidates are otherwise equal." },
    { question: "How soon should I send it?", answer: "Within 24 hours of your interview. Same-day is even better while the conversation is still fresh in everyone's minds." },
    { question: "What should I include?", answer: "Thank them for their time, reference one specific thing you discussed (this proves you were paying attention), and briefly reinforce why you're excited about the role." },
    { question: "Should I send separate emails to each interviewer?", answer: "Yes — and personalise each one. This tool helps you do that efficiently without starting from scratch each time." },
    { question: "What if I can't remember a specific detail from the interview?", answer: "Even referencing the general topic of a conversation ('we discussed the product roadmap') shows engagement. The tool will work with whatever detail you can recall." },
  ],
};

export const thankYouEmailGenerator: ToolConfig = {
  slug: THANK_YOU_EMAIL_GENERATOR_SLUG,
  name: "Thank You Email Generator",
  description: "Write a genuine post-interview thank you email that keeps you top of mind.",
  resultMode: "letter",
  profileQuestionIds: [1],
  maxOutputTokens: 2048,

  sections: [
    { name: "The Interview", key: "theInterview" },
    { name: "Your Message", key: "yourMessage" },
  ],

  questions: [
    {
      id: 1,
      section: "The Interview",
      label: "Your name + interviewer's name + their title",
      type: "fields",
      required: true,
      fields: [
        { key: "your_name", label: "Your full name", placeholder: "e.g. Alex Johnson", required: true },
        { key: "interviewer_name", label: "Interviewer's name", placeholder: "e.g. Sarah Chen", required: true },
        { key: "interviewer_title", label: "Interviewer's title", placeholder: "e.g. Head of Engineering", required: false },
      ],
    },
    {
      id: 2,
      section: "The Interview",
      label: "Role / position you interviewed for",
      type: "text",
      required: true,
      rows: 1,
      placeholder: "e.g. Senior Product Designer",
    },
    {
      id: 3,
      section: "The Interview",
      label: "Company name",
      type: "text",
      required: true,
      rows: 1,
      placeholder: "e.g. Acme Corp",
    },
    {
      id: 4,
      section: "Your Message",
      label: "One specific moment or topic from the interview to reference",
      type: "text",
      required: false,
      rows: 2,
      placeholder: "e.g. We talked about rebuilding the design system and I loved hearing about the component audit you did last year.",
    },
    {
      id: 5,
      section: "Your Message",
      label: "Tone",
      type: "single",
      required: true,
      options: ["Formal", "Warm", "Enthusiastic", "Write it myself"],
    },
  ],

  systemPrompt: "",
  seoContent,
};
