const POST_AUTH_REDIRECT_KEY = "Giztrack:post-auth-redirect";

const PUBLIC_PATH_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy-policy",
];

const normalizePath = (path: string) => {
  if (!path.startsWith("/")) {
    return "/";
  }

  return path;
};

export const isPublicRoute = (path: string) =>
  PUBLIC_PATH_PREFIXES.some((route) => path === route || path.startsWith(`${route}/`));

export const buildAppPath = (pathname: string, search = "", hash = "") =>
  `${normalizePath(pathname)}${search}${hash}`;

export const rememberPostAuthRedirect = (path: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedPath = normalizePath(path);
  if (isPublicRoute(normalizedPath)) {
    return;
  }

  try {
    window.sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, normalizedPath);
  } catch {
    // Redirect recovery should never block auth flow.
  }
};

export const rememberCurrentPathForAuth = () => {
  if (typeof window === "undefined") {
    return;
  }

  rememberPostAuthRedirect(buildAppPath(window.location.pathname, window.location.search, window.location.hash));
};

export const consumePostAuthRedirect = (fallback = "/") => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const nextPath = window.sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);
    window.sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);

    if (!nextPath || isPublicRoute(nextPath)) {
      return fallback;
    }

    return normalizePath(nextPath);
  } catch {
    return fallback;
  }
};

export const clearPostAuthRedirect = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
  } catch {
    // Ignore storage cleanup errors.
  }
};
