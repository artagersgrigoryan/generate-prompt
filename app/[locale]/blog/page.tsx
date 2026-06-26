import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getAllPosts, getAllCategories } from "@/lib/blog";
import { buildAlternates } from "@/app/[locale]/layout";
import { PostCard } from "@/components/blog/PostCard";
import { CategoryStrip } from "@/components/blog/CategoryStrip";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base = buildAlternates(locale, "/blog");
  return {
    title: "Blog — Career Writing Guides & AI Tips",
    description:
      "Practical guides on cover letters, LinkedIn profiles, cold emails, resume writing, and using AI tools to land interviews and win clients.",
    alternates: {
      ...base,
      types: { "application/rss+xml": "/rss.xml" },
    },
  };
}

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
          Career Writing Guides
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Practical guides on cover letters, LinkedIn profiles, cold emails, resume bullets, and using AI writing tools.
        </p>

        {categories.length > 0 && (
          <CategoryStrip categories={categories} />
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
