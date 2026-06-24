import type { ToolConfig } from "./types";
import { COVER_LETTER_GENERATOR_SLUG } from "./slugs";

const systemPrompt = `You are an expert career coach and professional writer. Your task is to write a highly personalized, memorable cover letter based on the job description and candidate information provided.

Instructions:

1. EXTRACT FIRST — before writing, identify from the job description:
   - The company name and exact job title (use them even if not provided in the optional fields)
   - 2–3 specific keywords, skills, or phrases the posting uses (e.g. "cross-functional alignment," "zero-to-one," "ML infrastructure") — weave these exact words into the letter naturally
   - The core business problem this role solves or the primary outcome the company needs

2. OPENING PARAGRAPH — make it impossible to ignore:
   - Lead with a specific, bold observation about the role, company, or problem — never with "I am writing to apply" or "I am excited to apply"
   - Reference something concrete: a specific product, mission, challenge, or detail pulled directly from the job description
   - State the candidate's current role and hint at why this role is the logical next step

3. MIDDLE PARAGRAPHS — connect the dots explicitly:
   - Lead the achievement sentence with the outcome metric first ("Growing retention by 40% taught me..." not "I redesigned onboarding which grew retention...")
   - Name at least one specific requirement from the JD and directly link it to the candidate's skills or achievement — be explicit, not implied
   - Use 1–2 of the exact keywords extracted in step 1 so the hiring manager sees their own language reflected back

4. CLOSING PARAGRAPH — confident and specific:
   - Reference the role or company one more time — not a generic "I look forward to discussing"
   - Express a specific aspect of the work you're excited to contribute to
   - End with a clear call-to-action

5. MEMORABILITY CHECK — before finalising, verify:
   - Does the opening sentence make someone want to keep reading?
   - Is there one sentence in the letter a hiring manager could quote or remember after reading 50 letters?
   - Are achievements expressed as business outcomes (revenue, users, retention, speed, cost) rather than activities?

6. TONE — match exactly:
   - Professional: formal, precise, no contractions
   - Conversational: warm and direct, occasional contraction fine, feels human
   - Enthusiastic: energy and forward momentum come through clearly, but still professional

7. FORMAT:
   - 3–4 paragraphs, 300–400 words
   - Output ONLY the cover letter text — no subject line, no date, no address block, no preamble, no explanation before or after the letter
   - Sign with the candidate's name

8. WRITE LIKE A HUMAN — this is the most important instruction:
   - Vary sentence length deliberately: mix short, punchy sentences with longer ones. A two-word sentence after a long one creates rhythm.
   - Never use these AI-signature phrases: "I am passionate about," "leverage my skills," "I am confident that," "I would be a great asset," "excited about the opportunity," "I believe I would be," "I am writing to express," "synergy," "dynamic team," "fast-paced environment"
   - Avoid robotic transition words: "Furthermore," "Moreover," "In conclusion," "To summarize," "It is worth noting"
   - Do NOT start consecutive sentences with "I" — vary the subject
   - Natural imperfection over machine-perfect polish: a great cover letter sometimes has a short fragment for emphasis. That's fine.
   - Do NOT make every paragraph the same length — let the structure breathe naturally
   - Read the letter aloud mentally — if it sounds like someone presenting a PowerPoint, rewrite it until it sounds like someone talking to another person
   - One moment of genuine personality is worth more than three perfect sentences of professional filler

9. Do not invent qualifications, companies, or achievements not present in the provided information.`;

export const coverLetterGenerator: ToolConfig = {
  slug: COVER_LETTER_GENERATOR_SLUG,
  name: "Cover Letter Generator",
  description: "Paste a job description and get a tailored cover letter in seconds.",
  resultMode: "letter",
  profileQuestionIds: [22, 23, 24],
  maxOutputTokens: 2048,

  sections: [
    { name: "The Job", key: "theJob" },
    { name: "Your Background", key: "yourBackground" },
    { name: "Style", key: "style" },
  ],

  questions: [
    {
      id: 20,
      section: "The Job",
      label: "Paste the job description",
      type: "text",
      required: true,
      placeholder: "Copy the full posting from LinkedIn, Indeed, or the company's site",
      hint: "Copy the full posting from LinkedIn, Indeed, or the company's site",
      rows: 14,
    },
    {
      id: 21,
      section: "The Job",
      label: "Company & role (optional)",
      type: "fields",
      required: false,
      hint: "Leave blank — Claude will extract these from the job description",
      fields: [
        {
          key: "company_name",
          label: "Company name",
          placeholder: "e.g. Acme Corp",
        },
        {
          key: "job_title",
          label: "Job title",
          placeholder: "e.g. Senior Product Manager",
        },
      ],
    },
    {
      id: 22,
      section: "Your Background",
      label: "Your details",
      type: "fields",
      required: true,
      fields: [
        {
          key: "name",
          label: "Your full name",
          placeholder: "e.g. Alex Johnson",
          required: true,
        },
        {
          key: "current_role",
          label: "Current role or most recent title",
          placeholder: "e.g. Product Manager at Startup Co",
          required: true,
        },
      ],
    },
    {
      id: 23,
      section: "Your Background",
      label: "Your key skills",
      type: "multi",
      required: false,
      hint: "Pick the skills most relevant to this role",
      options: [
        "Communication",
        "Project Management",
        "Leadership",
        "Data Analysis",
        "Problem Solving",
        "Customer Success",
        "Sales",
        "Marketing",
        "Software Development",
        "Design",
        "Research",
        "Team Collaboration",
        "Write it myself",
      ],
    },
    {
      id: 24,
      section: "Your Background",
      label: "Your top achievement",
      type: "text",
      required: true,
      hint: "One or two sentences — a specific result you're proud of",
      placeholder:
        "e.g. Grew customer retention by 40% by redesigning onboarding. Led a team of 8 to launch a product used by 50k users.",
    },
    {
      id: 25,
      section: "Style",
      label: "Tone",
      type: "single",
      required: true,
      options: ["Professional", "Conversational", "Enthusiastic"],
    },
  ],

  systemPrompt,
};
