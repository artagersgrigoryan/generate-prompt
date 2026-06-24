import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getAllPosts, getAllCategories, getCategoryLabel } from "@/lib/blog";
import { buildAlternates } from "@/app/[locale]/layout";
import { PostCard } from "@/components/blog/PostCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = buildAlternates(locale, "/blog");
  return {
    title: "Blog",
    description: "Guides, updates, and tips from the team.",
    alternates: {
      ...base,
      types: { "application/rss+xml": "/rss.xml" },
    },
  };
}

const activePill =
  "rounded-full border border-neutral-900 bg-neutral-900 px-3 py-1 text-sm text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900";
const inactivePill =
  "rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-600 transition-colors hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500";

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const posts = getAllPosts();
  const categories = getAllCategories();

  return (
    <main className="min-h-screen bg-white px-6 py-16 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Blog
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Guides on AI website building, prompt writing, and using AI builders.
        </p>

        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <span className={activePill}>All</span>
            {categories.map((cat) => (
              <Link key={cat} href={`/blog/category/${cat}`} className={inactivePill}>
                {getCategoryLabel(cat)}
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <p className="mt-6 text-neutral-500 dark:text-neutral-400">
            No posts yet — check back soon.
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard
                key={post.slug}
                post={post}
                locale={locale}
                showCategory={categories.length > 1}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
