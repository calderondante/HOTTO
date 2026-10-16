export function supabaseConfig(
  env: Record<string, string | undefined> = process.env,
) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL,
    key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || key.startsWith("sb_secret_")) return null;
  if (key.startsWith("eyJ")) {
    try {
      const role = JSON.parse(
        Buffer.from(key.split(".")[1], "base64url").toString(),
      ).role;
      if (role !== "anon") return null;
    } catch {
      return null;
    }
  }

  try {
    if (new URL(url).username || new URL(url).password) return null;
    if (
      new URL(url).protocol !== "https:" &&
      !(
        new URL(url).protocol === "http:" &&
        ["127.0.0.1", "localhost"].includes(new URL(url).hostname)
      )
    )
      return null;
  } catch {
    return null;
  }
  return { url, key };
}
export function libraryMode(
  env: Record<string, string | undefined> = process.env,
): "demo" | "supabase" {
  if (env.HOTTO_DATA_SOURCE === "demo") return "demo";
  return env.HOTTO_DATA_SOURCE === "supabase" ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ? "supabase"
    : "demo";
}
