import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOTTO",
  description: "Comunidad jurídica argentina. Proyecto en preparación.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
