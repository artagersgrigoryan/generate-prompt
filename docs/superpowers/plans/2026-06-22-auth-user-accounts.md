# Auth & User Accounts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google/GitHub/email authentication and persistent prompt history to the website-prompt-generator, transforming it from a stateless tool into a personalized platform.

**Architecture:** NextAuth v5 (Auth.js beta) provides auth with Google, GitHub, and Resend magic-link email providers. Neon Postgres (Vercel-native) stores users, OAuth accounts, and generated prompts via Prisma ORM. JWT sessions are used (no DB read per request). The existing generator wizard remains fully functional for guests; signed-in users get automatic prompt saving and a dashboard.

**Tech Stack:** next-auth@beta, @auth/prisma-adapter, prisma, @prisma/client, Neon Postgres, Resend (email), Next.js 16 App Router server components + server actions, next-intl v4

## Global Constraints

- Next.js 16.2.4 — no assumptions from older Next.js versions
- next-intl v4 — use `getTranslations()` (async) in server components, `useTranslations()` in client components
- i18n: never overwrite hy.json or ru.json existing keys — only append new keys with the English value as placeholder
- `"use client"` directive required on any component using hooks
- Prisma client must be a singleton (`lib/prisma.ts`) to prevent hot-reload connection leaks
- JWT session strategy (not database sessions) — no Session table required
- All dashboard/settings routes require authentication; generator and landing page remain public
- TypeScript strict mode — all types must be explicit

---

## File Map

**New files:**
```
auth.config.ts                         (Edge-compatible, used by middleware)
prisma/schema.prisma
lib/prisma.ts
lib/auth.ts
next-auth.d.ts
app/api/auth/[...nextauth]/route.ts
app/api/prompts/route.ts
app/api/prompts/[id]/route.ts
app/api/prompts/[id]/favorite/route.ts
app/api/user/route.ts
components/Providers.tsx
components/UserMenu.tsx
app/[locale]/auth/signin/page.tsx
app/[locale]/dashboard/layout.tsx
app/[locale]/dashboard/page.tsx
app/[locale]/dashboard/history/page.tsx
app/[locale]/dashboard/favorites/page.tsx
app/[locale]/settings/page.tsx
components/dashboard/PromptCard.tsx
docs/superpowers/specs/2026-06-22-auth-user-accounts-design.md
```

**Modified files:**
```
proxy.ts                               — add auth guard for /dashboard/* and /settings
app/api/generate/route.ts              — auto-save Prompt to DB when user is authenticated
app/[locale]/layout.tsx                — add SessionProvider wrapper
components/Header.tsx                  — add Sign In button / UserMenu
messages/en.json                       — add auth, dashboard, settings namespaces
messages/hy.json                       — append new keys with English placeholder values
messages/ru.json                       — append new keys with English placeholder values
```

---

## Task 1: Install Packages

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install production dependencies**

```bash
cd /Users/artagersgrigoryangmail.com/Documents/website-prompt-generator
npm install next-auth@beta @auth/prisma-adapter @prisma/client
```

Expected output: packages added successfully, no peer dependency errors.

- [ ] **Step 2: Install Prisma CLI as dev dependency**

```bash
npm install --save-dev prisma
```

- [ ] **Step 3: Verify installation**

```bash
npx prisma --version
```

Expected: prints Prisma CLI version (5.x or 6.x).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install next-auth v5, prisma, and prisma-adapter"
```

---

## Task 2: Database Schema and Prisma Client

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`
- Create: `next-auth.d.ts`

