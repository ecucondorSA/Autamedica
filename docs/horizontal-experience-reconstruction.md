# Registro de reconstrucción – Experiencia horizontal

## Contexto
El 15/05 se realizaron ajustes extensivos sobre los paneles profesionales y la experiencia horizontal del landing portal. El entorno se restableció antes de commitear, por lo que se documentan aquí todos los cambios aplicados para facilitar su reimplementación.

## Cambios aplicados

### apps/web-app/src/components/landing/ProfessionalPatientsFeatures.tsx
- Se redefinió el layout principal (`return`) como un grid de dos filas (`grid-template-rows: auto 1fr`) para controlar el uso vertical en `100vh`.
- Se redujeron `padding` y `gap` dentro de `.content`, `.features-list` y la sección de video para evitar overflow.
- El contenedor de video recibió altura flexible con `height: clamp(250px, 34vh, 380px)` y `object-fit: cover` para mantener proporción.
- Listados y CTA se redistribuyeron usando `grid` y `flex` con `justify-content: stretch` para abarcar el ancho disponible sin provocar scroll externo.
- Se introdujeron breakpoints en `1520px`, `1280px`, `1024px` y `820px` (media queries) para ajustar tipografía, tamaño de video y espaciados.
- Se habilitó `overflow: auto` en contenedores secundarios (testimonios/soporte) con scroll interno discreto, fondo consistente (`background: rgba(255,255,255,0.04)`) y `backdrop-filter` suave.

### apps/web-app/src/components/landing/ProfessionalDoctorsFeatures.tsx
- Reflejó la misma estructura grid, alineando cards y tablas a una sola columna en breakpoints menores.
- Ajustes de tipografía y botones intermedios (`font-size: clamp(0.9rem, 1.8vw, 1.1rem)`) para estabilizar la altura total.
- Se limitaron componentes anidados (ej. agenda) a `max-height` dinámico y `overflow: auto` para evitar desbordes sobre 1440×900.

### apps/web-app/src/components/landing/ProfessionalCompaniesFeatures.tsx
- Compactación del grid de planes con `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`.
- Popovers/beneficios migraron a contenedores con `position: relative` y `z-index` alto, permitiendo scroll interno.
- Reducción de `padding-inline` en `desktop` y `mobile` para cubrir `100vw` sin dejar franjas negras.

### apps/web-app/src/components/experience/HorizontalExperience.tsx
- Se introdujo `slideBackgrounds` (array) para definir color/gradiente por slide y evitar transparencias.
- Estructura HTML reemplazada por `<div className="hx">`, `<div className="hx-track">`, `<section className="hx-slide">` y `<div className="hx-slide-inner">`.
- `.hx-track` configurado como grid de scroll horizontal sin `gap`, con `scroll-snap-type: x mandatory`, `padding-inline` controlado y barras ocultas (`::-webkit-scrollbar { display: none; }`).
- Cada `.hx-slide` ocupa `100vw × 100vh`, `overflow: clip`, `background` proveniente de `slideBackgrounds` o fallback neutro.
- `.hx-slide-inner` utiliza `min-height: 100%`, `display: grid`, y `overflow-y: auto` para permitir scroll interno sólo cuando la sección lo requiere.
- Se añadieron gradientes personalizados (`linear-gradient(180deg, rgba(...)`) en gaps del track para eliminar destellos negros durante el snap.

## Validaciones pendientes
- Ejecutar `pnpm lint` (persisten warnings en módulos de auth/monitoring).
- QA en 1920×1080, 1440×900, 1366×768 y mobile para verificar: ocupación completa de viewport, scroll interno condicional y ausencia de franjas negras.
- Confirmar que los videos conservan proporción y no generan letterboxing en breakpoints medios.

## Problemas detectados antes de la pérdida
- Borde negro residual causado por la combinación `padding-inline` + `100vw`; posible solución: ajustar `padding` o usar `scrollbar-gutter: stable both-edges`.
- Popovers de planes en empresas solapaban texto por falta de fondo sólido (`background-color`) y `z-index` insuficiente.
- Slides con contenido corto sin background específico seguían mostrando franjas; revisar fallback neutro en `slideBackgrounds`.

## Próximos pasos sugeridos
1. Reaplicar los cambios descritos en los componentes mencionados siguiendo la estructura grid/scroll indicada.
2. Ajustar `padding` y `scrollbar-gutter` en el track horizontal para eliminar bordes residuales.
3. Revisar popovers y backgrounds por slide antes de correr `pnpm lint` y QA en las resoluciones objetivo.
