"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/public-header";
import { BlogSearchForm } from "@/components/blog-search-form";
import { ListMessage, PostList } from "@/components/post-list";
import { getCategories, getPublishedPosts, getTags } from "@/lib/api";
import { searchHref } from "@/lib/blog-navigation";

export default function Home() {
  return (
    <div className="blog-surface">
      <PublicHeader />
      <main className="blog-container">
        <section className="blog-intro">
          <h1>읽고, 만들고,<br className="sm:hidden" /> 운영하며 남긴 기록</h1>
          <p>라이프로그, 북 노트, 기술 노트, 비즈니스 글을 차분하게 쌓는 개인 블로그입니다.</p>
        </section>
        <Suspense fallback={<ListMessage>글 목록을 준비하고 있습니다.</ListMessage>}><HomeContent /></Suspense>
      </main>
    </div>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const postsQuery = useQuery({ queryKey: ["posts", "published"], queryFn: getPublishedPosts });
  const categoriesQuery = useQuery({ queryKey: ["categories", "public"], queryFn: getCategories });
  const tagsQuery = useQuery({ queryKey: ["tags", "public"], queryFn: getTags });
  const posts = postsQuery.data ?? [];
  const filteredPosts = category ? posts.filter((post) => post.category === category) : posts;

  return (
    <>
      <BlogSearchForm onSearch={(q) => router.push(searchHref({ q }))} />
      <nav className="blog-category-nav" aria-label="카테고리">
        <Link href="/#posts" aria-current={!category ? "page" : undefined}>전체 <span>{posts.length}</span></Link>
        {(categoriesQuery.data ?? []).map((item) => (
          <Link href={`/?${new URLSearchParams({ category: item.name })}#posts`} key={item.id} aria-current={category === item.name ? "page" : undefined}>
            {item.name} <span>{posts.filter((post) => post.category === item.name).length}</span>
          </Link>
        ))}
      </nav>
      {categoriesQuery.isError ? <p className="blog-helper" role="alert">카테고리를 불러오지 못했습니다. <button onClick={() => categoriesQuery.refetch()}>다시 시도</button></p> : null}
      <section id="posts" className="blog-results" aria-labelledby="posts-heading" aria-busy={postsQuery.isFetching}>
        <div className="blog-section-heading">
          <h2 id="posts-heading">{category || "최근 글"}</h2>
          {!postsQuery.isPending && !postsQuery.isError ? <span>{filteredPosts.length}개의 글</span> : null}
        </div>
        {postsQuery.isPending ? <ListMessage>글을 불러오고 있습니다.</ListMessage>
          : postsQuery.isError ? <ListMessage error>글 목록을 불러오지 못했습니다. <button onClick={() => postsQuery.refetch()}>다시 시도</button></ListMessage>
          : filteredPosts.length > 0 ? <PostList posts={filteredPosts} tags={tagsQuery.data ?? []} />
          : <ListMessage>{category ? "이 카테고리에는 아직 공개된 글이 없습니다." : "아직 공개된 글이 없습니다."}</ListMessage>}
      </section>
    </>
  );
}
