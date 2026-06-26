import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getAllCategories, getPostsByCategory, getCategoryLabel } from "@/lib/blog";
import { routing } from "@/i18n/routing";
import { buildAlternates } from "@/app/[locale]/layout";
import { PostCard } from "@/components/blog/PostCard";
import { CategoryStrip } from "@/components/blog/CategoryStrip";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllCategories().map((category) => ({ locale, category }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const label = getCategoryLabel(category);
  return {
    title: `${label} — Guides & Tips`,
    description: `Practical guides on ${label.toLowerCase()} — tips, templates, and examples to get better results faster.`,
    alternates: buildAlternates(locale, `/blog/category/${category}`),
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
