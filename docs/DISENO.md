# Diseño

Identidad confirmada: negro, dorado, violeta y blanco. La referencia visual aún
no se ha incorporado; `design/README.md` indica dónde guardarla. Los valores de
CSS son provisionales, no una reproducción de esa referencia.

El sistema usa tokens semánticos de shadcn/ui en `src/app/globals.css`, con
variables de marca separadas. Se conserva una base neutral y tipografía del
sistema para que el build no requiera descargas externas de fuentes.

Diseñar primero la consulta de la biblioteca: contenido legible, fichas claras,
filtros comprensibles y orientación dentro de cada materia. Priorizar contraste,
jerarquía tipográfica, foco visible, teclado, labels y estados vacíos honestos.
Verificar WCAG 2.2 AA con los componentes y combinaciones de colores reales.

Respetar `prefers-reduced-motion`. Las animaciones deben explicar cambios de
estado o mejorar orientación, evitando movimiento decorativo repetitivo. Validar
interacciones móviles en viewport pequeño y, cuando corresponda, hardware real.

No hay diseño final, logo generado, pantallas institucionales ni lector en esta
etapa. Las skills se aplican por tarea según `AGENTS.md`, no todas a la vez.
