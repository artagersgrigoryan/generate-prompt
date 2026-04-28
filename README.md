# Website Prompt Generator

A multi-step wizard that interviews you about your website needs and generates a detailed AI prompt using your chosen AI model — ready to paste into Claude, Cursor, Bolt, or any AI coding tool.

## Features

- 12-question wizard across 4 sections: Basics, Audience & Brand, Content & Pages, Features & Tech
- Supports Claude Haiku, Gemini 2.0 Flash, Mistral Small, and LLaMA 3 70B (via Groq)
- Models are shown only if their API key is configured
- "Write it myself" option on every selection question
- Copy, regenerate, and start-over on the result screen
- Fully mobile responsive, SSR landing page with Open Graph tags

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd website-prompt-generator
npm install
```

### 2. Configure API keys

Copy `.env.local` (already present) and fill in at least one key:

```
ANTHROPIC_API_KEY=     # https://console.anthropic.com/
GOOGLE_AI_API_KEY=     # https://aistudio.google.com/app/apikey
MISTRAL_API_KEY=       # https://console.mistral.ai/
GROQ_API_KEY=          # https://console.groq.com/
```

Only models with a valid key appear in the dropdown. You need at least one.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build for production

```bash
npm run build
npm start
```

## Free tier notes

| Model | Provider | Free tier |
|---|---|---|
| Claude Haiku | Anthropic | No free tier; pay-as-you-go (~$0.0008/1K input tokens) |
| Gemini 2.0 Flash | Google | Free tier via Google AI Studio |
| Mistral Small | Mistral | Free tier available (rate limited) |
| LLaMA 3 70B | Groq | Free tier with generous rate limits |

## Project structure

```
/app
  /page.tsx               Landing page (SSR, SEO-optimized)
  /generator/page.tsx     The 12-step wizard (client component)
  /api/generate/route.ts  API route — calls the selected AI model
  /api/models/route.ts    Returns available models based on .env.local
/components
  /wizard/                ProgressBar, QuestionStep, ModelSelector, ResultScreen
  /ui/                    Button, Input, Textarea
/lib
  /questions.ts           All 12 questions and options
  /models.ts              Model definitions and availability check
```
