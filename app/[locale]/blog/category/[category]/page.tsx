import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getAllCategories, getPostsByCategory, getCategoryLabel } from "@/lib/blog";
import { buildBlogAlternates } from "@/app/[locale]/layout";
import { PostCard } from "@/components/blog/PostCard";
import { CategoryStrip } from "@/components/blog/CategoryStrip";

// The blog has no per-locale translations, so only the /en pages are built;
// hy/ru requests 301 to the /en equivalent before reaching this route (see
// next.config.ts) and never need a static page of their own.
export function generateStaticParams() {
  return getAllCategories().map((category) => ({ locale: "en", category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const label = getCategoryLabel(category);
  return {
    title: `${label} — Guides & Tips`,
    description: `Practical guides on ${label.toLowerCase()} — tips, templates, and examples to get better results faster.`,
    alternates: buildBlogAlternates(`/blog/category/${category}`),
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  setRequestLocale(locale);

  const posts = getPostsByCategory(category);
  if (posts.length === 0) notFound();

  const categories = getAllCategories();
  const label = getCategoryLabel(category);

  return (
    <main className="min-h-screen bg-white px-6 py-16 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            className="shrink-0 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            ←
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {label}
          </h1>
        </div>

        <CategoryStrip categories={categories} activeCategory={category} />

        <ul className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} locale={locale} showCategory={false} />
          ))}
        </ul>
      </div>
    </main>
  );
}
