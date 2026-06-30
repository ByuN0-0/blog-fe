import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Terminal } from "lucide-react";
import { notFound } from "next/navigation";

import {
  fetchTag,
  searchPublishedPosts,
  SITE_URL,
  tagUrl,
} from "@/lib/public-api";
import type { Post } from "@/lib/blog-types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const tag = await fetchTag(slug);
    const title = `#${tag.name} - biyeon.log`;
    const description =
      tag.description || `${tag.name} 태그로 묶인 블로그 글 목록입니다.`;

    return {
      title,
      description,
      alternates: { canonical: tagUrl(tag) },
      openGraph: {
        title,
        description,
        url: tagUrl(tag),
        siteName: "biyeon.log",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return { title: "태그를 찾을 수 없습니다 - biyeon.log" };
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let tag;
  try {
    tag = await fetchTag(slug);
  } catch {
    notFound();
  }
  const posts = await searchPublishedPosts({ tag: tag.name });

  return (
    <main className="min-h-screen bg-[#f6f3eb] text-[#24211b] [background-image:linear-gradient(#e5ded1_1px,transparent_1px),linear-gradient(90deg,#e5ded1_1px,transparent_1px)] [background-size:28px_28px]">
      <header className="sticky top-0 z-20 border-b border-[#d7d0c1] bg-[#f6f3eb]/92 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
          <Link className="inline-flex items-center gap-2 font-mono text-sm font-semibold" href="/">
            <span className="flex size-8 items-center justify-center rounded-md border border-[#bdb4a4] bg-[#2b2924] text-[#fffdf7]">
              <Terminal className="size-4" />
            </span>
            <span>biyeon.log</span>
          </Link>
          <Link className="inline-flex items-center gap-2 font-mono text-xs text-[#6f685d] hover:text-[#315f50]" href="/">
            <ArrowLeft className="size-4" />
            home
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-5 py-10">
        <p className="font-mono text-xs text-[#6f685d]">{SITE_URL}/tags/{tag.slug}</p>
        <h1 className="mt-3 text-4xl font-semibold">#{tag.name}</h1>
        {tag.description ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#5f5a50]">
            {tag.description}
          </p>
        ) : null}

        <section className="mt-8 overflow-hidden rounded-md border border-[#d7d0c1] bg-[#fffdf7]/92">
          {posts.length > 0 ? (
            posts.map((post) => <PostRow key={post.id} post={post} />)
          ) : (
            <p className="p-8 text-center font-mono text-sm text-[#6f685d]">
              아직 이 태그의 공개 글이 없습니다.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

function PostRow({ post }: { post: Post }) {
  return (
    <article className="border-b border-[#d7d0c1] p-5 last:border-b-0">
      <p className="font-mono text-xs text-[#6f685d]">
        {post.category} / {formatDate(post.publishedAt ?? post.createdAt)}
      </p>
      <Link href={`/posts/${post.slug}`}>
        <h2 className="mt-3 text-2xl font-semibold hover:text-[#315f50]">
          {post.title}
        </h2>
      </Link>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#5f5a50]">
        {post.summary || post.content}
      </p>
      <Link
        className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-[#6f685d] hover:text-[#315f50]"
        href={`/posts/${post.slug}`}
      >
        read
        <ArrowUpRight className="size-3.5" />
      </Link>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
