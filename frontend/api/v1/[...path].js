const BACKEND_ORIGIN = "https://sam-eff-Giztrack-backend.hf.space";

const EXCLUDED_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "x-forwarded-host",
  "x-forwarded-port",
  "x-forwarded-proto",
  "x-real-ip",
]);

async function readRequestBody(req) {
  if (req.method === "GET" || req.method === "HEAD") {
    return undefined;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (!chunks.length) {
    return undefined;
  }

  return Buffer.concat(chunks);
}

function buildTargetUrl(req) {
  const pathParam = Array.isArray(req.query.path) ? req.query.path.join("/") : req.query.path || "";
  const target = new URL(`/api/v1/${pathParam}`, BACKEND_ORIGIN);

  for (const [key, value] of Object.entries(req.query)) {
    if (key === "path") {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => target.searchParams.append(key, item));
    } else if (typeof value === "string") {
      target.searchParams.set(key, value);
    }
  }

  return target;
}

function copyResponseHeaders(upstream, res) {
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      return;
    }
    res.setHeader(key, value);
  });

  if (typeof upstream.headers.getSetCookie === "function") {
    const cookies = upstream.headers.getSetCookie();
    if (cookies.length) {
      res.setHeader("set-cookie", cookies);
    }
  }
}

export default async function handler(req, res) {
  try {
    const targetUrl = buildTargetUrl(req);
    const body = await readRequestBody(req);

    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (!value || EXCLUDED_REQUEST_HEADERS.has(key.toLowerCase())) {
        continue;
      }
      headers[key] = value;
    }

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });

    const responseBuffer = Buffer.from(await upstream.arrayBuffer());
    copyResponseHeaders(upstream, res);
    res.status(upstream.status).send(responseBuffer);
  } catch (error) {
    res.status(502).json({
      detail: "Proxy request failed.",
      error: error instanceof Error ? error.message : "Unknown proxy error.",
    });
  }
}
