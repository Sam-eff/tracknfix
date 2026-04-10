const DEFAULT_BACKEND_URL = "https://sam-eff-tracknfix-backend.hf.space";

function buildTargetUrl(requestUrl) {
  const incoming = new URL(requestUrl);
  const backendBase = (process.env.HF_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
  const path = incoming.searchParams.get("path") || "";

  incoming.searchParams.delete("path");

  const target = new URL(`${backendBase}/api/v1/${path}`);
  incoming.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });

  return target;
}

export default {
  async fetch(request) {
    const method = request.method || "GET";
    const target = buildTargetUrl(request.url);
    const headers = new Headers(request.headers);

    headers.delete("host");
    headers.delete("x-forwarded-for");
    headers.delete("x-forwarded-host");
    headers.delete("x-forwarded-port");
    headers.delete("x-forwarded-proto");
    headers.set("accept-encoding", "identity");

    const upstream = await fetch(target, {
      method,
      headers,
      body: ["GET", "HEAD"].includes(method) ? undefined : request.body,
      redirect: "manual",
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: upstream.headers,
    });
  },
};
