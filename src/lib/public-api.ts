import type { Category, Post, Tag } from "@/lib/blog-types";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://blog.biyeon.net";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function publicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    next: { revalidate: 60, ...init?.next },
  });

  if (!response.ok) {
    throw new Error(`Public API request failed: ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchPublishedPosts() {
  const data = await publicFetch<{ posts: Post[] }>("/api/v1/posts");

  return data.posts;
}

export async function fetchPublishedPost(slug: string) {
  return publicFetch<Post>(`/api/v1/posts/${encodeURIComponent(slug)}`);
}

export async function fetchCategories() {
  const data = await publicFetch<{ categories: Category[] }>(
    "/api/v1/categories",
  );

  return data.categories;
}

export async function fetchTags() {
  const data = await publicFetch<{ tags: Tag[] }>("/api/v1/tags");

  return data.tags;
}

export async function fetchTag(slug: string) {
  return publicFetch<Tag>(`/api/v1/tags/${encodeURIComponent(slug)}`);
}

export async function searchPublishedPosts(params: {
  q?: string;
  category?: string;
  tag?: string;
}) {
  const query = new URLSearchParams();
  if (params.q) {
    query.set("q", params.q);
  }
  if (params.category) {
    query.set("category", params.category);
  }
  if (params.tag) {
    query.set("tag", params.tag);
  }

  const data = await publicFetch<{ posts: Post[] }>(
    `/api/v1/search?${query.toString()}`,
  );

  return data.posts;
}

export function postUrl(post: Post) {
  return `${SITE_URL}/posts/${post.slug}`;
}

export function tagUrl(tag: Tag) {
  return `${SITE_URL}/tags/${tag.slug}`;
}
