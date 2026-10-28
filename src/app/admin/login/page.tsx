import { supabaseConfig } from "@/lib/supabase/config";
import { ConnectionNeeded } from "@/components/admin/access";
import { MagicLinkForm } from "@/components/admin/magic-link-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
export default async function Login({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const status = (await searchParams).status;
  return (
    <div className="admin-login">
      <p className="eyebrow">HOTTO · GESTIÓN DOCUMENTAL</p>
      <h1>
        El conocimiento,
        <br />
        <em>bien organizado.</em>
      </h1>
      {supabaseConfig() ? (
        <Card>
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>
              Recibí un enlace de un solo uso en tu correo autorizado. No necesitás contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === "invalid" && <p role="alert">El enlace no es válido, venció o la cuenta no tiene acceso. Solicitá otro enlace y abrilo en el mismo navegador.</p>}
            <MagicLinkForm />
          </CardContent>
        </Card>
      ) : (
        <ConnectionNeeded level={2} />
      )}
    </div>
  );
}
