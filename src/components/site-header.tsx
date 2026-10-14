"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Menu } from "lucide-react";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/biblioteca", label: "Biblioteca" },
  { href: "/biblioteca/materias", label: "Materias" },
  { href: "/biblioteca/jurisprudencia", label: "Jurisprudencia" },
];
export function SiteHeader() {
  const pathname = usePathname();
  const navigation = links.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      aria-current={pathname === link.href ? "page" : undefined}
    >
      {link.label}
    </Link>
  ));
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link
          className="wordmark"
          translate="no"
          href="/"
          aria-label="HOTTO, inicio"
        >
          <span>COMUNIDAD JURÍDICA</span>
          <strong>
            HOTTO<span className="brand-dot">.</span>
          </strong>
        </Link>
        <nav className="desktop-nav" aria-label="Principal">
          {navigation}
        </nav>
        <Link className="header-library" href="/biblioteca">
          <BookOpen size={18} aria-hidden="true" /> Explorar biblioteca
        </Link>
        <details
          className="mobile-menu"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.currentTarget.open = false;
              e.currentTarget.querySelector("summary")?.focus();
            }
          }}
        >
          <summary aria-label="Menú de navegación">
            <Menu size={24} aria-hidden="true" />
          </summary>
          <nav
            aria-label="Principal móvil"
            onClick={(e) => {
              const element = e.target as HTMLElement;
              if (element.closest("a"))
                element.closest("details")?.removeAttribute("open");
            }}
          >
            {navigation}
          </nav>
        </details>
      </div>
    </header>
  );
}