- [ ] **Step 1: Create Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  prompts       Prompt[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Prompt {
  id         String   @id @default(cuid())
  userId     String
  answers    Json
  result     String   @db.Text
  model      String
  isFavorite Boolean  @default(false)
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}
```

Note: `DIRECT_URL` is required by Neon for Prisma migrations (bypasses connection pooling). Both `DATABASE_URL` and `DIRECT_URL` will be provided by the Neon Vercel integration.

- [ ] **Step 2: Create Prisma client singleton**

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: Create NextAuth TypeScript augmentation**

Create `next-auth.d.ts` in the project root:

```typescript
import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma lib/prisma.ts next-auth.d.ts
git commit -m "feat: add prisma schema and client singleton"
```

---

## Task 3: NextAuth Configuration

NextAuth v5 requires a **split config** because Next.js middleware runs on Edge Runtime, which is not compatible with Prisma (native Node.js modules). The solution: a lightweight `auth.config.ts` for the middleware, and the full config (with Prisma adapter) in `lib/auth.ts`.

**Files:**
- Create: `auth.config.ts` (project root — Edge-compatible)
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create Edge-compatible auth config**

Create `auth.config.ts` in the project root:

```typescript
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.AUTH_RESEND_FROM ?? "noreply@example.com",
    }),
  ],
  pages: {
    signIn: "/en/auth/signin",
  },
};
```

- [ ] **Step 2: Create full NextAuth config with Prisma adapter**

Create `lib/auth.ts`:

```typescript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id!;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
});
```

- [ ] **Step 3: Create the NextAuth catch-all API route**

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 4: Commit**

```bash
git add auth.config.ts lib/auth.ts app/api/auth/
git commit -m "feat: add nextauth v5 config with split edge/node setup"
```

---

## Task 4: Session Provider + Layout Update

**Files:**
- Create: `components/Providers.tsx`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Create Providers client wrapper**

Create `components/Providers.tsx`:

```typescript
"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
```

- [ ] **Step 2: Update locale layout to wrap with Providers**

Modify `app/[locale]/layout.tsx` — replace the `body` content to add Providers wrapper:

```typescript
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Script from "next/script";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { auth } from "@/lib/auth";
import "../globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function buildAlternates(locale: string, path: string = "") {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return {};
  return {
    canonical: `${siteUrl}/${locale}${path}`,
    languages: {
      ...Object.fromEntries(
        routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`])
      ),
      "x-default": `${siteUrl}/en${path}`,
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Website Prompt Generator",
    description:
      "Answer 12 quick questions and generate a detailed AI brief for your website.",
    alternates: buildAlternates(locale),
  };
}

export { buildAlternates };

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const session = await auth();

  return (
    <html lang={locale} className={`${geist.variable} h-full antialiased`}>
      <head>


        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>

      <body className="min-h-full bg-white font-[family-name:var(--font-geist-sans)] dark:bg-neutral-950">


        <Providers session={session}>
          <NextIntlClientProvider messages={messages}>
            <Header />
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/Providers.tsx app/\[locale\]/layout.tsx
git commit -m "feat: add session provider to locale layout"
```

---

## Task 5: Sign-In Page

**Files:**
- Create: `app/[locale]/auth/signin/page.tsx`

- [ ] **Step 1: Create the sign-in page**

Create `app/[locale]/auth/signin/page.tsx`:

```typescript
import { getTranslations } from "next-intl/server";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const t = await getTranslations("auth");
  const redirectTo = callbackUrl ?? "/en/dashboard";

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t("signIn")}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t("signInSubtitle")}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {t("errorDefault")}
          </div>
        )}

        <div className="space-y-3">
          {/* Google */}
          <form
            action={async () => {
              "use server";
              try {
                await signIn("google", { redirectTo });
              } catch (e) {
                if (e instanceof AuthError) throw e;
                throw e;
              }
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t("continueWithGoogle")}
            </button>
          </form>

          {/* GitHub */}
          <form
            action={async () => {
              "use server";
              try {
                await signIn("github", { redirectTo });
              } catch (e) {
                if (e instanceof AuthError) throw e;
                throw e;
              }
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {t("continueWithGitHub")}
            </button>
          </form>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-200 dark:border-neutral-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-neutral-400 dark:bg-neutral-950">
              {t("orContinueWith")}
            </span>
          </div>
        </div>

        {/* Email magic link */}
        <form
          action={async (formData: FormData) => {
            "use server";
            const email = formData.get("email") as string;
            if (!email) return;
            try {
              await signIn("resend", { email, redirectTo });
            } catch (e) {
              if (e instanceof AuthError) throw e;
              throw e;
            }
            redirect("/en/auth/verify-email");
          }}
          className="space-y-3"
        >
          <input
            type="email"
            name="email"
            required
            placeholder={t("emailPlaceholder")}
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
          >
            {t("sendMagicLink")}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
          {t("termsNotice")}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the verify-email confirmation page**

Create `app/[locale]/auth/verify-email/page.tsx`:

```typescript
import { getTranslations } from "next-intl/server";

export default async function VerifyEmailPage() {
  const t = await getTranslations("auth");

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-12">
      <div className="max-w-sm space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <svg
            className="h-6 w-6 text-neutral-700 dark:text-neutral-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {t("checkYourEmail")}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {t("checkYourEmailDesc")}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/auth/"
git commit -m "feat: add sign-in page with google, github, and email providers"
```

---

## Task 6: Header + UserMenu Update

**Files:**
- Create: `components/UserMenu.tsx`
- Modify: `components/Header.tsx`

- [ ] **Step 1: Create UserMenu client component**

Create `components/UserMenu.tsx`:

```typescript
"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function UserMenu() {
  const { data: session } = useSession();
  const t = useTranslations("auth");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null;

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user.email?.[0].toUpperCase() ?? "?");

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700 transition-opacity hover:opacity-80 dark:bg-neutral-700 dark:text-neutral-200"
        aria-label="User menu"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-100 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
            <p className="truncate text-xs font-medium text-neutral-900 dark:text-neutral-100">
              {user.name ?? user.email}
            </p>
            {user.name && (
              <p className="truncate text-xs text-neutral-400">{user.email}</p>
            )}
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex w-full items-center px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {t("dashboard")}
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex w-full items-center px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {t("settings")}
          </Link>
          <div className="border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {t("signOut")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update Header to add sign-in button and UserMenu**

Fully replace `components/Header.tsx`:

```typescript
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { useSession } from "next-auth/react";

export function Header() {
  const t = useTranslations("nav");
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black transition-opacity group-hover:opacity-80 dark:bg-white">
            <svg className="h-4 w-4 text-white dark:text-black" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1L9.8 6.2L15 8L9.8 9.8L8 15L6.2 9.8L1 8L6.2 6.2Z" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-900 transition-colors group-hover:text-neutral-600 dark:text-neutral-100 dark:group-hover:text-neutral-400">
            {t("brand")}
          </span>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            Beta
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
          ) : session ? (
            <UserMenu />
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/UserMenu.tsx components/Header.tsx
git commit -m "feat: add user menu and sign-in button to header"
```

---

## Task 7: Auth Middleware Guard

The middleware uses `NextAuth(authConfig)` — the **Edge-compatible** config from `auth.config.ts` (no Prisma). The JWT cookie is decoded on Edge without any DB call.

**Files:**
- Modify: `proxy.ts`

- [ ] **Step 1: Replace proxy.ts with auth-aware middleware**

Fully replace `proxy.ts`:

```typescript
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_SEGMENTS = ["/dashboard", "/settings"];

function isProtected(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(en|hy|ru)/, "") || "/";
  return PROTECTED_SEGMENTS.some((seg) => withoutLocale.startsWith(seg));
}

export default auth((req) => {
  if (isProtected(req.nextUrl.pathname) && !req.auth) {
    const signInUrl = new URL("/en/auth/signin", req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 2: Commit**

```bash
git add proxy.ts
git commit -m "feat: add auth guard to middleware for dashboard and settings routes"
```

---

## Task 8: Auto-Save in Generate Route

**Files:**
- Modify: `app/api/generate/route.ts`

- [ ] **Step 1: Update the generate route to save prompts for authenticated users**

Add the following at the top of the import section in `app/api/generate/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
```

Then, in the `POST` function, after the line:
```typescript
return NextResponse.json({ result, model: CLAUDE_MODEL_NAME });
```

Replace it with:

```typescript
    // Save to DB if user is authenticated (fire-and-forget, doesn't block response)
    const session = await auth();
    if (session?.user?.id) {
      prisma.prompt
        .create({
          data: {
            userId: session.user.id,
            answers: body.answers as Record<string, string>,
            result,
            model: CLAUDE_MODEL_NAME,
          },
        })
        .catch((e: unknown) =>
          console.error("[Prompt] failed to save to DB:", e)
        );
    }

    return NextResponse.json({ result, model: CLAUDE_MODEL_NAME });
```

The full updated POST function will look like:

```typescript
export async function POST(req: NextRequest) {
  // Reject bodies over 64 KB
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 65536) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  let body: { answers: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!validateAnswers(body.answers)) {
    return NextResponse.json({ error: "Invalid answers payload" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Service not configured" }, { status: 503 });
  }

  const userMessage = buildUserMessage(body.answers);

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: CLAUDE_MODEL_ID,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });
    const block = msg.content[0];
    const result = block.type === "text" ? block.text : "";

    const answersText = Object.entries(body.answers)
      .filter(([, v]) => v && v.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    const telegramMessage = `📋 USER ANSWERS\n\n${answersText}\n\n${"─".repeat(30)}\n\n✨ GENERATED PROMPT\n\n${result}`;
    await sendToTelegram(telegramMessage).catch((e) => console.error("[Telegram] unexpected error:", e));

    // Save to DB if user is authenticated (fire-and-forget, doesn't block response)
    const session = await auth();
    if (session?.user?.id) {
      prisma.prompt
        .create({
          data: {
            userId: session.user.id,
            answers: body.answers as Record<string, string>,
            result,
            model: CLAUDE_MODEL_NAME,
          },
        })
        .catch((e: unknown) =>
          console.error("[Prompt] failed to save to DB:", e)
        );
    }

    return NextResponse.json({ result, model: CLAUDE_MODEL_NAME });
  } catch (err: unknown) {
    const isOverload =
      err instanceof Error && err.message.toLowerCase().includes("overload");
    const message = isOverload
      ? "The AI service is temporarily busy. Please try again in a moment."
      : "Generation failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/generate/route.ts
git commit -m "feat: auto-save generated prompts to db for authenticated users"
```

---

## Task 9: Prompt API Routes

**Files:**
- Create: `app/api/prompts/route.ts`
- Create: `app/api/prompts/[id]/route.ts`
- Create: `app/api/prompts/[id]/favorite/route.ts`

- [ ] **Step 1: Create GET /api/prompts (paginated history)**

Create `app/api/prompts/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 20;
  const favoritesOnly = searchParams.get("favorites") === "true";

  const [prompts, total] = await prisma.$transaction([
    prisma.prompt.findMany({
      where: {
        userId: session.user.id,
        ...(favoritesOnly ? { isFavorite: true } : {}),
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        result: true,
        model: true,
        isFavorite: true,
        createdAt: true,
      },
    }),
    prisma.prompt.count({
      where: {
        userId: session.user.id,
        ...(favoritesOnly ? { isFavorite: true } : {}),
      },
    }),
  ]);

  return NextResponse.json({ prompts, total, page, limit });
}
```

- [ ] **Step 2: Create DELETE /api/prompts/[id]**

Create `app/api/prompts/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership before deleting
  const prompt = await prisma.prompt.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!prompt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (prompt.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.prompt.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Create PATCH /api/prompts/[id]/favorite**

Create `app/api/prompts/[id]/favorite/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const prompt = await prisma.prompt.findUnique({
    where: { id },
    select: { userId: true, isFavorite: true },
  });

  if (!prompt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (prompt.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.prompt.update({
    where: { id },
    data: { isFavorite: !prompt.isFavorite },
    select: { isFavorite: true },
  });

  return NextResponse.json({ isFavorite: updated.isFavorite });
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/prompts/
git commit -m "feat: add prompt api routes (list, delete, toggle favorite)"
```

---

## Task 10: PromptCard Component

**Files:**
- Create: `components/dashboard/PromptCard.tsx`

- [ ] **Step 1: Create interactive PromptCard client component**

Create `components/dashboard/PromptCard.tsx`:

```typescript
"use client";

import { useState } from "react";

interface Prompt {
  id: string;
  result: string;
  model: string;
  isFavorite: boolean;
  createdAt: string;
}

export function PromptCard({ prompt }: { prompt: Prompt }) {
  const [expanded, setExpanded] = useState(false);
  const [favorite, setFavorite] = useState(prompt.isFavorite);
  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/favorite`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setFavorite(data.isFavorite);
      }
    } finally {
      setLoading(false);
    }
  }

  async function deletePrompt(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this prompt?")) return;
    const res = await fetch(`/api/prompts/${prompt.id}`, { method: "DELETE" });
    if (res.ok) setDeleted(true);
  }

  if (deleted) return null;

  const date = new Date(prompt.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const preview = prompt.result.slice(0, 160).trim();

  return (
    <div className="group rounded-xl border border-neutral-100 bg-white transition-colors hover:border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              {date}
            </p>
            <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
              {expanded ? prompt.result : `${preview}${prompt.result.length > 160 ? "…" : ""}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pt-4">
            <button
              onClick={toggleFavorite}
              disabled={loading}
              className={`rounded-lg p-1.5 transition-colors ${
                favorite
                  ? "text-amber-500"
                  : "text-neutral-300 hover:text-amber-400 dark:text-neutral-600 dark:hover:text-amber-400"
              }`}
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
            <button
              onClick={deletePrompt}
              className="rounded-lg p-1.5 text-neutral-300 transition-colors hover:text-red-400 dark:text-neutral-600 dark:hover:text-red-400"
              aria-label="Delete prompt"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/
git commit -m "feat: add PromptCard component with favorite and delete actions"
```

---

## Task 11: Dashboard Pages

**Files:**
- Create: `app/[locale]/dashboard/layout.tsx`
- Create: `app/[locale]/dashboard/page.tsx`
- Create: `app/[locale]/dashboard/history/page.tsx`
- Create: `app/[locale]/dashboard/favorites/page.tsx`

- [ ] **Step 1: Create dashboard layout**

Create `app/[locale]/dashboard/layout.tsx`:

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/en/auth/signin");

  const t = await getTranslations("dashboard");

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex gap-8">
        <aside className="w-44 shrink-0">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {t("overview")}
            </Link>
            <Link
              href="/dashboard/history"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {t("history")}
            </Link>
            <Link
              href="/dashboard/favorites"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {t("favorites")}
            </Link>
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create dashboard overview page**

Create `app/[locale]/dashboard/page.tsx`:

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { PromptCard } from "@/components/dashboard/PromptCard";
import { Link } from "@/i18n/routing";

export default async function DashboardPage() {
  const session = await auth();
  const t = await getTranslations("dashboard");

  const [prompts, total, favoriteCount] = await prisma.$transaction([
    prisma.prompt.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, result: true, model: true, isFavorite: true, createdAt: true },
    }),
    prisma.prompt.count({ where: { userId: session!.user.id } }),
    prisma.prompt.count({ where: { userId: session!.user.id, isFavorite: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {session!.user.name ?? session!.user.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{total}</p>
          <p className="mt-0.5 text-sm text-neutral-500">{t("totalPrompts")}</p>
        </div>
        <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{favoriteCount}</p>
          <p className="mt-0.5 text-sm text-neutral-500">{t("totalFavorites")}</p>
        </div>
      </div>

      {/* Recent prompts */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t("recentPrompts")}
          </h2>
          {total > 5 && (
            <Link
              href="/dashboard/history"
              className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              {t("viewAll")} →
            </Link>
          )}
        </div>
        {prompts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center dark:border-neutral-700">
            <p className="text-sm text-neutral-400 dark:text-neutral-500">{t("noPrompts")}</p>
            <Link
              href="/generator"
              className="mt-3 inline-block text-sm font-medium text-neutral-700 underline underline-offset-2 dark:text-neutral-300"
            >
              {t("generateFirst")}
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {prompts.map((p) => (
              <PromptCard
                key={p.id}
                prompt={{ ...p, createdAt: p.createdAt.toISOString() }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create history page**

Create `app/[locale]/dashboard/history/page.tsx`:

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { PromptCard } from "@/components/dashboard/PromptCard";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const t = await getTranslations("dashboard");
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const limit = 20;

  const [prompts, total] = await prisma.$transaction([
    prisma.prompt.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, result: true, model: true, isFavorite: true, createdAt: true },
    }),
    prisma.prompt.count({ where: { userId: session!.user.id } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        {t("history")}
      </h1>

      {prompts.length === 0 ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-500">{t("noPrompts")}</p>
      ) : (
        <>
          <div className="space-y-2">
            {prompts.map((p) => (
              <PromptCard
                key={p.id}
                prompt={{ ...p, createdAt: p.createdAt.toISOString() }}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <p className="text-sm text-neutral-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <a
                    href={`?page=${page - 1}`}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    Previous
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={`?page=${page + 1}`}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create favorites page**

Create `app/[locale]/dashboard/favorites/page.tsx`:

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { PromptCard } from "@/components/dashboard/PromptCard";

export default async function FavoritesPage() {
  const session = await auth();
  const t = await getTranslations("dashboard");

  const prompts = await prisma.prompt.findMany({
    where: { userId: session!.user.id, isFavorite: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, result: true, model: true, isFavorite: true, createdAt: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        {t("favorites")}
      </h1>

      {prompts.length === 0 ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-500">{t("noFavorites")}</p>
      ) : (
        <div className="space-y-2">
          {prompts.map((p) => (
            <PromptCard
              key={p.id}
              prompt={{ ...p, createdAt: p.createdAt.toISOString() }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/dashboard/"
git commit -m "feat: add dashboard layout, overview, history, and favorites pages"
```

---

## Task 12: Settings Page + User API Route

**Files:**
- Create: `app/[locale]/settings/page.tsx`
- Create: `app/api/user/route.ts`

- [ ] **Step 1: Create User API route (PATCH name, DELETE account)**

Create `app/api/user/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : undefined;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
    select: { name: true, email: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: session.user.id } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Create settings page**

Create `app/[locale]/settings/page.tsx`:

```typescript
"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const t = useTranslations("settings");
  const [name, setName] = useState(session?.user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!session) return null;

  async function handleNameUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await update({ name });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!confirm(t("deleteAccountConfirm"))) return;
    setDeleting(true);
    const res = await fetch("/api/user", { method: "DELETE" });
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="max-w-lg space-y-8">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {t("title")}
        </h1>

        {/* Profile */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t("profile")}
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-lg font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                (session.user.name?.[0] ?? session.user.email?.[0] ?? "?").toUpperCase()
              )}
            </div>
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {session.user.name ?? session.user.email}
              </p>
              <p className="text-sm text-neutral-500">{session.user.email}</p>
            </div>
          </div>

          <form onSubmit={handleNameUpdate} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t("displayName")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {saved ? t("saved") : saving ? t("saving") : t("saveChanges")}
            </button>
          </form>
        </section>

        {/* Danger zone */}
        <section className="space-y-3 rounded-xl border border-red-100 p-5 dark:border-red-900/30">
          <h2 className="text-sm font-medium text-red-700 dark:text-red-400">
            {t("dangerZone")}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t("deleteAccountDesc")}
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            {deleting ? t("deleting") : t("deleteAccount")}
          </button>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/settings/" app/api/user/
git commit -m "feat: add settings page with profile edit and account deletion"
```

---

## Task 13: i18n Keys

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/hy.json`
- Modify: `messages/ru.json`

- [ ] **Step 1: Add new keys to en.json**

Open `messages/en.json` and add these top-level namespaces before the closing `}`:

```json
  "auth": {
    "signIn": "Sign in",
    "signInSubtitle": "Save your prompts and access them anywhere",
    "signOut": "Sign out",
    "continueWithGoogle": "Continue with Google",
    "continueWithGitHub": "Continue with GitHub",
    "orContinueWith": "or continue with",
    "emailPlaceholder": "your@email.com",
    "sendMagicLink": "Send magic link",
    "checkYourEmail": "Check your email",
    "checkYourEmailDesc": "We sent a magic link to your email address. Click the link to sign in.",
    "termsNotice": "By signing in, you agree to our terms of service.",
    "errorDefault": "Something went wrong. Please try again.",
    "dashboard": "Dashboard",
    "settings": "Settings"
  },
  "dashboard": {
    "title": "Dashboard",
    "overview": "Overview",
    "history": "History",
    "favorites": "Favorites",
    "totalPrompts": "Total prompts",
    "totalFavorites": "Favorites",
    "recentPrompts": "Recent prompts",
    "viewAll": "View all",
    "noPrompts": "No prompts yet",
    "generateFirst": "Generate your first prompt →",
    "noFavorites": "No favorites yet — star a prompt to save it here"
  },
  "settings": {
    "title": "Settings",
    "profile": "Profile",
    "displayName": "Display name",
    "saveChanges": "Save changes",
    "saving": "Saving…",
    "saved": "Saved!",
    "dangerZone": "Danger zone",
    "deleteAccount": "Delete my account",
    "deleteAccountDesc": "Permanently delete your account and all your prompts. This cannot be undone.",
    "deleteAccountConfirm": "This will permanently delete your account and all your saved prompts. Are you sure?",
    "deleting": "Deleting…"
  }
```

Also add `"signIn": "Sign in"` to the `"nav"` namespace in `en.json`:
```json
  "nav": {
    "brand": "Website Prompt Generator",
    "getStarted": "Get started",
    "signIn": "Sign in"
  },
```

- [ ] **Step 2: Append placeholder keys to hy.json**

At the end of `messages/hy.json`, before the final `}`, add these new namespaces with English values as placeholders:

```json
  "auth": {
    "signIn": "Sign in",
    "signInSubtitle": "Save your prompts and access them anywhere",
    "signOut": "Sign out",
    "continueWithGoogle": "Continue with Google",
    "continueWithGitHub": "Continue with GitHub",
    "orContinueWith": "or continue with",
    "emailPlaceholder": "your@email.com",
    "sendMagicLink": "Send magic link",
    "checkYourEmail": "Check your email",
    "checkYourEmailDesc": "We sent a magic link to your email address. Click the link to sign in.",
    "termsNotice": "By signing in, you agree to our terms of service.",
    "errorDefault": "Something went wrong. Please try again.",
    "dashboard": "Dashboard",
    "settings": "Settings"
  },
  "dashboard": {
    "title": "Dashboard",
    "overview": "Overview",
    "history": "History",
    "favorites": "Favorites",
    "totalPrompts": "Total prompts",
    "totalFavorites": "Favorites",
    "recentPrompts": "Recent prompts",
    "viewAll": "View all",
    "noPrompts": "No prompts yet",
    "generateFirst": "Generate your first prompt →",
    "noFavorites": "No favorites yet — star a prompt to save it here"
  },
  "settings": {
    "title": "Settings",
    "profile": "Profile",
    "displayName": "Display name",
    "saveChanges": "Save changes",
    "saving": "Saving…",
    "saved": "Saved!",
    "dangerZone": "Danger zone",
    "deleteAccount": "Delete my account",
    "deleteAccountDesc": "Permanently delete your account and all your prompts. This cannot be undone.",
    "deleteAccountConfirm": "This will permanently delete your account and all your saved prompts. Are you sure?",
    "deleting": "Deleting…"
  }
```

Also add `"signIn": "Sign in"` to the `"nav"` namespace in `hy.json`.

- [ ] **Step 3: Append placeholder keys to ru.json**

Same keys as Step 2, appended to `messages/ru.json`.

- [ ] **Step 4: Commit**

```bash
git add messages/
git commit -m "feat: add auth, dashboard, and settings i18n keys"
```

---

## Task 14: Environment Setup and DB Migration

This task cannot be automated — it requires external service setup.

- [ ] **Step 1: Set up Neon Postgres**

1. Go to neon.tech and create a free account
2. Create a new project (choose a region close to your Vercel deployment)
3. In the Vercel dashboard: go to your project → Storage → Connect Database → Neon
4. This automatically adds `DATABASE_URL` and `DIRECT_URL` to your Vercel env vars
5. For local development, copy both values to `.env.local`

- [ ] **Step 2: Set up Google OAuth**

1. Go to console.cloud.google.com → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` and `https://yourdomain.com/api/auth/callback/google`
4. Add to `.env.local`:
   ```
   AUTH_GOOGLE_ID=your-client-id
   AUTH_GOOGLE_SECRET=your-client-secret
   ```

- [ ] **Step 3: Set up GitHub OAuth**

1. Go to github.com/settings/developers → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Add to `.env.local`:
   ```
   AUTH_GITHUB_ID=your-client-id
   AUTH_GITHUB_SECRET=your-client-secret
   ```

- [ ] **Step 4: Set up Resend (email magic links)**

1. Go to resend.com and create a free account
2. Create an API key
3. Verify your sending domain (or use `onboarding@resend.dev` for testing)
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxx
   AUTH_RESEND_FROM=noreply@yourdomain.com
   ```

- [ ] **Step 5: Generate AUTH_SECRET**

```bash
npx auth secret
```

Copy the generated secret to `.env.local`:
```
AUTH_SECRET=your-generated-secret
```

- [ ] **Step 6: Push schema to Neon**

```bash
npx prisma generate
npx prisma db push
```

Expected: "Your database is now in sync with your Prisma schema."

- [ ] **Step 7: Run the dev server and verify**

```bash
npm run dev
```

Manual verification checklist:
1. Visit `http://localhost:3000/en` — landing page loads, header shows "Sign in" button
2. Click "Sign in" → redirected to `/en/auth/signin`
3. Click "Continue with Google" → Google OAuth flow → signed in → redirected to `/en/dashboard`
4. Dashboard shows 0 prompts and stats
5. Visit `http://localhost:3000/en/generator` → generate a prompt
6. After generation, revisit dashboard → prompt appears in history
7. Star a prompt → gold star, appears in Favorites tab
8. Delete a prompt → disappears from list
9. Visit Settings → name editable, save works
10. Click "Sign out" → redirected to home, header shows "Sign in" again
11. Visit `http://localhost:3000/en/dashboard` while signed out → redirected to sign-in

- [ ] **Step 8: Build check**

```bash
npm run build
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 9: Commit**

```bash
git add .env.example  # add new env var names (NOT values) to the example file
git commit -m "chore: add new env var names to .env.example for auth and db setup"
```

---

## Task 15: Write Spec Doc

**Files:**
- Create: `docs/superpowers/specs/2026-06-22-auth-user-accounts-design.md`

- [ ] **Step 1: Copy the approved spec**

The spec content is in `/Users/artagersgrigoryangmail.com/.claude/plans/session-1-typed-marble.md`. Copy it to the project:

```bash
cp /Users/artagersgrigoryangmail.com/.claude/plans/session-1-typed-marble.md \
   /Users/artagersgrigoryangmail.com/Documents/website-prompt-generator/docs/superpowers/specs/2026-06-22-auth-user-accounts-design.md
```

- [ ] **Step 2: Commit**

```bash
git add docs/
git commit -m "docs: add auth and user accounts design spec"
```
