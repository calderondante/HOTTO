import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import type { Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "HOTTO · Comunidad jurídica", template: "%s | HOTTO" },
  description:
    "Comunidad jurídica y biblioteca digital: materias, lecturas y casos de estudio para aprender Derecho.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#17141c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR">
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div className="shell footer-inner">
            <div className="footer-brand">
              <strong>
                HOTTO<span>.</span>
              </strong>
              <p>Conocimiento. Comunidad. Derecho.</p>
            </div>
            <nav aria-label="Pie de página">
              <Link href="/biblioteca">Biblioteca</Link>
              <Link href="/biblioteca/materias">Materias</Link>
              <Link href="/biblioteca/jurisprudencia">Jurisprudencia</Link>
            </nav>
            <p className="footer-note">
              MVP de demostración · Recursos de prueba
              <br />© 2026 HOTTO
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
