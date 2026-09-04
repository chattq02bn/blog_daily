import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { ACCESS_TOKEN_KEY, clearAuth } from "@/lib/auth";
import { getCommenterToken } from "@/lib/commenter";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

function isCommentMutation(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? "";
  const method = (config.method ?? "").toUpperCase();
  return (
    (url.startsWith("/comments") || url.startsWith("/commenters")) &&
    (method === "POST" || method === "PATCH" || method === "DELETE")
  );
}

function needsCommenterToken(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? "";
  const method = (config.method ?? "").toUpperCase();
  if (isCommentMutation(config)) return true;
  if (url.startsWith("/posts/liked") && method === "GET") return true;
  return false;
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      if (needsCommenterToken(config)) {
        // If logged in, send auth token; otherwise send commenter token
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        } else {
          const commenterToken = getCommenterToken();
          if (commenterToken) {
            config.headers.Authorization = `Bearer ${commenterToken}`;
          }
        }
      } else {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isHandling401 = false;

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const hadToken =
      typeof window !== "undefined" && Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));

    if (error.response?.status === 401 && hadToken && typeof window !== "undefined") {
      if (!isHandling401) {
        isHandling401 = true;
        clearAuth();
        setTimeout(() => {
          isHandling401 = false;
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || "Đã có lỗi xảy ra";
  }
  return error instanceof Error ? error.message : "Đã có lỗi xảy ra";
}

export default api;
