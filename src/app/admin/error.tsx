"use client";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state">
      <h1>No pudimos cargar la administración.</h1>
      <p>
        Reintentá cuando la conexión con Supabase esté disponible. No se
        guardaron cambios desde esta pantalla.
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
