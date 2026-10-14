import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Administración documental",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main id="contenido" className="shell admin-container">
      {children}
    </main>
  );
}
