import Link from "next/link";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
export function LibraryConnectionError() {
  return (
    <Alert variant="destructive">
      <AlertTitle>No pudimos consultar la biblioteca</AlertTitle>
      <AlertDescription>
        La conexión con Supabase no está disponible. Reintentá más tarde. Los
        ejemplos del MVP siguen separados en la{" "}
        <Link href="/biblioteca/demo">biblioteca de demostración</Link>.
      </AlertDescription>
    </Alert>
  );
}
