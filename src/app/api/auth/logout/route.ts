import { sameOrigin, apiError } from "@/lib/admin/auth";
import { sessionClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (supabaseConfig()) {
      const client = await sessionClient();
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
    }
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
