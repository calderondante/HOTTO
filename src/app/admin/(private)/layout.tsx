import Link from "next/link";
import { redirect } from "next/navigation";
import { adminContext } from "@/lib/admin/data";
import { ConnectionNeeded } from "@/components/admin/access";
import { EditorForm } from "@/components/admin/form";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await adminContext();
  if (ctx.status === "blocked") {
    if (ctx.code === 401) redirect("/admin/login");
    return <ConnectionNeeded message={ctx.message} />;
  }
  return (
    <>
      <header className="admin-heading">
        <div>
          <p className="eyebrow">ADMINISTRACIÓN DOCUMENTAL</p>
          <p className="admin-user">{ctx.user.email}</p>
        </div>
        <EditorForm
          endpoint="/api/auth/logout"
          label="Cerrar sesión"
          nextPath="/admin/login"
        >
          {null}
        </EditorForm>
      </header>
      <nav className="admin-nav" aria-label="Administración">
        <Link href="/admin">Documentos</Link>
        <Link href="/admin/obras/nueva">Nuevo ingreso</Link>
        <Link href="/admin/catalogo">Autores, fuentes y licencias</Link>
        <Link href="/biblioteca">Ver biblioteca pública</Link>
      </nav>
      {children}
    </>
  );
}
