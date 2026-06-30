import axios from "axios";

import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  type AuthTokens,
} from "@/lib/auth-tokens";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { data } = await api.post<AuthTokens>("/api/v1/auth/refresh", {
        refreshToken,
      });

      setAuthTokens(data);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAuthTokens();
      return Promise.reject(refreshError);
    }
  },
);

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthTokens>("/api/v1/auth/login", {
    email,
    password,
  });

  setAuthTokens(data);

  return data;
}

export async function logout() {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await api.post("/api/v1/auth/logout", { refreshToken });
    }
  } finally {
    clearAuthTokens();
  }
}

export async function getAdminMe() {
  const { data } = await api.get<{ email: string }>("/api/v1/admin/me");

  return data;
}

export type DependencyStatus = {
  name: "soda";
  configured: boolean;
  ok: boolean;
  latencyMs?: number;
  endpoint?: string;
  collection?: string;
  error?: string;
};

export type DependenciesReport = {
  soda: DependencyStatus;
};

export async function getAdminDependencies() {
  const { data } = await api.get<DependenciesReport>(
    "/api/v1/admin/dependencies",
  );

  return data;
}

export type PostStatus = "draft" | "published" | "private";

export type Post = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: PostStatus;
  category: string;
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

export type PostPayload = {
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: PostStatus;
  category: string;
  tags: string[];
  coverImage: string;
};

export async function getAdminPosts() {
  const { data } = await api.get<{ posts: Post[] }>("/api/v1/admin/posts");

  return data.posts;
}

export async function getAdminPost(id: string) {
  const { data } = await api.get<Post>(`/api/v1/admin/posts/${id}`);

  return data;
}

export async function createAdminPost(payload: PostPayload) {
  const { data } = await api.post<Post>("/api/v1/admin/posts", payload);

  return data;
}

export async function updateAdminPost(id: string, payload: PostPayload) {
  const { data } = await api.put<Post>(`/api/v1/admin/posts/${id}`, payload);

  return data;
}

export async function deleteAdminPost(id: string) {
  await api.delete(`/api/v1/admin/posts/${id}`);
}

export async function getAdminComments() {
  const { data } = await api.get<{ comments: Comment[] }>(
    "/api/v1/admin/comments",
  );

  return data.comments;
}

export async function hideAdminComment(id: string) {
  const { data } = await api.patch<Comment>(
    `/api/v1/admin/comments/${id}/hide`,
  );

  return data;
}

export async function deleteAdminComment(id: string) {
  await api.delete(`/api/v1/admin/comments/${id}`);
}
