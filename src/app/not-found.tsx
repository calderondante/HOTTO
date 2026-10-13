import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <main id="contenido" className="shell page-content">
      <div className="empty-state">
        <p className="eyebrow">404 · PÁGINA NO ENCONTRADA</p>
        <h1>Volvamos al catálogo.</h1>
        <p>
          La página que buscás no está disponible. Podés seguir explorando la
          biblioteca.
        </p>
        <Button
          render={<Link href="/biblioteca" />}
          nativeButton={false}
          role="link"
        >
          Explorar biblioteca
        </Button>
      </div>
    </main>
  );
}
