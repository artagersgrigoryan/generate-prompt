import type { Metadata } from "next";
import React, { isValidElement, type ComponentPropsWithoutRef } from "react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Link } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { getAllPosts, getPostBySlug, getCategoryLabel, getReadingTime } from "@/lib/blog";
import { BlogCover } from "@/components/blog/BlogCover";
import { buildAlternates } from "@/app/[locale]/layout";
import { SITE_URL } from "@/lib/site-url";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllPosts().map((post) => ({ locale, slug: post.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: {
      ...buildAlternates(locale, `/blog/${slug}`),
      types: { "application/rss+xml": "/rss.xml" },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

// Minimal styled element map so MDX renders cleanly without a typography plugin.
const mdxComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-10 text-2xl font-bold text-neutral-900 dark:text-neutral-100" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-8 text-xl font-semibold text-neutral-900 dark:text-neutral-100" {...props} />
  ),
  p: ({ children }: ComponentPropsWithoutRef<"p">) => {
    // Detect standalone CTA links (sole child is a link to a tool page)
    const childEl = isValidElement<{ href?: string; children?: React.ReactNode }>(children)
      ? children
      : null;
    const isCta = childEl !== null && typeof childEl.props.href === "string" && childEl.props.href.includes("/tools/");

    if (isCta) {
      return (
        <div className="mt-8">
          <a
            href={childEl!.props.href}
            className="group inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:gap-3 hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            {childEl!.props.children}
          </a>
        </div>
      );
    }

    return <p className="mt-4 leading-relaxed text-neutral-700 dark:text-neutral-300">{children}</p>;
  },
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="mt-4 list-disc space-y-1.5 pl-6 text-neutral-700 dark:text-neutral-300" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="mt-4 list-decimal space-y-1.5 pl-6 text-neutral-700 dark:text-neutral-300" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a className="font-medium text-neutral-900 underline underline-offset-2 dark:text-neutral-100" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200" {...props} />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm text-neutral-700 dark:text-neutral-300" {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead className="border-b border-neutral-200 dark:border-neutral-700" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th className="px-4 py-2.5 text-left font-semibold text-neutral-900 dark:text-neutral-100" {...props} />
  ),
  tr: (props: ComponentPropsWithoutRef<"tr">) => (
    <tr className="border-b border-neutral-100 dark:border-neutral-800 last:border-0" {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="px-4 py-2.5 align-top" {...props} />
  ),
  img: (props: ComponentPropsWithoutRef<"img">) => (
    <img
      className="mt-8 w-full rounded-xl border border-neutral-200 dark:border-neutral-800"
      loading="lazy"
      {...props}
    />
  ),
  figure: (props: ComponentPropsWithoutRef<"figure">) => (
    <figure className="mt-8 space-y-2" {...props} />
  ),
  figcaption: (props: ComponentPropsWithoutRef<"figcaption">) => (
    <figcaption className="text-center text-xs text-neutral-400 dark:text-neutral-500" {...props} />
  ),
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPostBySlug(slug);
  if (!post) notFound();

  const category = post.category ?? "general";
  const categoryLabel = getCategoryLabel(category);
  const readingTime = getReadingTime(post.content);

  const siteUrl = SITE_URL ?? "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author,
          ...(siteUrl ? { url: `${siteUrl}/en/blog/author/artagers-grigoryan` } : {}),
        }
      : undefined,
    ...(siteUrl
      ? {
          url: `${siteUrl}/${locale}/blog/${slug}`,
          image: `${siteUrl}/${locale}/blog/${slug}/opengraph-image`,
        }
      : {}),
  };

  return (
    <main className="min-h-screen bg-white px-6 py-16 dark:bg-neutral-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-2xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/blog" className="transition-colors hover:text-neutral-700 dark:hover:text-neutral-200">
            Blog
          </Link>
          <span>/</span>
          <Link
            href={`/blog/category/${category}`}
            className="transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            {categoryLabel}
          </Link>
        </nav>

        {/* Date + reading time */}
        <div className="mt-4 flex items-center gap-2 text-sm text-neutral-400">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span className="text-neutral-300 dark:text-neutral-600">·</span>
          <span>{readingTime} min read</span>
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {post.title}
        </h1>

        {/* Description / subtitle */}
        {post.description && (
          <p className="mt-3 text-lg leading-relaxed text-neutral-500 dark:text-neutral-400">
            {post.description}
          </p>
        )}

        {/* Author + category */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {post.author && (
            <div className="flex items-center gap-2">
              <img
                src="/authors/artagers.jpg"
                alt={post.author}
                className="h-7 w-7 rounded-full object-cover"
              />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {post.author}
              </span>
            </div>
          )}
          <Link
            href={`/blog/category/${category}`}
            className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            {categoryLabel}
          </Link>
        </div>

        <BlogCover slug={slug} title={post.title} className="mt-8 aspect-[2/1] w-full rounded-2xl" />

        <div className="mt-10">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>
      </article>
    </main>
  );
}
