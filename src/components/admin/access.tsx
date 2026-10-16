import { ShieldCheck, Database } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
export function ConnectionNeeded({
  level = 1,
  message = "El panel necesita un proyecto Supabase conectado para iniciar sesión y guardar documentos.",
}: {
  message?: string;
  level?: 1 | 2;
}) {
  return (
    <Empty className="admin-access">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Database aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>
          {level === 1 ? (
            <h1>Conectemos tu biblioteca</h1>
          ) : (
            <h2>Conectemos tu biblioteca</h2>
          )}
        </EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      <Alert>
        <ShieldCheck aria-hidden="true" />
        <AlertTitle>Acceso privado y persistencia real</AlertTitle>
        <AlertDescription>
          Esta versión no ofrece cuentas de prueba ni guarda cambios en el
          navegador. Una vez conectado Supabase, el acceso se habilita solo a
          administradores autorizados.
        </AlertDescription>
      </Alert>
    </Empty>
  );
}
