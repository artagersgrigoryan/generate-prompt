import type { ToolConfig, SeoContent } from "./types";
import { LINKEDIN_SUMMARY_GENERATOR_SLUG } from "./slugs";

const seoContent: SeoContent = {
  tagline: "Create a compelling LinkedIn About section that gets recruiters to stop and read.",
  benefits: [
    { icon: "users", title: "Recruiter-tested structure", description: "Built around what hiring managers and recruiters actually look for in a LinkedIn About section." },
    { icon: "pencil", title: "6 focused questions", description: "Answer 6 questions in under 3 minutes. No blank page to stare at." },
    { icon: "sparkles", title: "Headline variations included", description: "Get multiple headline options alongside your About section to test what gets more profile views." },
    { icon: "target", title: "Saved to your profile", description: "Your background details are remembered so updating your profile later takes seconds." },
  ],
  howItWorks: [
    { title: "Describe your background", description: "Your name, current role, industry, and years of experience. Takes under 2 minutes." },
    { title: "Share your strengths and goals", description: "Tell us what you're great at and what kind of opportunities you're looking for." },
    { title: "Get your About section", description: "Claude writes a concise, compelling LinkedIn summary with headline variations — ready to copy and paste." },
  ],
  useCases: [
    { title: "Job seekers", description: "Stand out with a profile that opens more conversations with recruiters and hiring managers." },
    { title: "Freelancers and consultants", description: "Attract ideal clients by clearly communicating what you do and the results you deliver." },
    { title: "Executives building a presence", description: "Establish thought leadership with a narrative that goes beyond your job title." },
    { title: "New graduates", description: "Make the most of limited experience with a summary that highlights your potential and direction." },
  ],
  faqs: [
    { question: "How long should a LinkedIn About section be?", answer: "LinkedIn shows the first 3 lines before a 'see more' click, so your opening sentence must hook readers. The ideal length is 200–300 words — long enough to be substantive, short enough to keep attention." },
    { question: "Should I write in first or third person?", answer: "First person (I) is standard for LinkedIn. Third person can work for executives building authority, but first person feels more approachable for most profiles." },
    { question: "Will it sound like AI wrote it?", answer: "The tool is trained to produce natural, varied writing. You should still read it through and add one personal detail that only you could write." },
    { question: "Can I update my summary as my career changes?", answer: "Yes. Come back anytime — your background details are saved to your profile so updating takes seconds." },
    { question: "Does this include headline suggestions?", answer: "Yes. You'll receive headline variations alongside your About section to test which gets more profile views." },
  ],
};

export const linkedinSummaryGenerator: ToolConfig = {
  slug: LINKEDIN_SUMMARY_GENERATOR_SLUG,
  name: "LinkedIn Summary Generator",
  description: "Answer 6 questions and get a compelling LinkedIn About section with headline variations.",
  resultMode: "letter",
  profileQuestionIds: [1, 2, 3],
  maxOutputTokens: 2048,

  sections: [
    { name: "Your Background", key: "yourBackground" },
    { name: "Style", key: "style" },
  ],

  questions: [
    {
      id: 1,
      section: "Your Background",
      label: "Your name + current job title",
      type: "fields",
      required: true,
      fields: [
        { key: "name", label: "Your full name", placeholder: "e.g. Alex Johnson", required: true },
        { key: "job_title", label: "Current job title", placeholder: "e.g. Senior Product Manager", required: true },
      ],
    },
    {
      id: 2,
      section: "Your Background",
      label: "Years of experience",
      type: "single",
      required: true,
      options: ["0–2 years", "2–5 years", "5–10 years", "10+ years", "Write it myself"],
    },
    {
      id: 3,
      section: "Your Background",
      label: "Top 3–5 skills or areas of expertise",
      type: "multi",
      required: true,
      maxSelections: 5,
      options: [
        "Leadership", "Product Management", "Software Engineering", "Data Analysis",
        "Marketing", "Sales", "Design", "Finance", "Operations", "People Management",
        "Strategy", "Customer Success", "Write it myself",
      ],
    },
    {
      id: 4,
      section: "Your Background",
      label: "Most impressive career achievement",
      type: "text",
      required: true,
      rows: 3,
      placeholder: "e.g. Grew ARR from $2M to $10M in 18 months by launching a new enterprise tier.",
    },
    {
      id: 5,
      section: "Your Background",
      label: "What you're looking to do next / career goal",
      type: "text",
      required: false,
      rows: 2,
      placeholder: "e.g. Transition into a VP of Product role at a growth-stage startup.",
    },
    {
      id: 6,
      section: "Style",
      label: "Tone",
      type: "single",
      required: true,
      options: ["Professional", "Conversational", "Bold", "Write it myself"],
    },
  ],

  systemPrompt: "",
  seoContent,
};
