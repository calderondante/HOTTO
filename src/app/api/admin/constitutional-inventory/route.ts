import { requireAdmin, apiError } from "@/lib/admin/auth";
import { constitutionalInventory } from "@/lib/library/constitutional-inventory";
export async function GET() {
  try {
    await requireAdmin();
    return Response.json(constitutionalInventory, { headers: { "Cache-Control": "private, no-store", "Content-Disposition": 'attachment; filename="hotto-constitucional-inventario.json"' } });
  } catch (error) { return apiError(error); }
}
