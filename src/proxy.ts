import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/library/database.types";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const c = supabaseConfig();
  if (c) {
    const client = createServerClient<Database>(c.url, c.key, {
      cookieOptions: {
        httpOnly: true,
        sameSite: "lax",
        secure: c.url.startsWith("https:"),
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (entries, headers) => {
          entries.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          entries.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([name, value]) =>
            response.headers.set(name, value),
          );
        },
      },
    });
    // Verification here only refreshes the session. Each page/operation separately checks the live admin membership.
    try {
      await client.auth.getUser();
    } catch {
      /* Protected pages and APIs fail closed. */
    }
  }
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Pragma", "no-cache");
  return response;
}
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/auth/:path*"],
};
