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
  { command: string; icon: typeof Map; description: string }
> = {
  라이프로그: {
    command: "tail -f life.log",
    icon: Map,
    description: "여행, 일상, 경험을 남기는 개인 기록",
  },
  "북 노트": {
    command: "cat books/*.md",
    icon: BookOpen,
    description: "책을 읽고 오래 가져갈 생각을 정리",
  },
  "기술 노트": {
    command: "grep -R lessons src",
    icon: Code2,
    description: "개발 기록, 기술 리뷰, 시행착오",
  },
  비즈니스: {
    command: "ship --market",
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

  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);

  return (
    <main className="min-h-screen bg-[#f6f3eb] text-[#24211b] [background-image:linear-gradient(#e5ded1_1px,transparent_1px),linear-gradient(90deg,#e5ded1_1px,transparent_1px)] [background-size:28px_28px]">
      <header className="sticky top-0 z-20 border-b border-[#d7d0c1] bg-[#f6f3eb]/92 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5">
          <Link
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold"
            href="/"
          >
            <span className="flex size-8 items-center justify-center rounded-md border border-[#bdb4a4] bg-[#2b2924] text-[#fffdf7]">
              <Terminal className="size-4" />
            </span>
            <span>biyeon.log</span>
          </Link>
          <Link
            className="rounded-md border border-[#cbc3b4] bg-[#fffdf7] px-3 py-2 font-mono text-xs text-[#5f5a50] transition-colors hover:border-[#315f50] hover:text-[#315f50]"
            href="/admin"
          >
            /admin
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-5 py-10">
        <section className="border-b border-[#d7d0c1] pb-8">
          <p className="font-mono text-xs text-[#6f685d]">
            /home/biyeon/blog
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-[#24211b] sm:text-5xl">
            읽고, 만들고, 운영하며 남긴 기록
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#5f5a50]">
            라이프로그, 북 노트, 기술 노트, 비즈니스 글을 차분하게 쌓는
            개인 블로그입니다.
          </p>
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_270px]">
          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-[#6f685d]">
                  {selectedCategory === "all"
                    ? "all posts"
                    : categoryMeta[selectedCategory].command}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#24211b]">
                  {selectedCategory === "all" ? "최근 글" : selectedCategory}
                </h2>
              </div>
              {postsQuery.isFetching ? (
                <p className="font-mono text-xs text-[#6f685d]">fetching...</p>
              ) : null}
            </div>

            {postsQuery.isError ? (
              <EmptyState message="글 목록을 불러오지 못했습니다." />
            ) : filteredPosts.length > 0 ? (
              <div className="overflow-hidden rounded-md border border-[#d7d0c1] bg-[#fffdf7]/92">
                {filteredPosts.map((post, index) => (
                  <PostPreview index={index + 1} key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptyState message="아직 공개된 글이 없습니다." />
            )}
          </section>

          <Sidebar
            onSelectCategory={setSelectedCategory}
            posts={posts}
            selectedCategory={selectedCategory}
            totalLikes={totalLikes}
            totalViews={totalViews}
          />
        </div>
      </div>
    </main>
  );
}

function Sidebar({
  onSelectCategory,
  posts,
  selectedCategory,
  totalLikes,
  totalViews,
}: {
  onSelectCategory: (category: BlogCategory | "all") => void;
  posts: Post[];
  selectedCategory: BlogCategory | "all";
  totalLikes: number;
  totalViews: number;
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <section className="rounded-md border border-[#d7d0c1] bg-[#fffdf7]/92 p-4">
        <h2 className="font-mono text-xs text-[#6f685d]">categories</h2>
        <div className="mt-4 space-y-2">
          <CategoryButton
            active={selectedCategory === "all"}
            count={posts.length}
            label="전체"
            onClick={() => onSelectCategory("all")}
          />
          {BLOG_CATEGORIES.map((category) => {
            const meta = categoryMeta[category];
            const count = posts.filter((post) => post.category === category)
              .length;
            return (
              <CategoryButton
                active={selectedCategory === category}
                count={count}
                icon={meta.icon}
                key={category}
                label={category}
                onClick={() => onSelectCategory(category)}
              />
            );
          })}
        </div>
      </section>

      <section className="rounded-md border border-[#d7d0c1] bg-[#fffdf7]/92 p-4">
        <h2 className="font-mono text-xs text-[#6f685d]">status</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <Stat label="posts" value={posts.length} />
          <Stat label="views" value={totalViews} />
          <Stat label="likes" value={totalLikes} />
        </dl>
      </section>
    </aside>
  );
}

function CategoryButton({
  active,
  count,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  icon?: typeof Map;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex h-10 w-full items-center justify-between gap-3 rounded-md border px-3 text-left text-sm transition-colors",
        active
          ? "border-[#2b2924] bg-[#2b2924] text-[#fffdf7]"
          : "border-[#cbc3b4] bg-[#f6f3eb] text-[#4c473f] hover:border-[#315f50] hover:text-[#315f50]",
      )}
      onClick={onClick}
      type="button"
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        {Icon ? <Icon className="size-4 shrink-0" /> : null}
        <span className="truncate">{label}</span>
      </span>
      <span className="font-mono text-xs opacity-70">{count}</span>
    </button>
  );
}

function PostPreview({ index, post }: { index: number; post: Post }) {
  return (
    <article className="border-b border-[#d7d0c1] last:border-b-0">
      <Link
        className={cn(
          "group grid gap-5 px-5 py-6 transition-colors hover:bg-[#f0eadf]",
          post.coverImage && "md:grid-cols-[minmax(0,1fr)_168px]",
        )}
        href={`/posts/${post.slug}`}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#6f685d]">
            <span>#{String(index).padStart(2, "0")}</span>
            <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
            <span className="text-[#315f50]">{post.category}</span>
          </div>
          <h3 className="mt-3 text-2xl font-semibold leading-tight text-[#24211b] transition-colors group-hover:text-[#315f50]">
            {post.title}
          </h3>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#5f5a50]">
            {post.summary || post.content}
          </p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <Engagement post={post} />
            <span className="inline-flex items-center gap-1 font-mono text-xs text-[#6f685d] transition-colors group-hover:text-[#315f50]">
              read
              <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </div>
        {post.coverImage ? (
          <img
            alt=""
            className="aspect-[4/3] w-full rounded-md border border-[#d7d0c1] object-cover md:aspect-square"
            src={post.coverImage}
          />
        ) : null}
      </Link>
    </article>
  );
}

function Engagement({ post }: { post: Post }) {
  return (
    <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#6f685d]">
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
        comments
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-[#e2dbce] pb-2 last:border-b-0 last:pb-0">
      <dt className="font-mono text-xs text-[#6f685d]">{label}</dt>
      <dd className="font-mono text-sm font-semibold text-[#24211b]">
        {value}
      </dd>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-[#d7d0c1] bg-[#fffdf7] p-8 text-center font-mono text-sm text-[#6f685d]">
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
