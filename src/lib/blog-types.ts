export type PostStatus = "draft" | "published" | "private";

export const BLOG_CATEGORIES = [
  "라이프로그",
  "북 노트",
  "기술 노트",
  "비즈니스",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  postCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  status: PostStatus;
  category: BlogCategory | string;
  tags: string[];
  coverImage: string;
  views: number;
  likes: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  postId: string;
  postSlug: string;
  author: string;
  content: string;
  status: "visible" | "hidden";
  createdAt: string;
  updatedAt: string;
};

export type TodayStats = {
  date: string;
  views: number;
  posts: Array<{
    postId: string;
    slug: string;
    title: string;
    views: number;
  }>;
};
