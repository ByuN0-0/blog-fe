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
