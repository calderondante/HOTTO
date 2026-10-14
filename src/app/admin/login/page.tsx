import { supabaseConfig } from "@/lib/supabase/config";
import { ConnectionNeeded } from "@/components/admin/access";
import { EditorForm, TextField } from "@/components/admin/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
export default function Login() {
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
              Ingresá con tu cuenta administrativa. El acceso se verifica en
              Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditorForm
              endpoint="/api/auth/login"
              nextPath="/admin"
              label="Ingresar"
            >
              <TextField
                name="email"
                label="Correo electrónico"
                type="email"
                required
                autoComplete="username"
              />
              <TextField
                name="password"
                label="Contraseña"
                type="password"
                required
                autoComplete="current-password"
                maxLength={256}
              />
            </EditorForm>
          </CardContent>
        </Card>
      ) : (
        <ConnectionNeeded level={2} />
      )}
    </div>
  );
}
