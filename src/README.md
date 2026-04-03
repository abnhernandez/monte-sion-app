# src

Capa de arquitectura limpia para nueva lógica desacoplada de UI.

- `src/components`: componentes de presentación puros.
- `src/features`: casos de uso por dominio.
- `src/lib`: utilidades transversales y contratos internos.
- `src/services`: acceso a APIs/infraestructura.

Este árbol convive con `app/` durante una migración incremental en Next.js App Router.
