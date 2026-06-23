import { Link } from "@/i18n/routing";
import { getCategoryLabel } from "@/lib/blog";
import type { PostMeta } from "@/lib/blog";

interface PostCardProps {
  post: PostMeta;
  locale: string;
  /** Show the category badge. Pass false when the category is already stated in the page heading. */
  showCategory?: boolean;
}

export function PostCard({ post, locale, showCategory = true }: PostCardProps) {
  const category = post.category ?? "general";
  const categoryLabel = getCategoryLabel(category);

  return (
    <li className="group py-8">
      {/* Meta row: category · date · reading time */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {showCategory && (
          <Link
            href={`/blog/category/${category}`}
            className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            {categoryLabel}
          </Link>
        )}
        {showCategory && (
          <span className="text-neutral-300 dark:text-neutral-600">·</span>
        )}
        <time
          dateTime={post.date}
          className="text-xs font-medium uppercase tracking-wide text-neutral-400"
        >
          {new Date(post.date).toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <span className="text-neutral-300 dark:text-neutral-600">·</span>
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          {post.readingTime} min read
        </span>
      </div>

      {/* Title */}
      <Link href={`/blog/${post.slug}`} className="block">
        <h2 className="mt-2 text-xl font-semibold text-neutral-900 transition-colors group-hover:text-neutral-600 dark:text-neutral-100 dark:group-hover:text-neutral-300">
          {post.title}
        </h2>
      </Link>

      {/* Description — truncated to 2 lines */}
      {post.description && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {post.description}
        </p>
      )}
    </li>
  );
}
