const getApiBaseUrl = () =>
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined"
    ? "/api/v1"
    : "http://localhost:8000/api/v1");

const getApiOrigin = () =>
  new URL(
    getApiBaseUrl(),
    typeof window !== "undefined" ? window.location.origin : "http://localhost:5173"
  ).origin;

const shouldUseBackendOriginForMedia = () => {
  if (typeof window === "undefined") {
    return true;
  }

  const apiOrigin = getApiOrigin();
  const currentOrigin = window.location.origin;
  const apiBaseUrl = getApiBaseUrl();

  // When the frontend talks to a relative /api path, media should stay on the same origin.
  if (apiBaseUrl.startsWith("/")) {
    return false;
  }

  // Vite/dev setups usually run on a different port from the backend and need rewriting.
  return currentOrigin !== apiOrigin;
};

export function resolveAssetUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  if (url.startsWith("//")) {
    return typeof window !== "undefined" ? `${window.location.protocol}${url}` : `http:${url}`;
  }

  if (url.startsWith("/")) {
    if (url.startsWith("/media/") || url.startsWith("/shop_logos/")) {
      if (shouldUseBackendOriginForMedia()) {
        return new URL(url, getApiOrigin()).toString();
      }
    }
    return url;
  }

  return new URL(url, getApiOrigin()).toString();
}
