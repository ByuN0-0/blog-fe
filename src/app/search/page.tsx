"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/public-header";
import { BlogSearchForm } from "@/components/blog-search-form";
import { ListMessage, PostList } from "@/components/post-list";
import { getCategories, getTags, searchPosts } from "@/lib/api";
import { searchHref } from "@/lib/blog-navigation";

export default function SearchPage() {
  return (
    <div className="blog-surface">
      <PublicHeader />
      <main className="blog-container blog-search-page">
        <h1 className="blog-page-title">글 검색</h1>
        <Suspense fallback={<ListMessage>검색 화면을 준비하고 있습니다.</ListMessage>}><SearchContent /></Suspense>
      </main>
    </div>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const postsQuery = useQuery({ queryKey: ["search", q, category, tag], queryFn: () => searchPosts({ q, category, tag }) });
  const categoriesQuery = useQuery({ queryKey: ["categories", "public"], queryFn: getCategories });
  const tagsQuery = useQuery({ queryKey: ["tags", "public"], queryFn: getTags });
  const tags = tagsQuery.data ?? [];
  const availableTags = tags.filter((item) => item.active && item.postCount > 0);
  const filters = { q, category, tag };
  function updateParams(next: Partial<typeof filters>) {
    router.push(`${searchHref({ ...filters, ...next })}#results`);
  }

  return (
    <>
      <BlogSearchForm key={q} initialQuery={q} onSearch={(query) => updateParams({ q: query })} />
      <nav className="blog-category-nav" aria-label="카테고리 필터">
        <Link href={`${searchHref({ q, tag })}#results`} aria-current={!category ? "page" : undefined}>전체</Link>
        {(categoriesQuery.data ?? []).map((item) => (
          <Link href={`${searchHref({ ...filters, category: item.name })}#results`} key={item.id} aria-current={category === item.name ? "page" : undefined}>{item.name}</Link>
        ))}
      </nav>
      {categoriesQuery.isError ? <p className="blog-helper" role="alert">카테고리를 불러오지 못했습니다. <button onClick={() => categoriesQuery.refetch()}>다시 시도</button></p> : null}
      <details className="blog-tag-picker">
        <summary>태그 선택</summary>
        {tagsQuery.isPending ? <p className="blog-helper">태그를 불러오고 있습니다.</p>
          : tagsQuery.isError ? <p className="blog-helper" role="alert">태그를 불러오지 못했습니다. <button onClick={() => tagsQuery.refetch()}>다시 시도</button></p>
          : availableTags.length === 0 ? <p className="blog-helper">선택할 태그가 없습니다.</p>
          : <div className="blog-tag-options">{availableTags.map((item) => (
            <Link href={`${searchHref({ ...filters, tag: item.name })}#results`} aria-current={tag === item.name ? "page" : undefined} key={item.id}>#{item.name} <span>{item.postCount}</span></Link>
          ))}</div>}
      </details>
      {q || category || tag ? (
        <div className="blog-active-filters" aria-label="선택된 검색 조건">
          {q ? <Link href={`${searchHref({ category, tag })}#results`} aria-label={`검색어 ${q} 해제`}>검색어: {q} <span aria-hidden="true">×</span></Link> : null}
          {category ? <Link href={`${searchHref({ q, tag })}#results`} aria-label={`카테고리 ${category} 해제`}>{category} <span aria-hidden="true">×</span></Link> : null}
          {tag ? <Link href={`${searchHref({ q, category })}#results`} aria-label={`태그 ${tag} 해제`}>#{tag} <span aria-hidden="true">×</span></Link> : null}
          <Link className="blog-reset" href="/search#results">모두 해제</Link>
        </div>
      ) : null}
      <section id="results" className="blog-results" aria-labelledby="results-heading" aria-busy={postsQuery.isFetching}>
        <div className="blog-section-heading">
          <h2 id="results-heading">{q || category || tag ? "검색 결과" : "전체 글"}</h2>
          {!postsQuery.isPending && !postsQuery.isError ? <span>{postsQuery.data?.length ?? 0}개의 글</span> : null}
        </div>
        {postsQuery.isPending ? <ListMessage>글을 검색하고 있습니다.</ListMessage>
          : postsQuery.isError ? <ListMessage error>검색 결과를 불러오지 못했습니다. <button onClick={() => postsQuery.refetch()}>다시 시도</button></ListMessage>
          : postsQuery.data && postsQuery.data.length > 0 ? <PostList posts={postsQuery.data} tags={tags} />
          : <ListMessage>검색 결과가 없습니다. 검색어나 필터를 바꿔 보세요.</ListMessage>}
      </section>
    </>
  );
}
