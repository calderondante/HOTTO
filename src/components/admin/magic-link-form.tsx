"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "./form";
export function MagicLinkForm() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  return <form className="editor-form" onSubmit={async (event) => {
    event.preventDefault();
    if (pending) return;
    const email = new FormData(event.currentTarget).get("email");
    setPending(true); setError(""); setSent(false);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "No pudimos solicitar el enlace.");
      setSent(true);
    } catch (e) { setError(e instanceof Error ? e.message : "No pudimos solicitar el enlace."); }
    finally { setPending(false); }
  }}>
    <TextField name="email" label="Correo electrónico autorizado" type="email" autoComplete="email" required maxLength={254} />
    {error && <p role="alert">{error}</p>}
    {sent && <p role="status">Si tu cuenta está habilitada, recibirás un enlace de acceso. Revisá también spam y abrilo en este mismo navegador. Para reenviarlo, esperá al menos un minuto.</p>}
    <Button type="submit" disabled={pending}>{pending ? "Solicitando enlace…" : "Recibir enlace de acceso"}</Button>
  </form>;
}
