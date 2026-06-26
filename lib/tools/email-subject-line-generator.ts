import type { ToolConfig, SeoContent } from "./types";
import { EMAIL_SUBJECT_LINE_GENERATOR_SLUG } from "./slugs";

const seoContent: SeoContent = {
  tagline: "Generate 7 subject line variations with psychological hooks that maximise open rates.",
  benefits: [
    { icon: "target", title: "7 variations per run", description: "Get multiple subject lines using different angles — curiosity, urgency, personalisation, and more." },
    { icon: "sparkles", title: "Psychology-backed hooks", description: "Each variation uses a different cognitive trigger: curiosity, social proof, urgency, or specificity." },
    { icon: "zap", title: "Under 1 minute", description: "Describe your email and get subject lines instantly. No copywriting experience needed." },
    { icon: "copy", title: "Works for any email type", description: "Cold outreach, newsletters, product launches, follow-ups, job applications — all covered." },
  ],
  howItWorks: [
    { title: "Describe your email", description: "What type of email it is, who's receiving it, and what you want them to do after opening it." },
    { title: "Share your key offer or hook", description: "The main benefit, offer, or news you want the subject line to communicate." },
    { title: "Get 7 subject line options", description: "Each variation uses a different psychological angle so you can test which resonates best with your audience." },
  ],
  useCases: [
    { title: "Cold outreach campaigns", description: "Stop your email being ignored with a subject line that earns a first click." },
    { title: "Newsletter senders", description: "Improve open rates week after week by testing different subject line styles and hooks." },
    { title: "Product marketers", description: "Announce launches, promotions, and updates in a way that compels action." },
    { title: "Job applicants", description: "Stand out in a recruiter's inbox with a subject line that gets your application opened." },
  ],
  faqs: [
    { question: "What makes a great email subject line?", answer: "Specificity, curiosity, and relevance. The best subject lines make the reader feel the email is written for them specifically and create just enough intrigue to click." },
    { question: "How long should a subject line be?", answer: "40–60 characters is the sweet spot for most email clients. Mobile previews cut off longer lines, so front-load the most important words." },
    { question: "Should I use emojis in subject lines?", answer: "Emojis can boost open rates in B2C and newsletter contexts. For cold outreach or B2B, plain text often performs better because it looks more personal and less like a broadcast." },
    { question: "What's the best way to test subject lines?", answer: "A/B test — send each variation to a smaller segment of your list first, then send the winner to the rest. Most email platforms have this built in." },
    { question: "Can I use these for cold email sequences?", answer: "Yes. Generate subject lines for your initial email and use the tool again to write follow-up subject lines with a different angle." },
  ],
};

export const emailSubjectLineGenerator: ToolConfig = {
  slug: EMAIL_SUBJECT_LINE_GENERATOR_SLUG,
  name: "Email Subject Line Generator",
  description: "Generate 7 subject line variations with psychological hooks to maximize open rates.",
  resultMode: "prompt",
  profileQuestionIds: [],
  maxOutputTokens: 1024,

  sections: [
    { name: "Your Email", key: "yourEmail" },
    { name: "Tone & Style", key: "toneAndStyle" },
  ],

  questions: [
    {
      id: 1,
      section: "Your Email",
      label: "Email purpose",
      type: "single",
      required: true,
      options: ["Cold outreach", "Newsletter", "Product announcement", "Follow-up", "Job application", "Write it myself"],
    },
    {
      id: 2,
      section: "Your Email",
      label: "Target audience — who is receiving this?",
      type: "text",
      required: true,
      rows: 1,
      placeholder: "e.g. Mid-market HR directors at tech companies",
    },
    {
      id: 3,
      section: "Your Email",
      label: "Main message or key offer in one sentence",
      type: "text",
      required: true,
      rows: 2,
      placeholder: "e.g. We help HR teams cut time-to-hire by 30% with AI screening.",
    },
    {
      id: 4,
      section: "Tone & Style",
      label: "Desired tone",
      type: "single",
      required: true,
      options: ["Urgent", "Curious", "Friendly", "Professional", "Write it myself"],
    },
    {
      id: 5,
      section: "Tone & Style",
      label: "Any keyword or phrase to include — optional",
      type: "text",
      required: false,
      rows: 1,
      placeholder: "e.g. AI hiring, Q3 planning",
    },
  ],

  systemPrompt: "",
  seoContent,
};
