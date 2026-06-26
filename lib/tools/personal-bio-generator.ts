import type { ToolConfig, SeoContent } from "./types";
import { PERSONAL_BIO_GENERATOR_SLUG } from "./slugs";

const seoContent: SeoContent = {
  tagline: "Generate a polished third-person bio for speaker profiles, about pages, media kits, and portfolios.",
  benefits: [
    { icon: "users", title: "Multiple lengths", description: "Get short (~50 word), medium (~100 word), and full (~200 word) versions — choose whichever fits your context." },
    { icon: "pencil", title: "Third-person, naturally", description: "Writing about yourself in third person is hard. Claude makes it sound authoritative, not awkward." },
    { icon: "target", title: "Context-appropriate tone", description: "Specify where your bio will appear and the tone adapts — a conference profile reads differently from a portfolio page." },
    { icon: "clock", title: "Saved for later", description: "Your background details are saved to your profile so future bios take seconds to update." },
  ],
  howItWorks: [
    { title: "Describe who you are", description: "Name, role, industry, years of experience, and one standout achievement or credential." },
    { title: "Tell us where it's going", description: "Speaker profile, about page, media kit, author page — context shapes the tone and ideal length." },
    { title: "Get your bio", description: "Claude writes multiple lengths in professional third person, ready to paste or lightly adapt." },
  ],
  useCases: [
    { title: "Conference and event speakers", description: "Have a ready-to-submit bio for event organisers that's professional and the right length." },
    { title: "Freelancers and consultants", description: "A credible bio for your website's about page or proposals that establishes authority." },
    { title: "Executives and founders", description: "A board-ready or press-ready bio that represents your career accurately and compellingly." },
    { title: "Authors and creators", description: "Back-cover, podcast guest, or media kit bios written for the right length and context." },
  ],
  faqs: [
    { question: "Should my bio be in first or third person?", answer: "Depends on the context. Speaker profiles, about pages, and media kits typically use third person ('Alex Johnson is a...'). LinkedIn and personal websites often use first person. This tool generates third-person bios — ideal for most professional contexts." },
    { question: "How long should a professional bio be?", answer: "Short bios (1–2 sentences, ~50 words) work for bylines and social profiles. Medium bios (~100 words) suit about pages and conference programmes. Full bios (~200 words) are for speaker pages and press kits." },
    { question: "What if I have multiple roles?", answer: "Enter your primary role in the required field and mention other roles in the additional context — the AI will weave them in naturally without making it feel like a list." },
    { question: "Can I use this for LinkedIn?", answer: "LinkedIn typically uses first person, so this bio is better suited for other contexts. For a LinkedIn About section, use our LinkedIn Summary Generator." },
    { question: "Can I generate bios in different tones?", answer: "Yes. Run the tool again and change the context — a speaker profile bio will be more formal, while a portfolio bio can be warmer and more personal." },
  ],
};

export const personalBioGenerator: ToolConfig = {
  slug: PERSONAL_BIO_GENERATOR_SLUG,
  name: "Personal Bio Generator",
  description: "Generate a polished third-person bio for speaker profiles, about pages, and portfolios.",
  resultMode: "letter",
  profileQuestionIds: [1, 2, 4],
  maxOutputTokens: 2048,

  sections: [
    { name: "About You", key: "aboutYou" },
    { name: "The Bio", key: "theBio" },
  ],

  questions: [
    {
      id: 1,
      section: "About You",
      label: "Your name + current role / title",
      type: "fields",
      required: true,
      fields: [
        { key: "name", label: "Your full name", placeholder: "e.g. Alex Johnson", required: true },
        { key: "role", label: "Current role / title", placeholder: "e.g. Founder & CEO, Acme Studio", required: true },
      ],
    },
    {
      id: 2,
      section: "About You",
      label: "Professional background in 2–3 sentences",
      type: "text",
      required: true,
      rows: 3,
      placeholder: "e.g. 10 years building consumer apps. Previously led product at two YC startups. Now running an independent design studio.",
    },
    {
      id: 3,
      section: "The Bio",
      label: "Where this bio will appear",
      type: "single",
      required: true,
      options: ["Personal website", "Speaker profile", "Author page", "Portfolio", "Write it myself"],
    },
    {
      id: 4,
      section: "About You",
      label: "Key achievements or credentials",
      type: "text",
      required: false,
      rows: 2,
      placeholder: "e.g. TEDx speaker, Forbes 30 Under 30, shipped apps with 1M+ downloads.",
    },
    {
      id: 5,
      section: "The Bio",
      label: "Personal detail to include — optional",
      type: "text",
      required: false,
      rows: 2,
      placeholder: "e.g. Based in Amsterdam. Obsessive trail runner and amateur ceramicist.",
    },
    {
      id: 6,
      section: "The Bio",
      label: "Length",
      type: "single",
      required: true,
      options: ["Short — ~50 words", "Medium — ~100 words", "Full — ~200 words"],
    },
  ],

  systemPrompt: "",
  seoContent,
};
