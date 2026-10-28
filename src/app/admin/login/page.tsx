import { supabaseConfig } from "@/lib/supabase/config";
import { ConnectionNeeded } from "@/components/admin/access";
import { OtpForm } from "@/components/admin/otp-form";
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
              Recibí un código de seis dígitos en tu correo autorizado. No necesitás contraseña ni abrir enlaces.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === "invalid" && <p role="alert">El enlace anterior ya no es válido. Solicitá un código e ingresalo acá.</p>}
            <OtpForm />
          </CardContent>
        </Card>
      ) : (
        <ConnectionNeeded level={2} />
      )}
    </div>
  );
}
