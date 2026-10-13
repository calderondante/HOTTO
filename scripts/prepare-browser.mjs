import assert from "node:assert/strict";
import { existsSync, chmodSync } from "node:fs";
import { platform, arch } from "node:os";

// Use only the native binary shipped in the package verified by pnpm's lockfile.
// Do not invoke the upstream download/global-bin fallback during reconstruction.
const extension = platform() === "win32" ? ".exe" : "";
const targetArch = platform() === "win32" && arch() === "arm64" ? "x64" : arch();
const libc = platform() === "linux" && !process.report.getReport().header.glibcVersionRuntime ? "linux-musl" : platform();
const binary = `node_modules/agent-browser/bin/agent-browser-${libc}-${targetArch}${extension}`;
assert(existsSync(binary), `No hay binario de agent-browser incluido para ${libc}/${targetArch}; instalar en una plataforma soportada.`);
if (platform() !== "win32") chmodSync(binary, 0o755);
console.log("Binario local de agent-browser preparado desde el paquete verificado.");
