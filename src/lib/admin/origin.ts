// Compare against the HTTP Host, which Next can preserve while normalizing the
// internal request URL to localhost. Never trust arbitrary forwarded hosts.
export function hasTrustedOrigin(
  request: Request,
  siteOrigin?: string,
): boolean {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;
  try {
    const supplied = new URL(origin);
    if (supplied.origin !== origin || supplied.username || supplied.password)
      return false;
    if (siteOrigin) {
      const configured = new URL(siteOrigin);
      if (
        !["https:", "http:"].includes(configured.protocol) ||
        configured.username ||
        configured.password ||
        configured.pathname !== "/" ||
        configured.search ||
        configured.hash
      )
        return false;
      return supplied.origin === configured.origin;
    }
    const internal = new URL(request.url);
    const host = request.headers.get("host") ?? internal.host;
    return supplied.host === host && supplied.protocol === internal.protocol;
  } catch {
    return false;
  }
}
