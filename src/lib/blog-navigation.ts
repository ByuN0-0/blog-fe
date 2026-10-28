import type { Tag } from "./blog-types";

export function tagHref(name: string, tags: Tag[]) {
  const tag = tags.find((candidate) => candidate.active && candidate.name === name);
  return tag ? `/tags/${encodeURIComponent(tag.slug)}` : `/search?${new URLSearchParams({ tag: name })}`;
}

export function searchHref(filters: { q?: string; category?: string; tag?: string }) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value?.trim()) params.set(key, value.trim());
  }
  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

export function formatPostDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul",
  }).format(new Date(value));
}
