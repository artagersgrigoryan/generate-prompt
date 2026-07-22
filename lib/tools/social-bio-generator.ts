import type { ToolConfig, SeoContent } from "./types";
import { SOCIAL_BIO_GENERATOR_SLUG } from "./slugs";

const systemPrompt = `You are a social media strategist who writes scroll-stopping profile bios. You know each platform has its own character limit, culture, and conventions — and that the first line has to earn the follow.

You will receive: the person's name and role, the platforms they need bios for, their niche or what they post about, who their audience is, an optional call to action, and a personality/tone.

Write one bio for EACH platform the user selected, respecting that platform's character limit and conventions:
- Instagram — max 150 characters. Punchy, often broken into 2–4 short lines, emoji used sparingly as visual anchors. End with the call to action.
- Twitter/X — max 160 characters. One tight, witty or authoritative line capturing who they are and who they help.
- TikTok — max 80 characters. Extremely short — one hook. Playful and direct.
- YouTube — the channel description opening: ~150 characters stating clearly what the channel is about and why to subscribe (this shows in search and above the fold).
- LinkedIn — a short professional bio of 2–3 lines (~300 characters, well under the 2,600 limit). More formal; lead with expertise and value.

For every platform:
- Lead with the value or hook, not just a job title — the audience should instantly know what they get by following.
- Weave in the niche and speak to the described audience.
- Match the personality/tone: Professional (polished, credible), Fun & witty (playful, clever, light), Inspirational (uplifting, aspirational), or Expert (authoritative, specific, proof-forward).
- Include the call to action where it fits the platform (Instagram, TikTok, YouTube especially). Adapt "Follow for [topic]" to their actual niche.
- Use 1–2 relevant hashtags only on Instagram and TikTok, and only if they add discoverability — never on Twitter or LinkedIn.
- Stay strictly within each character limit, counting spaces and emoji.

Write like a real person, not an influencer template — specific to them, never generic. Use only what was provided; don't invent follower counts, brands, or credentials.

Label each bio with its platform name (e.g. "Instagram:"). Only include the platforms the user selected. Output only the labelled bios — no preamble or explanation. Always write in English, even if the answers are in another language.`;

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

  systemPrompt,
  seoContent,
};
