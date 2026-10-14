import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Scale,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/library/presentation";

export default function Home() {
  return (
    <main id="contenido">
      <section className="home-hero">
        <div className="shell home-hero-inner">
          <div className="home-hero-copy">
            <p className="eyebrow">COMUNIDAD JURÍDICA · ARGENTINA</p>
            <h1>
              Primero en el tiempo,
              <br />
              <em>mejor en el derecho.</em>
            </h1>
            <p>
              Un espacio para aprender, conectar y ejercer el Derecho con
              propósito. Empezamos por lo esencial: el conocimiento compartido.
            </p>
            <Button
              render={<Link href="/biblioteca" />}
              nativeButton={false}
              role="link"
              size="lg"
            >
              Entrar a la biblioteca
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
            <span className="hero-footnote">Acceso abierto · Sin registro</span>
          </div>
          <div className="hero-library-art" aria-hidden="true">
            <div className="hero-circle" />
            <span className="art-caption">EL CONOCIMIENTO NOS CONECTA</span>
            <div className="hero-book-back">
              <BookCover
                title="Constitución y ciudadanía"
                subtitle="Derechos, instituciones y vida pública"
                tone="gold"
                large
              />
            </div>
            <div className="hero-book-front">
              <BookCover
                title="Primeras preguntas del Derecho"
                subtitle="Una guía para comenzar"
                tone="plum"
                large
              />
            </div>
            <span className="art-footer">BIBLIOTECA JURÍDICA / HOTTO</span>
          </div>
        </div>
      </section>
      <section className="shell home-library">
        <div className="section-heading">
          <div>
            <p className="eyebrow">APRENDER PARA EJERCER</p>
            <h2>
              Una biblioteca,
              <br />
              muchas formas de aprender.
            </h2>
          </div>
          <p>
            Recorré materias, descubrí lecturas y explorá casos de estudio. Un
            punto de encuentro entre la formación y la práctica jurídica.
          </p>
        </div>
        <div className="path-grid">
          {[
            {
              href: "/biblioteca/materias",
              title: "Materias",
              copy: "34 materias del plan de Abogacía 2018 de la UNLaM, organizadas para empezar tu recorrido.",
              Icon: GraduationCap,
              number: "01",
            },
            {
              href: "/biblioteca",
              title: "Manuales y doctrina",
              copy: "Lecturas por título, autor y tema. Fichas claras sobre la disponibilidad de cada recurso.",
              Icon: BookOpen,
              number: "02",
            },
            {
              href: "/biblioteca/jurisprudencia",
              title: "Jurisprudencia",
              copy: "Casos de estudio para practicar la lectura de decisiones y la argumentación jurídica.",
              Icon: Scale,
              number: "03",
            },
          ].map((p) => (
            <Link className="path-card" href={p.href} key={p.href}>
              <div>
                <p.Icon size={27} strokeWidth={1.3} aria-hidden="true" />
                <span>{p.number}</span>
              </div>
              <h3>{p.title}</h3>
              <p>{p.copy}</p>
              <span className="path-link">
                Explorar
                <ArrowUpRight size={18} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section id="comunidad" className="community-section">
        <div className="shell">
          <p className="eyebrow">NUESTRA COMUNIDAD</p>
          <h2>
            El Derecho se construye
            <br />
            <em>con otros.</em>
          </h2>
          <p>
            HOTTO nace para acercar conocimiento y crear vínculos entre
            estudiantes y profesionales. Esta primera versión pone la biblioteca
            en tus manos; los espacios de comunidad se incorporarán en próximas
            etapas.
          </p>
          <Link className="text-link" href="/biblioteca">
            Conocé la biblioteca
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
