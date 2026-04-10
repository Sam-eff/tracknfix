const DEFAULT_BACKEND_URL = "https://sam-eff-tracknfix-backend.hf.space";

function buildTargetUrl(requestUrl, host) {
  const incoming = new URL(requestUrl, `https://${host}`);
  const backendBase = (process.env.HF_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");
  const path = incoming.searchParams.get("path") || "";

  incoming.searchParams.delete("path");

  const target = new URL(`${backendBase}/api/v1/${path}`);
  incoming.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });

  return target;
}

function buildRequestBody(req) {
  if (req.body == null) {
    return undefined;
  }

  if (Buffer.isBuffer(req.body) || typeof req.body === "string") {
    return req.body;
  }

  return JSON.stringify(req.body);
}

export default async function handler(req, res) {
  const method = req.method || "GET";
  const target = buildTargetUrl(req.url, req.headers.host);
  const headers = { ...req.headers };

  delete headers.host;
  delete headers.connection;
  delete headers["content-length"];
  delete headers["x-forwarded-for"];
  delete headers["x-forwarded-host"];
  delete headers["x-forwarded-port"];
  delete headers["x-forwarded-proto"];
  headers["accept-encoding"] = "identity";

  const upstream = await fetch(target, {
    method,
    headers,
    body: ["GET", "HEAD"].includes(method) ? undefined : buildRequestBody(req),
    redirect: "manual",
  });

  res.status(upstream.status);

  const setCookies =
    typeof upstream.headers.getSetCookie === "function" ? upstream.headers.getSetCookie() : [];

  upstream.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (["content-length", "content-encoding", "transfer-encoding", "connection", "set-cookie"].includes(lowerKey)) {
      return;
    }
    res.setHeader(key, value);
  });

  if (setCookies.length) {
    res.setHeader("Set-Cookie", setCookies);
  }

  const body = Buffer.from(await upstream.arrayBuffer());
  res.send(body);
}
