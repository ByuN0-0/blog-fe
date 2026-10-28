import Link from "next/link";
import type { Tag } from "@/lib/blog-types";
import { tagHref } from "@/lib/blog-navigation";

export function PostTags({ names, tags, limit = 2, expandable = false }: {
  names: string[]; tags: Tag[]; limit?: number; expandable?: boolean;
}) {
  if (names.length === 0) return null;
  const remaining = names.slice(limit);
  const links = (items: string[]) => items.map((name) => (
    <Link className="blog-tag" href={tagHref(name, tags)} key={name}>#{name}</Link>
  ));
  return (
    <div className="blog-post-tags">
      {links(names.slice(0, limit))}
      {expandable && remaining.length > 0 ? (
        <details className="blog-more-tags">
          <summary>태그 더보기 <span>({remaining.length})</span></summary>
          <div className="blog-post-tags">{links(remaining)}</div>
        </details>
      ) : null}
    </div>
  );
}
