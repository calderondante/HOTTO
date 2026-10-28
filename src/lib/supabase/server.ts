import { sessionCookieOptions } from "@/lib/admin/magic-link";
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/library/database.generated";
import { supabaseConfig } from "./config";
export async function sessionClient() {
  const config = supabaseConfig();
  if (!config) throw new Error("SUPABASE_NOT_CONFIGURED");
  const store = await cookies();
  return createServerClient<Database>(config.url, config.key, {
    global: {
      fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
    },
    cookieOptions: sessionCookieOptions(),
    cookies: {
      getAll: () => store.getAll(),
      setAll: (entries) => {
        try {
          entries.forEach(({ name, value, options }) =>
            store.set(name, value, options),
          );
        } catch {
          /* Proxy writes refreshed cookies for read-only Server Components. */
        }
      },
    },
  });
}
export function publicClient() {
  const c = supabaseConfig();
  if (!c) throw new Error("SUPABASE_NOT_CONFIGURED");
  return createClient<Database>(c.url, c.key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
    },
  });
}
