import axios from "axios";
import { showError } from "../components/ui/Toast";
import { extractErrorMessage } from "../lib/errorUtils";
import i18n from "../i18n";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers["Accept-Language"] = i18n.language;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");

    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 401:
          if (!isAuthEndpoint && !window.location.pathname.startsWith("/login")) {
            localStorage.removeItem("token");
            showError(i18n.t("common:error.sessionExpired"));
            setTimeout(() => { window.location.href = "/login"; }, 1500);
          }
          break;
        case 403:
          showError(i18n.t("common:error.forbidden"));
          break;
        case 404:
        case 409:
        case 422:
        case 500:
        default:
          if (!isAuthEndpoint) {
            showError(extractErrorMessage(error));
          }
          break;
      }
    } else if (error.request) {
      showError(i18n.t("common:error.networkError"));
    }
    return Promise.reject(error);
  }
);

export default api;
