import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Scale,
  FileText,
  ArrowRight,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { subjects } from "@/lib/library/data";
import { kindLabels, type CatalogItem } from "@/lib/library/types";

export function Breadcrumbs({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav className="breadcrumbs" aria-label="Ruta de navegación">
      <ol>
        <li>
          <Link href="/">Inicio</Link>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function PageIntro({
  eyebrow,
  title,
  children,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <section className={dark ? "page-intro dark-intro" : "page-intro"}>
      <div className="shell">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <div className="intro-copy">{children}</div>
      </div>
    </section>
  );
}
export function DemoNotice() {
  return (
    <div className="demo-notice">
      <span className="status-dot" aria-hidden="true" />
      <p>
        <strong>Una biblioteca en construcción.</strong> Los recursos y autores
        de esta entrega son muestras de demostración. No constituyen
        bibliografía universitaria ni asesoramiento jurídico.
      </p>
    </div>
  );
}
export function BookCover({
  title,
  subtitle,
  tone,
  large = false,
  demo = true,
}: {
  title: string;
  subtitle: string;
  tone: CatalogItem["cover"];
  large?: boolean;
  demo?: boolean;
}) {
  return (
    <div
      className={`book-cover cover-${tone}${large ? " cover-large" : ""}`}
      aria-hidden="true"
    >
      <span className="cover-imprint">HOTTO / BIBLIOTECA</span>
      <div>
        <span className="cover-rule" />
        <span className="cover-title">{title}</span>
        <span className="cover-subtitle">{subtitle}</span>
      </div>
      <span className="cover-edition">
        {demo ? "EDICIÓN DE DEMOSTRACIÓN" : "REFERENCIA BIBLIOGRÁFICA"}{" "}
        <span>H.</span>
      </span>
    </div>
  );
}
export function ResourceCard({ item }: { item: CatalogItem }) {
  const Icon =
    item.kind === "book"
      ? BookOpen
      : item.kind === "jurisprudence"
        ? Scale
        : FileText;
  return (
    <article className="resource-card">
      <Link
        href={item.href}
        className="resource-main"
        aria-label={`Ver ficha: ${item.title}`}
      >
        {item.kind === "book" ? (
          <div className={`cover-stage stage-${item.cover}`}>
            <BookCover
              title={item.title}
              subtitle={item.subtitle}
              tone={item.cover}
              demo={item.demo}
            />
          </div>
        ) : (
          <div className={`resource-art stage-${item.cover}`}>
            <Icon size={40} strokeWidth={1} aria-hidden="true" />
            <span>
              {item.kind === "jurisprudence"
                ? item.demo
                  ? "CASO DE ESTUDIO"
                  : "JURISPRUDENCIA"
                : "GUÍA DE LECTURA"}
            </span>
          </div>
        )}
        <div className="resource-body">
          <span className="resource-kind">
            <Icon size={14} aria-hidden="true" />
            {kindLabels[item.kind]}
          </span>
          <h3>{item.title}</h3>
          <p>{item.authors}</p>
        </div>
      </Link>
      <div className="resource-footer">
        <Badge variant={item.available ? "secondary" : "outline"}>
          {item.available ? (
            <>
              <Download size={12} aria-hidden="true" />{" "}
              {item.demo ? "PDF de muestra" : "PDF disponible"}
            </>
          ) : item.kind === "book" ? (
            "Referencia sin archivo"
          ) : (
            "Muestra de lectura"
          )}
        </Badge>
        {item.demo && <span className="tiny-label">DEMO</span>}
      </div>
    </article>
  );
}
export function ResourceGrid({ items }: { items: CatalogItem[] }) {
  return (
    <div className="resource-grid">
      {items.map((item) => (
        <ResourceCard key={item.id} item={item} />
      ))}
    </div>
  );
}
export function SubjectLink({ id }: { id: string }) {
  const subject = subjects.find((s) => s.id === id);
  return subject ? (
    <Link className="subject-tag" href={`/biblioteca/materias/${subject.slug}`}>
      {subject.shortName}
      <ArrowUpRight size={14} aria-hidden="true" />
    </Link>
  ) : null;
}
export function ExploreLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="outline"
      render={<Link href={href} />}
      nativeButton={false}
      role="link"
    >
      {children}
      <ArrowRight aria-hidden="true" size={16} />
    </Button>
  );
}
