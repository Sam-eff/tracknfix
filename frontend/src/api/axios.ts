import axios, { AxiosError, AxiosHeaders } from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean;
    skipAuthRedirect?: boolean;
  }

  interface InternalAxiosRequestConfig {
    _retry?: boolean;
    skipAuthRedirect?: boolean;
  }
}

// const baseURL =
//   import.meta.env.VITE_API_URL ||
//   (typeof window !== "undefined" ? "/api/v1" : "http://localhost:8000/api/v1");

const baseURL = import.meta.env.VITE_API_URL;
console.log("API URL:", baseURL);

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

const csrfClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

const isPublicRoute = (path: string) =>
  ["/login", "/register", "/forgot-password", "/reset-password"].some((route) => path.startsWith(route));

let refreshPromise: Promise<void> | null = null;
let csrfPromise: Promise<void> | null = null;

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") {
    return "";
  }

  const prefix = `${name}=`;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : "";
};

const hasCsrfCookie = () =>
  typeof document !== "undefined" &&
  document.cookie.split("; ").some((cookie) => cookie.startsWith("csrftoken="));

const ensureCsrfCookie = async () => {
  if (typeof window === "undefined" || hasCsrfCookie()) {
    return;
  }

  if (!csrfPromise) {
    csrfPromise = csrfClient
      .get("/auth/csrf/", { skipAuthRedirect: true })
      .then(() => undefined)
      .finally(() => {
        csrfPromise = null;
      });
  }

  await csrfPromise;
};

api.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
    await ensureCsrfCookie();

    const csrfToken = getCookieValue("csrftoken");
    if (csrfToken) {
      if (typeof config.headers?.set === "function") {
        config.headers.set("X-CSRFToken", csrfToken);
      } else {
        config.headers = new AxiosHeaders({
          ...config.headers,
          "X-CSRFToken": csrfToken,
        });
      }
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config;
    const requestPath = original?.url || "";

    const isRefreshRequest = requestPath.includes("/auth/token/refresh/");
    const isPublicAuthRequest =
      requestPath.includes("/auth/login/") ||
      requestPath.includes("/auth/register/") ||
      requestPath.includes("/auth/forgot-password/") ||
      requestPath.includes("/auth/reset-password/");

    if (error.response?.status === 401 && original && !original._retry && !isRefreshRequest && !isPublicAuthRequest) {
      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = api
            .post("/auth/token/refresh/", null, { skipAuthRedirect: true })
            .then(() => undefined)
            .finally(() => {
              refreshPromise = null;
            });
        }

        await refreshPromise;
        return api(original);
      } catch (refreshError) {
        if (!original.skipAuthRedirect && !isPublicRoute(window.location.pathname)) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
