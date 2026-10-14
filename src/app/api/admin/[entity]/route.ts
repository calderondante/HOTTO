import {
  requireAdmin,
  sameOrigin,
  AdminError,
  apiError,
} from "@/lib/admin/auth";
import {
  record,
  text,
  uuid,
  choice,
  optionalText,
  httpsUrl,
  date,
  states,
  workPayload,
} from "@/lib/admin/validation";
import { boundedJson } from "@/lib/admin/body";
import type { Json } from "@/lib/library/database.types";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    sameOrigin(request);
    const { client } = await requireAdmin();
    const body = record(await boundedJson(request, 50000)),
      entity = (await params).entity;
    const check = (error: { message: string; code?: string } | null) => {
      if (error)
        throw new AdminError(
          error.code === "42501" ? 403 : error.code === "40001" ? 409 : 400,
          error.code === "P0001" || error.code === "40001"
            ? error.message.slice(0, 300)
            : "No se guardó el cambio. Revisá los campos, las relaciones y los valores duplicados.",
        );
    };
    if (entity === "work") {
      const result = await client.rpc("save_library_work", {
        payload: workPayload(body) as Json,
      });
      check(result.error);
      return Response.json(
        { id: result.data },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (entity === "status") {
      const id = uuid(body.id),
        status = choice(body.status, states),
        table = choice(body.target, ["works", "documents"] as const);
      const result = await client
        .from(table)
        .update({ editorial_status: status })
        .eq("id", id)
        .select("id")
        .single();
      check(result.error);
      return Response.json(
        { id },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (entity === "author") {
      const v = { name: text(body.name), demo: false };
      const result = body.id
        ? await client
            .from("authors")
            .update(v)
            .eq("id", uuid(body.id))
            .select("id")
            .single()
        : await client.from("authors").insert(v).select("id").single();
      check(result.error);
      return Response.json({ id: result.data?.id });
    }
    if (entity === "source") {
      const urls = text(body.urls ?? "", 0, 6000)
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(httpsUrl);
      if (urls.length > 10)
        throw new AdminError(400, "Usá hasta diez fuentes.");
      const v = {
        label: text(body.label),
        note: text(body.note, 10, 3000),
        urls,
        verification: choice(body.verification, [
          "official",
          "secondary-crosschecked",
          "unverified",
        ] as const),
        editorial_status: choice(body.editorial_status, states),
      };
      const result = body.id
        ? await client
            .from("sources")
            .update(v)
            .eq("id", uuid(body.id))
            .select("id")
            .single()
        : await client.from("sources").insert(v).select("id").single();
      check(result.error);
      return Response.json({ id: result.data?.id });
    }
    if (entity === "license") {
      const allowed = body.distribution_allowed === true;
      const v = {
        name: text(body.name),
        attribution: optionalText(body.attribution, 1000),
        distribution_allowed: allowed,
        evidence: text(body.evidence ?? "", allowed ? 10 : 0, 6000),
        valid_until: date(body.valid_until),
        revoked_at: body.revoked === true ? new Date().toISOString() : null,
      };
      const result = body.id
        ? await client
            .from("licenses")
            .update(v)
            .eq("id", uuid(body.id))
            .select("id")
            .single()
        : await client.from("licenses").insert(v).select("id").single();
      check(result.error);
      return Response.json({ id: result.data?.id });
    }
    if (entity === "edition") {
      const year =
        body.publication_year === "" || body.publication_year == null
          ? null
          : Number(body.publication_year);
      if (year !== null && (!Number.isInteger(year) || year < 1 || year > 2100))
        throw new AdminError(400, "Año inválido.");
      const v = {
        work_id: uuid(body.work_id),
        label: text(body.label, 1, 200),
        publication_year: year,
        publisher: optionalText(body.publisher),
        isbn: optionalText(body.isbn, 30),
        editorial_status: choice(body.editorial_status, states),
      };
      const result = body.id
        ? await client
            .from("editions")
            .update(v)
            .eq("id", uuid(body.id))
            .select("id")
            .single()
        : await client.from("editions").insert(v).select("id").single();
      check(result.error);
      return Response.json({ id: result.data?.id });
    }
    if (entity === "document") {
      const mode = choice(body.access_mode, [
        "pdf",
        "external",
        "reference",
      ] as const);
      const v = {
        work_id: uuid(body.work_id),
        edition_id: body.edition_id ? uuid(body.edition_id) : null,
        label: text(body.label, 1, 200),
        access_mode: mode,
        external_url: mode === "external" ? httpsUrl(body.external_url) : null,
      };
      const result = body.id
        ? await client
            .from("documents")
            .update(v)
            .eq("id", uuid(body.id))
            .select("id")
            .single()
        : await client.from("documents").insert(v).select("id").single();
      check(result.error);
      return Response.json({ id: result.data?.id });
    }
    if (entity === "permission") {
      const id = uuid(body.document_id),
        license = uuid(body.license_id);
      const updated = await client
        .from("files")
        .update({ license_id: license })
        .eq("document_id", id);
      check(updated.error);
      const result = await client.from("document_permissions").upsert(
        {
          document_id: id,
          license_id: license,
          state: choice(body.state, [
            "pending",
            "verified",
            "rejected",
          ] as const),
          allow_public: body.allow_public === true,
          evidence: text(body.evidence, 10, 6000),
          valid_until: date(body.valid_until),
        },
        { onConflict: "document_id" },
      );
      check(result.error);
      return Response.json({ id });
    }
    if (entity === "jurisprudence") {
      const result = await client.from("jurisprudence").upsert({
        work_id: uuid(body.work_id),
        court: text(body.court),
        docket: text(body.docket),
        decision_date: date(body.decision_date) ?? "",
        topic: text(body.topic),
        holding: text(body.holding, 20, 6000),
      });
      check(result.error);
      return Response.json({ ok: true });
    }
    if (entity === "legislation") {
      const result = await client.from("legislation").upsert({
        work_id: uuid(body.work_id),
        authority: text(body.authority),
        identifier: text(body.identifier),
        jurisdiction: text(body.jurisdiction),
        enacted_on: date(body.enacted_on),
        validity_note: text(body.validity_note, 10, 3000),
      });
      check(result.error);
      return Response.json({ ok: true });
    }
    // Validate the surface; there are no generic SQL/table writes or deletion operations.
    throw new AdminError(404, "Operación no disponible.");
  } catch (error) {
    if (
      error instanceof Error &&
      ["BODY_TOO_LARGE", "JSON_REQUIRED"].includes(error.message)
    )
      return apiError(error);
    if (error instanceof TypeError || error instanceof SyntaxError)
      return apiError(new AdminError(400, "Revisá los datos del formulario."));
    if (
      error instanceof Error &&
      !(error instanceof AdminError) &&
      !["SUPABASE_NOT_CONFIGURED"].includes(error.message)
    )
      return apiError(
        new AdminError(
          400,
          error.message.length < 160 ? error.message : "Datos inválidos.",
        ),
      );
    return apiError(error);
  }
}
