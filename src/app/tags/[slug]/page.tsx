import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public-header";
import { ListMessage, PostList } from "@/components/post-list";
import { fetchTag, fetchTags, PublicApiError, searchPublishedPosts, tagUrl } from "@/lib/public-api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const tag = await fetchTag(slug);
    const title = `#${tag.name} - biyeon.log`;
    const description = tag.description || `${tag.name} 태그로 묶인 블로그 글 목록입니다.`;
    return {
      title, description,
      alternates: { canonical: tagUrl(tag) },
      openGraph: { title, description, url: tagUrl(tag), siteName: "biyeon.log", type: "website" },
      twitter: { card: "summary_large_image", title, description },
    };
  } catch {
    return { title: "태그를 불러올 수 없습니다 - biyeon.log" };
  }
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await fetchTag(slug).catch((error: unknown) => {
    if (error instanceof PublicApiError && error.status === 404) notFound();
    throw error;
  });
  const [posts, tags] = await Promise.all([
    searchPublishedPosts({ tag: tag.name }),
    fetchTags().catch(() => [tag]),
  ]);

  return (
    <div className="blog-surface">
      <PublicHeader />
      <main className="blog-container blog-tag-page">
        <Link className="blog-back-link" href="/#posts">글 목록으로</Link>
        <h1 className="blog-page-title">#{tag.name}</h1>
        {tag.description ? <p className="blog-page-description">{tag.description}</p> : null}
        <section className="blog-results" aria-labelledby="tag-posts-heading">
          <div className="blog-section-heading">
            <h2 id="tag-posts-heading">태그에 담긴 글</h2><span>{posts.length}개의 글</span>
          </div>
          {posts.length > 0 ? <PostList posts={posts} tags={tags} /> : <ListMessage>아직 이 태그의 공개 글이 없습니다.</ListMessage>}
        </section>
      </main>
    </div>
  );
}
