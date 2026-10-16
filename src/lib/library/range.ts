export function pdfRange(value: string | null): string | undefined {
  if (!value) return undefined;
  if (!/^bytes=(?:\d+-\d*|-\d+)$/.test(value)) throw Error("RANGE_INVALID");
  const [first, last] = value.slice(6).split("-");
  if (!first) {
    const suffix = Number(last);
    if (!Number.isSafeInteger(suffix) || suffix < 1)
      throw Error("RANGE_INVALID");
    return value;
  }
  const start = Number(first),
    end = Number(last);
  if (
    !Number.isSafeInteger(start) ||
    (last ? !Number.isSafeInteger(end) || end < start : false)
  )
    throw Error("RANGE_INVALID");
  return value;
}
