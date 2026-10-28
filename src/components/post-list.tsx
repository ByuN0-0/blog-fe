/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Post, Tag } from "@/lib/blog-types";
import { formatPostDate } from "@/lib/blog-navigation";
import { PostTags } from "@/components/post-tags";

export function PostList({ posts, tags }: { posts: Post[]; tags: Tag[] }) {
  return (
    <div className="blog-post-list">
      {posts.map((post) => (
        <article className={`blog-post-row${post.coverImage ? " has-image" : ""}`} key={post.id}>
          <div className="blog-post-copy">
            <div className="blog-post-meta">
              <time dateTime={post.publishedAt ?? post.createdAt}>{formatPostDate(post.publishedAt ?? post.createdAt)}</time>
              <span>{post.category}</span>
            </div>
            <h3 className="blog-post-title"><Link href={`/posts/${post.slug}`}>{post.title}</Link></h3>
            <p className="blog-post-summary">{post.summary || post.content}</p>
            <PostTags names={post.tags} tags={tags} />
          </div>
          {post.coverImage ? (
            <Link className="blog-post-thumbnail" href={`/posts/${post.slug}`} aria-label={`${post.title} 읽기`}>
              <img alt="" src={post.coverImage} loading="lazy" />
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function ListMessage({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return <div className="blog-list-message" role={error ? "alert" : "status"}>{children}</div>;
}
