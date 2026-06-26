import type { ToolConfig, SeoContent } from "./types";
import { LINKEDIN_RECOMMENDATION_GENERATOR_SLUG } from "./slugs";

const seoContent: SeoContent = {
  tagline: "Write a warm, specific LinkedIn recommendation for a colleague, report, or manager — in under 2 minutes.",
  benefits: [
    { icon: "pencil", title: "Specific, not generic", description: "Trained to avoid hollow praise. The output references their actual work and the real impact they had." },
    { icon: "clock", title: "Under 2 minutes", description: "Answer 6 questions and get a ready-to-post recommendation. No blank page required." },
    { icon: "users", title: "Works for any relationship", description: "Colleagues, direct reports, managers, mentors — the tool adapts to your working relationship." },
    { icon: "sparkles", title: "Multiple tones", description: "Choose from warm, professional, or enthusiastic to match your personal style." },
  ],
  howItWorks: [
    { title: "Describe the person", description: "Their name, role, and how you worked together — as a colleague, manager, report, or client." },
    { title: "Share what made them stand out", description: "Their key strength, a specific project or achievement, and the impact it had on the team or business." },
    { title: "Get your recommendation", description: "A genuine, specific LinkedIn recommendation ready to post directly or lightly personalise." },
  ],
  useCases: [
    { title: "Recommending a colleague", description: "Acknowledge a peer's contributions in a way that's specific enough to actually help their career." },
    { title: "Writing for a direct report", description: "Highlight growth, impact, and qualities that will open doors for someone you managed." },
    { title: "Recommending a mentor", description: "Express genuine gratitude for someone who shaped your career in a professional, articulate way." },
    { title: "Helping a connection", description: "Support someone's job search with a strong recommendation without spending an hour writing it." },
  ],
  faqs: [
    { question: "How long should a LinkedIn recommendation be?", answer: "100–200 words is ideal. Long enough to be substantive and credible, short enough that recruiters actually read it." },
    { question: "What makes a recommendation stand out?", answer: "Specificity. Mentioning a real project, measurable result, or unique quality is worth more than three paragraphs of generic praise like 'great team player.'" },
    { question: "Should I ask permission before recommending someone?", answer: "It's good practice to let them know. LinkedIn notifies them before the recommendation is published, so they can accept it or ask you to adjust." },
    { question: "Can I recommend someone I didn't work with directly?", answer: "Yes, but be honest about your relationship. Recommendations from people who observed your work in adjacent contexts are still valuable — just be clear about the nature of your connection." },
    { question: "Can I edit the output before posting?", answer: "Yes. The result is plain text — copy it into LinkedIn's recommendation editor and adjust any details before posting." },
  ],
};

export const linkedinRecommendationGenerator: ToolConfig = {
  slug: LINKEDIN_RECOMMENDATION_GENERATOR_SLUG,
  name: "LinkedIn Recommendation Generator",
  description: "Write a warm, specific LinkedIn recommendation for a colleague in under 2 minutes.",
  resultMode: "letter",
  profileQuestionIds: [],
  maxOutputTokens: 2048,

  sections: [
    { name: "About Them", key: "aboutThem" },
    { name: "Your Recommendation", key: "yourRecommendation" },
  ],

  questions: [
    {
      id: 1,
      section: "About Them",
      label: "Person you're recommending: name + job title",
      type: "fields",
      required: true,
      fields: [
        { key: "name", label: "Their full name", placeholder: "e.g. Jordan Lee", required: true },
        { key: "job_title", label: "Their job title", placeholder: "e.g. Lead Frontend Engineer", required: true },
      ],
    },
    {
      id: 2,
      section: "About Them",
      label: "Your relationship",
      type: "single",
      required: true,
      options: ["Their direct manager", "Colleague", "I was their manager", "Their client", "Write it myself"],
    },
    {
      id: 3,
      section: "About Them",
      label: "How long you worked together + context",
      type: "text",
      required: true,
      rows: 2,
      placeholder: "e.g. Worked together for 2 years on the platform team at Acme Corp.",
    },
    {
      id: 4,
      section: "Your Recommendation",
      label: "Their top strengths",
      type: "multi",
      required: true,
      maxSelections: 4,
      options: [
        "Communication", "Leadership", "Technical skills", "Problem solving",
        "Collaboration", "Creativity", "Reliability", "Write it myself",
      ],
    },
    {
      id: 5,
      section: "Your Recommendation",
      label: "A specific example or achievement you witnessed",
      type: "text",
      required: true,
      rows: 3,
      placeholder: "e.g. Jordan single-handedly rebuilt our CI pipeline, cutting build times from 22 minutes to under 4.",
    },
    {
      id: 6,
      section: "Your Recommendation",
      label: "Closing sentiment",
      type: "single",
      required: true,
      options: ["Would hire them again", "Recommend without reservation", "Best team member I've had", "Write it myself"],
    },
  ],

  systemPrompt: "",
  seoContent,
};
