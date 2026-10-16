import { adminContext } from "@/lib/admin/data";
import { Intake } from "@/components/admin/intake";
export default async function New() {
  const ctx = await adminContext();
  if (ctx.status !== "ready") return null;
  return (
    <>
      <div className="admin-page-intro">
        <p className="eyebrow">NUEVO INGRESO</p>
        <h1>Sumá una nueva lectura.</h1>
        <p>
          Archivo, enlace o referencia. Primero guardamos el ingreso privado;
          después completamos su ficha.
        </p>
      </div>
      <Intake />
    </>
  );
}
