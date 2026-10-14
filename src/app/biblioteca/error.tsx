"use client";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main id="contenido" className="shell page-content">
      <div className="empty-state">
        <h1>No pudimos cargar esta página.</h1>
        <p>Intentá nuevamente para seguir explorando.</p>
        <Button onClick={reset}>Reintentar</Button>
      </div>
    </main>
  );
}
