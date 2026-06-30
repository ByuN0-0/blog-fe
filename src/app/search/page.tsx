"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Search, Terminal } from "lucide-react";

import {
  getCategories,
  getTags,
  searchPosts,
  type Category,
  type Post,
  type Tag,
} from "@/lib/api";

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchShell message="검색 화면을 준비 중..." />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const selectedCategory = searchParams.get("category") ?? "";
  const selectedTag = searchParams.get("tag") ?? "";
  const [query, setQuery] = useState(initialQuery);

  const postsQuery = useQuery({
    queryKey: ["search", initialQuery, selectedCategory, selectedTag],
    queryFn: () =>
      searchPosts({
        q: initialQuery,
        category: selectedCategory,
        tag: selectedTag,
      }),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories", "public"],
    queryFn: getCategories,
  });
  const tagsQuery = useQuery({ queryKey: ["tags", "public"], queryFn: getTags });

  const posts = postsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const tags = tagsQuery.data ?? [];

  function updateParams(next: { q?: string; category?: string; tag?: string }) {
    const params = new URLSearchParams();
    const q = next.q ?? initialQuery;
    const category = next.category ?? selectedCategory;
    const tag = next.tag ?? selectedTag;
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    router.push(`/search?${params.toString()}`);
  }

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
        <p className="font-mono text-xs text-[#6f685d]">/search</p>
        <h1 className="mt-3 text-4xl font-semibold">검색</h1>
        <form
          className="mt-6 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            updateParams({ q: query });
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6f685d]" />
            <input
              className="h-11 w-full rounded-md border border-[#cbc3b4] bg-[#fffdf7] pl-10 pr-3 text-sm outline-none focus:border-[#315f50] focus:ring-2 focus:ring-[#315f50]/15"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="검색어"
              value={query}
            />
          </div>
          <button className="h-11 rounded-md bg-[#2b2924] px-4 font-mono text-xs text-[#fffdf7]" type="submit">
            search
          </button>
        </form>

        <FilterBar
          categories={categories}
          onCategory={(category) => updateParams({ category })}
          onTag={(tag) => updateParams({ tag })}
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
          tags={tags}
        />

        <section className="mt-8 overflow-hidden rounded-md border border-[#d7d0c1] bg-[#fffdf7]/92">
          {postsQuery.isLoading ? (
            <p className="p-8 font-mono text-sm text-[#6f685d]">searching...</p>
          ) : posts.length > 0 ? (
            posts.map((post) => <SearchResult key={post.id} post={post} />)
          ) : (
            <p className="p-8 text-center font-mono text-sm text-[#6f685d]">
              검색 결과가 없습니다.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

function SearchShell({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f3eb] px-5 font-mono text-sm text-[#6f685d]">
      {message}
    </main>
  );
}

function FilterBar({
  categories,
  onCategory,
  onTag,
  selectedCategory,
  selectedTag,
  tags,
}: {
  categories: Category[];
  onCategory: (category: string) => void;
  onTag: (tag: string) => void;
  selectedCategory: string;
  selectedTag: string;
  tags: Tag[];
}) {
  const hasFilter = selectedCategory || selectedTag;

  return (
    <div className="mt-5 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          className={filterClass(!selectedCategory)}
          onClick={() => onCategory("")}
          type="button"
        >
          전체 카테고리
        </button>
        {categories.map((category) => (
          <button
            className={filterClass(selectedCategory === category.name)}
            key={category.id}
            onClick={() => onCategory(category.name)}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={filterClass(!selectedTag)} onClick={() => onTag("")} type="button">
          전체 태그
        </button>
        {tags.map((tag) => (
          <button
            className={filterClass(selectedTag === tag.name)}
            key={tag.id}
            onClick={() => onTag(tag.name)}
            type="button"
          >
            #{tag.name}
          </button>
        ))}
      </div>
      {hasFilter ? (
        <Link className="font-mono text-xs text-[#315f50] underline" href="/search">
          필터 초기화
        </Link>
      ) : null}
    </div>
  );
}

function SearchResult({ post }: { post: Post }) {
  const text = useMemo(() => post.summary || post.content, [post]);

  return (
    <article className="border-b border-[#d7d0c1] p-5 last:border-b-0">
      <div className="flex flex-wrap gap-2 font-mono text-xs text-[#6f685d]">
        <span>{post.category}</span>
        <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
      </div>
      <Link href={`/posts/${post.slug}`}>
        <h2 className="mt-3 text-2xl font-semibold hover:text-[#315f50]">
          {post.title}
        </h2>
      </Link>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#5f5a50]">{text}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              className="font-mono text-xs text-[#315f50] underline-offset-4 hover:underline"
              href={`/search?tag=${encodeURIComponent(tag)}`}
              key={tag}
            >
              #{tag}
            </Link>
          ))}
        </div>
        <Link
          className="inline-flex items-center gap-1 font-mono text-xs text-[#6f685d] hover:text-[#315f50]"
          href={`/posts/${post.slug}`}
        >
          read
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}

function filterClass(active: boolean) {
  return active
    ? "rounded-md border border-[#2b2924] bg-[#2b2924] px-3 py-2 font-mono text-xs text-[#fffdf7]"
    : "rounded-md border border-[#cbc3b4] bg-[#fffdf7] px-3 py-2 font-mono text-xs text-[#5f5a50] hover:border-[#315f50] hover:text-[#315f50]";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
