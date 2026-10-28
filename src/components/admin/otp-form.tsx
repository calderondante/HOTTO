"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
export function OtpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [wait, setWait] = useState(0);
  const [verifyWait, setVerifyWait] = useState(0);
  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);
  useEffect(() => {
    if (verifyWait <= 0) return;
    const timer = setTimeout(() => setVerifyWait(verifyWait - 1), 1000);
    return () => clearTimeout(timer);
  }, [verifyWait]);
  async function submit(verify: boolean) {
    if (pending || (verify ? verifyWait > 0 : wait > 0)) return;
    setPending(true); setError(""); setMessage("");
    try {
      const response = await fetch(verify ? "/api/auth/verify" : "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(verify ? { email, token } : { email }) });
      const data = await response.json();
      if (!response.ok) {
        if (data.retryAfter) (verify ? setVerifyWait : setWait)(Math.min(600, Math.max(1, Number(data.retryAfter))));
        throw Error(data.error || "No pudimos completar el ingreso.");
      }
      if (verify) { router.replace("/admin"); router.refresh(); }
      else { setSent(true); setToken(""); setWait(60); setMessage("Si tu cuenta está habilitada, recibirás un código por correo. Revisá también spam. No necesitás abrir un enlace."); }
    } catch (e) { setError(e instanceof Error ? e.message : "No pudimos completar el ingreso."); }
    finally { setPending(false); }
  }
  return <div className="editor-form">
    <form className="editor-form" onSubmit={(event) => { event.preventDefault(); void submit(false); }}>
      <Field><FieldLabel htmlFor="otp-email">Correo electrónico autorizado</FieldLabel><Input id="otp-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} readOnly={sent} onChange={(e) => setEmail(e.target.value.trim().toLowerCase())} /></Field>
      <Button type="submit" disabled={pending || wait > 0}>{wait > 0 ? `Podés reenviar en ${wait} s` : sent ? "Reenviar código" : "Recibir código"}</Button>
      {!sent && <Button type="button" variant="outline" disabled={pending || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)} onClick={() => { setSent(true); setError(""); setMessage("Ingresá el código que ya recibiste, sin solicitar otro correo."); }}>Ya tengo un código</Button>}
    </form>
    {sent && <form className="editor-form" onSubmit={(event) => { event.preventDefault(); void submit(true); }}>
      <Field><FieldLabel htmlFor="otp-token">Código de seis dígitos</FieldLabel><Input id="otp-token" name="token" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required value={token} onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))} /></Field>
      <Button type="submit" disabled={pending || token.length !== 6 || verifyWait > 0}>{verifyWait > 0 ? `Reintentá en ${verifyWait} s` : pending ? "Verificando…" : "Ingresar con código"}</Button>
      <Button type="button" variant="outline" disabled={pending} onClick={() => { setSent(false); setToken(""); setError(""); setMessage(""); }}>Cambiar correo</Button>
    </form>}
    {error && <p role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
  </div>;
}
