/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  Eye,
  Heart,
  Map,
  MessageCircle,
  Terminal,
} from "lucide-react";

import {
  BLOG_CATEGORIES,
  getPublishedPosts,
  type BlogCategory,
  type Post,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const categoryMeta: Record<
  BlogCategory,
  { icon: typeof Map; description: string }
> = {
  라이프로그: {
    icon: Map,
    description: "여행, 일상, 경험을 남기는 개인 기록",
  },
  "북 노트": {
    icon: BookOpen,
    description: "책을 읽고 오래 가져갈 생각을 정리",
  },
  "기술 노트": {
    icon: Code2,
    description: "개발 기록, 기술 리뷰, 시행착오",
  },
  비즈니스: {
    icon: BriefcaseBusiness,
    description: "사업 아이디어, 시장 관찰, 제품화 과정",
  },
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState<BlogCategory | "all">("all");
  const postsQuery = useQuery({
    queryKey: ["posts", "published"],
    queryFn: getPublishedPosts,
  });

  const posts = useMemo(() => postsQuery.data ?? [], [postsQuery.data]);
  const filteredPosts = useMemo(() => {
    if (selectedCategory === "all") {
      return posts;
    }
    return posts.filter((post) => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  const featuredPost = filteredPosts[0];
  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);

  return (
    <main className="min-h-screen bg-[#f5f2ec] text-[#191714]">
      <header className="sticky top-0 z-20 border-b border-[#d4cec2] bg-[#f5f2ec]/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold"
            href="/"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-[#182824] text-[#f7f3ea]">
              <Terminal className="size-4" />
            </span>
            biyeon.log
          </Link>
          <Link
            className="rounded-md border border-[#b9b09f] px-3 py-2 text-sm text-[#4a453b] transition-colors hover:bg-white"
            href="/admin"
          >
            Admin
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-[#3f6f5d]">
            Life, books, code, business
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-none text-[#171411] sm:text-6xl">
            직접 겪고 읽고 만들며 배운 것을 기록합니다.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5b554b]">
            라이프로그, 북 노트, 기술 노트, 비즈니스를 한 곳에 쌓는 개인
            블로그입니다.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat label="글" value={posts.length} />
            <Stat label="조회" value={totalViews} />
            <Stat label="좋아요" value={totalLikes} />
          </div>
        </div>

        <FeaturedPost isLoading={postsQuery.isLoading} post={featuredPost} />
      </section>

      <section className="border-y border-[#d4cec2] bg-[#fffdf8]">
        <div className="mx-auto grid w-full max-w-6xl gap-3 px-5 py-5 md:grid-cols-5">
          <CategoryButton
            active={selectedCategory === "all"}
            label="전체"
            onClick={() => setSelectedCategory("all")}
          />
          {BLOG_CATEGORIES.map((category) => (
            <CategoryButton
              active={selectedCategory === category}
              key={category}
              label={category}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {BLOG_CATEGORIES.map((category) => {
            const meta = categoryMeta[category];
            return (
              <article
                className="rounded-lg border border-[#d4cec2] bg-[#fffdf8] p-5"
                key={category}
              >
                <div className="flex size-10 items-center justify-center rounded-md bg-[#182824] text-[#f7f3ea]">
                  <meta.icon className="size-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold">{category}</h2>
                <p className="mt-3 text-sm leading-6 text-[#5b554b]">
                  {meta.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-16">
        <div className="mb-6 flex items-end justify-between gap-4 border-b border-[#d4cec2] pb-4">
          <div>
            <p className="font-mono text-xs text-[#6f6658]">latest</p>
            <h2 className="mt-2 text-3xl font-semibold">최근 글</h2>
          </div>
          {postsQuery.isFetching ? (
            <p className="text-sm text-[#6f6658]">불러오는 중...</p>
          ) : null}
        </div>

        {postsQuery.isError ? (
          <EmptyState message="글 목록을 불러오지 못했습니다." />
        ) : filteredPosts.length > 0 ? (
          <div className="divide-y divide-[#d4cec2] border-y border-[#d4cec2]">
            {filteredPosts.map((post) => (
              <PostListItem key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState message="아직 공개된 글이 없습니다." />
        )}
      </section>
    </main>
  );
}

function FeaturedPost({
  isLoading,
  post,
}: {
  isLoading: boolean;
  post?: Post;
}) {
  if (isLoading) {
    return (
      <aside className="rounded-lg border border-[#d4cec2] bg-[#fffdf8] p-6">
        <p className="text-sm text-[#6f6658]">대표 글을 불러오는 중...</p>
      </aside>
    );
  }

  if (!post) {
    return (
      <aside className="rounded-lg border border-[#d4cec2] bg-[#fffdf8] p-6">
        <p className="font-mono text-xs text-[#6f6658]">featured</p>
        <h2 className="mt-4 text-2xl font-semibold">첫 글을 기다리는 중</h2>
        <p className="mt-3 text-sm leading-6 text-[#5b554b]">
          관리자에서 글을 발행하면 이 영역에 최신 글이 표시됩니다.
        </p>
      </aside>
    );
  }

  return (
    <Link
      className="group overflow-hidden rounded-lg border border-[#182824] bg-[#fffdf8] shadow-[6px_6px_0_#182824]"
      href={`/posts/${post.slug}`}
    >
      {post.coverImage ? (
        <img
          alt=""
          className="aspect-[16/9] w-full object-cover"
          src={post.coverImage}
        />
      ) : (
        <div className="aspect-[16/9] w-full bg-[#dfe8df]" />
      )}
      <div className="p-6">
        <p className="font-mono text-xs text-[#3f6f5d]">{post.category}</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight">
          {post.title}
        </h2>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#5b554b]">
          {post.summary || post.content}
        </p>
        <div className="mt-6 flex items-center justify-between gap-4">
          <Engagement post={post} />
          <span className="flex size-10 items-center justify-center rounded-md bg-[#182824] text-[#f7f3ea] transition-transform group-hover:-translate-y-0.5">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CategoryButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "h-11 rounded-md border px-3 text-sm font-medium transition-colors",
        active
          ? "border-[#182824] bg-[#182824] text-[#f7f3ea]"
          : "border-[#d4cec2] bg-[#f5f2ec] text-[#4a453b] hover:bg-white",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function PostListItem({ post }: { post: Post }) {
  return (
    <Link
      className="group grid gap-5 py-6 md:grid-cols-[128px_1fr_120px] md:items-center"
      href={`/posts/${post.slug}`}
    >
      <div className="font-mono text-xs text-[#6f6658]">
        <p>{formatDate(post.publishedAt ?? post.createdAt)}</p>
        <p className="mt-2">{post.category}</p>
      </div>
      <div>
        <h3 className="text-2xl font-semibold leading-tight transition-colors group-hover:text-[#2f6f5b]">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-[#5b554b]">
          {post.summary || post.content}
        </p>
        <div className="mt-4">
          <Engagement post={post} />
        </div>
      </div>
      <div className="hidden justify-end md:flex">
        <span className="flex size-10 items-center justify-center rounded-md border border-[#d4cec2] bg-[#fffdf8] transition-colors group-hover:bg-[#182824] group-hover:text-[#f7f3ea]">
          <ArrowUpRight className="size-5" />
        </span>
      </div>
    </Link>
  );
}

function Engagement({ post }: { post: Post }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6f6658]">
      <span className="inline-flex items-center gap-1">
        <Eye className="size-3.5" />
        {post.views}
      </span>
      <span className="inline-flex items-center gap-1">
        <Heart className="size-3.5" />
        {post.likes}
      </span>
      <span className="inline-flex items-center gap-1">
        <MessageCircle className="size-3.5" />
        댓글
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#d4cec2] bg-[#fffdf8] p-4">
      <p className="text-sm text-[#6f6658]">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[#d4cec2] bg-[#fffdf8] p-8 text-center text-sm text-[#6f6658]">
      {message}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
