import { createHash } from "node:crypto";
import {
  PDFDocument,
  PDFDict,
  PDFName,
  PDFArray,
  type PDFObject,
} from "pdf-lib";
export const maxPdfBytes = 25 * 1024 * 1024;
export async function validatePdf(bytes: Uint8Array) {
  if (
    bytes.length < 8 ||
    bytes.length > maxPdfBytes ||
    Buffer.from(bytes.subarray(0, 5)).toString() !== "%PDF-"
  )
    throw Error("Subí un PDF válido de hasta 25 MB.");
  const document = await PDFDocument.load(bytes, {
    ignoreEncryption: false,
    updateMetadata: false,
    throwOnInvalidObject: true,
  });
  const pages = document.getPageCount();
  if (pages < 1 || pages > 2000)
    throw Error("El PDF debe tener entre 1 y 2000 páginas.");
  const visited = new Set<PDFObject>();
  const inspect = (object: PDFObject, depth = 0) => {
    if (visited.has(object)) return;
    visited.add(object);
    if (depth > 50) throw Error("Estructura PDF demasiado profunda.");
    if (object instanceof PDFDict) {
      if (
        ["OpenAction", "AA", "JavaScript", "EmbeddedFiles"].some((key) =>
          object.has(PDFName.of(key)),
        )
      )
        throw Error("Acciones automáticas o adjuntos no admitidos.");
      const action = object.get(PDFName.of("S"));
      if (
        action instanceof PDFName &&
        ["/JavaScript", "/Launch"].includes(action.toString())
      )
        throw Error("Acciones ejecutables no admitidas.");
      for (const [, value] of object.entries()) inspect(value, depth + 1);
    } else if ("dict" in object && object.dict instanceof PDFDict) {
      inspect(object.dict, depth + 1);
    } else if (object instanceof PDFArray) {
      for (const value of object.asArray()) inspect(value, depth + 1);
    }
  };
  for (const [, object] of document.context.enumerateIndirectObjects())
    inspect(object);
  return {
    pages,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}
