import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { ACCESS_TOKEN_KEY, clearAuth } from "@/lib/auth";
import { openLoginModal } from "@/lib/jotai/auth";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
        // Hết phiên: mở modal đăng nhập (global state) thay vì redirect /admin/auth.
        openLoginModal("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
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
