import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // JWT refresh rotation will be wired here after blog-be exposes auth APIs.
    return Promise.reject(error);
  },
);
