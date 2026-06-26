import type { ToolConfig, SeoContent } from "./types";
import { SOCIAL_BIO_GENERATOR_SLUG } from "./slugs";

const seoContent: SeoContent = {
  tagline: "Get platform-specific bios for Instagram, Twitter/X, TikTok, LinkedIn, and more — written for each platform's character limits.",
  benefits: [
    { icon: "users", title: "Platform-specific output", description: "Each platform has different character limits and conventions. Get a bio written for the right constraints." },
    { icon: "zap", title: "All platforms in one run", description: "Generate bios for multiple platforms at once — no need to adapt each one separately." },
    { icon: "pencil", title: "Sounds like you", description: "Choose your tone and the bio captures your voice — not a generic influencer template." },
    { icon: "target", title: "Optimised for discoverability", description: "Includes relevant keywords and calls to action where appropriate for each platform." },
  ],
  howItWorks: [
    { title: "Tell us who you are", description: "Your name, role, what you create or offer, and who your audience is." },
    { title: "Choose your platforms and tone", description: "Select which platforms you need bios for and the voice that fits your personal brand." },
    { title: "Get your bios", description: "Platform-specific bios tailored to character limits and the conventions of each network." },
  ],
  useCases: [
    { title: "Creators and influencers", description: "Show new visitors exactly who you are and why they should follow you — in the first line." },
    { title: "Freelancers and consultants", description: "Turn your social profiles into client-attracting pages with a clear, benefit-led bio." },
    { title: "Brands and businesses", description: "Keep your social presence consistent and compelling across every platform." },
    { title: "Professionals building a personal brand", description: "Go from 'I have a profile' to an active, well-presented personal brand across networks." },
  ],
  faqs: [
    { question: "How long can a social media bio be?", answer: "Instagram: 150 characters. Twitter/X: 160 characters. TikTok: 80 characters. LinkedIn About: 2,600 characters (though shorter is often better). The tool writes to each platform's actual limit." },
    { question: "Should I use hashtags in my bio?", answer: "On Instagram and TikTok, 1–2 niche hashtags can help discoverability. On Twitter and LinkedIn, hashtags in bios are less standard. The tool includes them where they're actually useful." },
    { question: "How often should I update my bio?", answer: "Update it whenever your role, focus, or key offering changes significantly — or when you launch something new worth highlighting." },
    { question: "Can I use the same bio on every platform?", answer: "Technically yes, but platforms have different conventions and character limits. A LinkedIn bio should be more formal; Instagram and TikTok can be more playful and direct. This tool writes platform-appropriate versions automatically." },
    { question: "What if I'm on a platform not listed?", answer: "Use the 'write it myself' option to describe your platform, or use the closest available option and edit the character count and tone to fit." },
  ],
};

export const socialBioGenerator: ToolConfig = {
  slug: SOCIAL_BIO_GENERATOR_SLUG,
  name: "Social Bio Generator",
  description: "Get platform-specific bios for Instagram, Twitter/X, TikTok, LinkedIn, and more.",
  resultMode: "letter",
  profileQuestionIds: [1, 3, 4],
  maxOutputTokens: 2048,

  sections: [
    { name: "About You", key: "aboutYou" },
    { name: "Your Platforms", key: "yourPlatforms" },
  ],

  questions: [
    {
      id: 1,
      section: "About You",
      label: "Your name + role / what you do",
      type: "fields",
      required: true,
      fields: [
        { key: "name", label: "Your name", placeholder: "e.g. Alex Johnson", required: true },
        { key: "role", label: "Role / what you do", placeholder: "e.g. UX Designer & Content Creator", required: true },
      ],
    },
    {
      id: 2,
      section: "Your Platforms",
      label: "Platforms",
      type: "multi",
      required: true,
      options: ["Instagram", "Twitter/X", "TikTok", "YouTube", "LinkedIn", "Write it myself"],
    },
    {
      id: 3,
      section: "About You",
      label: "Your niche or what you post about",
      type: "text",
      required: true,
      rows: 2,
      placeholder: "e.g. Minimalist productivity, design workflows, and behind-the-scenes of freelance life.",
    },
    {
      id: 4,
      section: "About You",
      label: "Who your audience is",
      type: "text",
      required: true,
      rows: 1,
      placeholder: "e.g. Designers and freelancers who want to work smarter, not harder.",
    },
    {
      id: 5,
      section: "Your Platforms",
      label: "Call to action",
      type: "single",
      required: false,
      options: ["Link in bio", "DM me", "Follow for [topic]", "Visit my website", "Write it myself"],
    },
    {
      id: 6,
      section: "Your Platforms",
      label: "Personality / tone",
      type: "single",
      required: true,
      options: ["Professional", "Fun & witty", "Inspirational", "Expert", "Write it myself"],
    },
  ],

  systemPrompt: "",
  seoContent,
};
