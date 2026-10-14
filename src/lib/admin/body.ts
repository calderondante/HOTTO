export async function boundedJson(
  request: Request,
  limit: number,
): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw Error("JSON_REQUIRED");
  if (Number(request.headers.get("content-length") ?? 0) > limit)
    throw Error("BODY_TOO_LARGE");
  if (!request.body) throw Error("JSON_REQUIRED");
  const reader = request.body.getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.length;
    if (size > limit) {
      await reader.cancel();
      throw Error("BODY_TOO_LARGE");
    }
    chunks.push(chunk.value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
