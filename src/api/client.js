import axios from "axios";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vela_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("vela_token");
      localStorage.removeItem("vela_user");
      if (!window.location.pathname.includes("/login")) window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const unwrap = (response) => response?.data?.data;
export const apiMessage = (error, fallback = "Something went wrong") => error?.response?.data?.message || error?.message || fallback;

export const assetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
};
