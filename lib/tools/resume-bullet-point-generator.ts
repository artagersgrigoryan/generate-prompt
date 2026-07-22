import type { ToolConfig, SeoContent } from "./types";
import { RESUME_BULLET_POINT_GENERATOR_SLUG } from "./slugs";

const systemPrompt = `You are an expert resume writer and career coach who has helped candidates land roles at top companies. You know exactly how Applicant Tracking Systems (ATS) parse resumes and what hiring managers scan for in the six seconds they spend on each one.

You will receive: the candidate's current or most recent job title, their industry, their key responsibilities, optional quantifiable achievements, the job title they're targeting, and what to emphasise.

Your task: rewrite their raw experience into 5 polished, achievement-focused resume bullet points.

Rules for every bullet:
- Lead with a strong, varied action verb (Led, Built, Reduced, Scaled, Launched, Negotiated, Automated…) — never repeat a verb, and never open with "Responsible for," "Worked on," "Helped with," or "Duties included."
- Use outcome-first structure: accomplishment + how + measurable result. Put the result up front when it's impressive (e.g. "Cut API latency 40% by redesigning the caching layer for 2M daily requests").
- Quantify wherever possible using the metrics provided. If a responsibility clearly implies a measurable result but no number was given, add a realistic placeholder in [brackets] so the candidate knows to fill it in — never fabricate a specific number as if it were real.
- Keep each bullet to one or two lines. Tight, scannable, no filler.
- Weave in keywords and seniority signals appropriate to the target job title — this resume is aimed at the next role, not the last one.

Tailor to the chosen emphasis:
- Results & metrics: foreground numbers and business impact.
- Skills & tools: surface specific technologies, methods, and tools.
- Leadership: highlight scope — people managed, cross-functional influence, ownership.
- Technical depth: show the hard problems solved and the technical decisions made.

Match the language and conventions of the candidate's industry (Technology, Healthcare, Finance, Marketing, Education, or the one specified).

Output only the bullet points, one per line, each starting with "• ". No headings, no intro, no closing commentary. Always write in English, even if the answers are in another language.`;

const seoContent: SeoContent = {
  tagline: "Turn job responsibilities into ATS-beating resume bullets with strong action verbs and measurable outcomes.",
  benefits: [
    { icon: "target", title: "ATS optimised", description: "Uses action verbs and keyword structures that score well in Applicant Tracking Systems." },
    { icon: "sparkles", title: "Outcome-first format", description: "Every bullet leads with results, not tasks — the format that impresses hiring managers." },
    { icon: "zap", title: "Seconds per bullet", description: "Enter your responsibilities and get polished, interview-ready bullets instantly." },
    { icon: "briefcase", title: "Role-specific language", description: "Output adapts to your industry and seniority level, not a generic one-size-fits-all template." },
  ],
  howItWorks: [
    { title: "Enter your role and responsibilities", description: "Describe what you did in plain language — no need for perfect wording or polished prose." },
    { title: "Tell us your target level", description: "Share the role you're applying for so the language matches the right seniority and industry." },
    { title: "Get polished resume bullets", description: "Claude rewrites your experience using strong action verbs, quantified outcomes, and ATS-friendly structure." },
  ],
  useCases: [
    { title: "Job seekers updating their CV", description: "Transform a list of duties into compelling achievements that make hiring managers take notice." },
    { title: "Career changers", description: "Reframe your experience to emphasise the most relevant skills for a new role or industry." },
    { title: "Recent graduates", description: "Make limited experience sound substantial by framing internships and projects as outcomes." },
    { title: "Senior professionals", description: "Articulate strategic impact and leadership at the right level for executive roles." },
  ],
  faqs: [
    { question: "What makes a good resume bullet point?", answer: "The best bullets lead with a strong action verb, include a quantified result, and stay under two lines. Example: 'Reduced customer churn by 18% by redesigning the onboarding flow for 50,000+ users.'" },
    { question: "What if I don't have metrics to include?", answer: "Enter what you know — the tool will suggest ways to estimate or frame impact even without hard numbers." },
    { question: "How many bullets should I have per role?", answer: "3–5 bullets per role is typical. Focus on achievements rather than a complete list of responsibilities." },
    { question: "Will it work for any industry?", answer: "Yes. The tool adapts to tech, finance, healthcare, marketing, design, operations, and more." },
    { question: "Can I use this for a LinkedIn experience section?", answer: "Yes. The bullets work equally well for LinkedIn experience entries and traditional resumes." },
  ],
};

export const resumeBulletPointGenerator: ToolConfig = {
  slug: RESUME_BULLET_POINT_GENERATOR_SLUG,
  name: "Resume Bullet Point Generator",
  description: "Turn your job responsibilities into ATS-optimized resume bullets with strong action verbs.",
  resultMode: "prompt",
  profileQuestionIds: [1, 2],
  maxOutputTokens: 2048,

  sections: [
    { name: "Your Role", key: "yourRole" },
    { name: "Target Role", key: "targetRole" },
  ],

  questions: [
    {
      id: 1,
      section: "Your Role",
      label: "Your current / most recent job title",
      type: "text",
      required: true,
      rows: 1,
      placeholder: "e.g. Senior Software Engineer",
    },
    {
      id: 2,
      section: "Your Role",
      label: "Industry / field",
      type: "single",
      required: true,
      options: ["Technology", "Healthcare", "Finance", "Marketing", "Education", "Write it myself"],
    },
    {
      id: 3,
      section: "Your Role",
      label: "Key responsibilities in this role",
      type: "text",
      required: true,
      rows: 4,
      placeholder: "e.g. Led backend architecture decisions, mentored 3 junior engineers, reduced API latency by 40%...",
    },
    {
      id: 4,
      section: "Your Role",
      label: "Quantifiable achievements — optional",
      type: "text",
      required: false,
      rows: 3,
      placeholder: "e.g. Reduced deployment time from 2h to 15min. Increased test coverage from 40% to 85%.",
    },
    {
      id: 5,
      section: "Target Role",
      label: "Job title you're applying for",
      type: "text",
      required: true,
      rows: 1,
      placeholder: "e.g. Staff Software Engineer or Engineering Manager",
    },
    {
      id: 6,
      section: "Target Role",
      label: "Emphasis",
      type: "single",
      required: true,
      options: ["Results & metrics", "Skills & tools", "Leadership", "Technical depth", "Write it myself"],
    },
  ],

  systemPrompt,
  seoContent,
};
