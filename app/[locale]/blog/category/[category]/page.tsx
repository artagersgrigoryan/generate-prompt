import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  getAllCategories,
  getPostsByCategory,
  getCategoryLabel,
} from "@/lib/blog";
import { routing } from "@/i18n/routing";
import { buildAlternates } from "@/app/[locale]/layout";
import { PostCard } from "@/components/blog/PostCard";

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
    title: `${label} — Blog`,
    description: `Blog posts about ${label}.`,
    alternates: buildAlternates(locale, `/blog/category/${category}`),
  };
}

const activePill =
  "rounded-full border border-neutral-900 bg-neutral-900 px-3 py-1 text-sm text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900";
const inactivePill =
  "rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-600 transition-colors hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500";

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
      <div className="mx-auto max-w-2xl">
        <Link
          href="/blog"
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          ← All posts
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {label}
        </h1>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/blog" className={inactivePill}>
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/blog/category/${cat}`}
              className={cat === category ? activePill : inactivePill}
            >
              {getCategoryLabel(cat)}
            </Link>
          ))}
        </div>

        <ul className="mt-2 divide-y divide-neutral-100 dark:divide-neutral-800">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} locale={locale} showCategory={false} />
          ))}
        </ul>
      </div>
    </main>
  );
}
