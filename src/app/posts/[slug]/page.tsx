import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostDetailClient } from "@/app/posts/[slug]/post-detail-client";
import { fetchPublishedPost, postUrl, SITE_URL } from "@/lib/public-api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await fetchPublishedPost(slug);
    const title = post.metaTitle || `${post.title} - biyeon.log`;
    const description =
      post.metaDescription ||
      post.summary ||
      post.content.replace(/\s+/g, " ").slice(0, 150);
    const url = postUrl(post);
    const images = [
      post.coverImage || `${SITE_URL}/posts/${post.slug}/opengraph-image`,
    ];

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        siteName: "biyeon.log",
        type: "article",
        publishedTime: post.publishedAt ?? post.createdAt,
        modifiedTime: post.updatedAt,
        images,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images,
      },
    };
  } catch {
    return { title: "글을 찾을 수 없습니다 - biyeon.log" };
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post;
  try {
    post = await fetchPublishedPost(slug);
  } catch {
    notFound();
  }

  return <PostDetailClient initialPost={post} slug={slug} />;
}
