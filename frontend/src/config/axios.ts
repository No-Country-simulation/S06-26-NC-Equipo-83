import axios from "axios";
import { showError } from "../components/ui/Toast";
import { extractErrorMessage } from "../lib/errorUtils";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
            showError("Tu sesión expiró. Iniciá sesión nuevamente.");
            setTimeout(() => { window.location.href = "/login"; }, 1500);
          }
          break;
        case 403:
          showError("No tenés permisos para realizar esta acción.");
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
      showError("No se pudo conectar con el servidor. Verificá tu conexión.");
    }
    return Promise.reject(error);
  }
);

export default api;
