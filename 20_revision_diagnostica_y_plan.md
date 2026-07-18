# REVISIÓN DIAGNÓSTICA Y PLAN DE CORRECCIÓN
## Sistema Clínico ACT — PWA v1.x
**Fecha:** 2026-07-18 · **Alcance:** todo el código de la app (HTML, JS, CSS, SW, manifest) y coherencia con los documentos de gobernanza.

Este documento es **diagnóstico y plan**: no introduce cambios de código. Ningún punto propone alterar el propósito clínico definido en el Marco Canónico v1.0; las correcciones son técnicas (errores, robustez, UX) y por lo tanto compatibles con la serie v1.x, salvo el punto D-3, que requiere decisión del propietario.

---

## 1. Estado general

La aplicación arranca, los módulos renderizan y el flujo principal (panel → sesión → herramientas → resumen → archivo) funciona. La base modular (core / modules / ui / data) es sana. Sin embargo, existen:

- **2 errores con pérdida de datos o bloqueo de arranque** (A-1, A-6).
- **1 trampa de navegación** que impide volver al panel desde la sesión (A-2).
- **CSS faltante** para componentes que el JS sí usa (A-5): toasts invisibles, marcas de la Diana sin estilo.
- **Instalación PWA rota** por iconos inexistentes (A-4).
- **Inyección de HTML sin escapar en toda la app**: el módulo de seguridad existe pero es código muerto (B-1).
- Varias fricciones de UX menores y una **discrepancia entre las actas de gobernanza y lo implementado** (D-3).

---

## 2. Hallazgos

### A. Errores críticos

| # | Hallazgo | Ubicación |
|---|----------|-----------|
| A-1 | **Pérdida de sesión en curso.** En "Comenzar nueva sesión", si hay sesión en curso y el clínico **cancela** el confirm, el código igualmente sobrescribe `state.persistence` con una sesión vacía y llama `saveState()`, destruyendo la sesión pendiente sin archivarla. | `ui/dashboard.js:238-249` |
| A-2 | **Trampa de navegación.** El botón "Finalizar" de la pantalla Hexaflex llama a `renderHome`, que en `app.js` es `navigateToHome` → vuelve a renderizar el propio Hexaflex. No existe camino de regreso al panel de consultantes desde la sesión (solo vía Resumen → "Finalizar Sesión", que además archiva). Debe llamar a `navigateToDashboard` (guardando antes). | `app.js:31-34`, `modules/hexaflex.js:38,138` |
| A-3 | **Búsqueda de consultantes casi inutilizable.** Cada tecla re-renderiza el dashboard completo y el input pierde el foco: hay que hacer clic por cada carácter (en móvil, el teclado se cierra). Debe filtrarse solo la lista o restaurarse el foco/cursor. | `ui/dashboard.js:182-185` |
| A-4 | **Instalación PWA rota.** `manifest.json` referencia `icons/icon-192.png` e `icons/icon-512.png`, pero el directorio `icons/` no existe → 404, sin icono de instalación y criterio de instalabilidad incumplido. | `manifest.json:9-20` |
| A-5 | **Clases CSS usadas pero no definidas** en `styles/main.css`: `.toast`/`.toast.show` (los avisos "✓ Sesión Guardada" y "✓ Resumen copiado" se insertan como texto plano sin posición ni estilo), `.diana-mark` (las marcas de la Diana quedan como números sueltos, sin tamaño ni forma), `.switch-aura` (aura del Interruptor de la Lucha y SOS sin efecto; en SOS además usa `inset` sin `position:absolute`), `.animate-float`, `.loader`. | `ui/utils.js:5-15`, `modules/importa.js:63`, `modules/abrirse.js:729`, `modules/sos.js:73`, `index.html:49` |
| A-6 | **Arranque frágil.** `JSON.parse(localStorage.getItem('act_patients'))` a nivel de módulo sin `try/catch`: un valor corrupto rompe la importación de `state.js` y deja la app en blanco de forma permanente. | `core/state.js:36` |
| A-7 | **Numeración del historial invertida.** Por el `map(...).reverse()` con etiqueta `length - idx`, la sesión más reciente se muestra como "Sesión 1" y la más antigua como "Sesión N". El botón "Ver Detalles" sí abre la sesión correcta; solo la etiqueta miente. | `modules/resumen.js:463-472` |
| A-8 | **Crash potencial en historial.** `renderHistoryView` accede a `patient.name` sin comprobar que exista un consultante seleccionado. | `modules/resumen.js:454-460` |

### B. Seguridad y robustez

| # | Hallazgo | Ubicación |
|---|----------|-----------|
| B-1 | **`core/security.js` es código muerto.** `escapeHTML`/`sanitizeObject` no se importan en ningún archivo. Todo texto introducido por el usuario (nombre del consultante, pensamientos, clima, matrix, snippets, cargas, respuestas…) se interpola sin escapar en `innerHTML` en dashboard, resumen, abrirse, presente, analisis y estres. Consecuencias: un texto con `<`, `>` o comillas rompe el render y el resumen; y es una inyección de HTML/script almacenada (XSS local). En una herramienta clínica con nombres y contenido de pacientes, debe escaparse **todo** texto libre en el punto de render. | `core/security.js` (sin usos); p. ej. `ui/dashboard.js:129`, `modules/resumen.js:89,103`, `modules/abrirse.js:154` |
| B-2 | **Service worker sin estrategia de actualización.** Cache-first para todos los assets propios: los usuarios no reciben ninguna versión nueva hasta que se cambie `CACHE_NAME` a mano (hoy `act-clinical-v2`). Además el handler de `fetch` no filtra peticiones no-GET y cachea respuestas de fuentes sin comprobar `response.ok`. Recomendado: stale-while-revalidate (o network-first para navegación) + versión de caché derivada del despliegue + solo GET. | `service-worker.js` |
| B-3 | **Estado del historial sin migración defensiva.** Sesiones antiguas pueden carecer de campos que el código nuevo asume (`estres`, `evitacion`, `paso`); el resumen ya se defiende bastante bien, pero `renderMatrixTool` accede a `state.persistence.matrix[id]` sin fallback si se retoma una sesión archivada vieja. Conviene un normalizador único al cargar/retomar sesión. | `modules/analisis.js:68`, `core/state.js` |

### C. UX y detalles funcionales

| # | Hallazgo | Ubicación |
|---|----------|-----------|
| C-1 | Los sliders de la Radio (volumen y sintonía) re-renderizan toda la herramienta en cada evento `input`, lo que corta el arrastre y hace el control entrecortado. Actualizar solo los nodos afectados. | `modules/abrirse.js:615-625` |
| C-2 | Visualizador: los pensamientos muestran `cursor: move` pero **no hay drag implementado**; solo selección con `mousedown` (sin `pointerdown`/touch explícito). Implementar arrastre con Pointer Events o quitar el cursor engañoso. | `modules/abrirse.js:235-240` |
| C-3 | Respiración SOS: la etiqueta de fase nunca se actualiza (el callback `update` está vacío — "Simple phase indicator logic could go here"); el patrón 4-7-8 no indica en qué fase se está. En STOP sí funciona (`a.reversed`). | `modules/sos.js:92-101` |
| C-4 | El tema claro/oscuro no se persiste (siempre arranca oscuro) y el toggle llama a `lucide.createIcons()` sin necesidad. Guardar `state.theme` en localStorage y aplicarlo al arrancar. | `app.js:107-112` |
| C-5 | "Cerrar" en SOS siempre vuelve al Hexaflex, aunque el SOS se abriera desde dentro de otra herramienta: se pierde el contexto de trabajo. Guardar la vista previa y restaurarla. | `modules/sos.js:40-43`, `app.js:104-105` |
| C-6 | 5 Sentidos: "Finalizar" en el último sentido vuelve en bucle al primero (`(current+1) % length`), sin pantalla de cierre ni salida. | `modules/presente.js:231-234` |
| C-7 | Vaso de Estrés: cada chip añadido re-renderiza el módulo entero y el panel de chips (con `overflow-y`) pierde su posición de scroll. | `modules/estres.js:206,381` |
| C-8 | `keypress` está deprecado (inputs de abrirse/presente); migrar a `keydown`. Valores de sliders guardados como string (`blur`, `opacity`, `spacing` vía `e.target.value`); normalizar a número. | `modules/abrirse.js:264,273-293` |
| C-9 | Sin soporte `prefers-reduced-motion`: todas las animaciones (incluidas las de respiración, que son clínicas y deben quedar) conviven con animaciones decorativas que deberían respetar la preferencia del sistema. | `styles/main.css`, `core/animations.js` |

### D. Higiene del repositorio y gobernanza

| # | Hallazgo | Ubicación |
|---|----------|-----------|
| D-1 | `act.zip` (772 KB) versionado en la raíz del repo. Si es un backup, eliminarlo del control de versiones. | `act.zip` |
| D-2 | Los ~20 documentos MD normativos conviven con el código en la raíz. Mover a `docs/` (junto a `gobernanza/`, `modulos_logica/`, etc.) clarificaría qué se despliega y qué es normativo. | raíz del repo |
| D-3 | **Discrepancia normativa a resolver por el propietario.** El Acta de Congelación v1.0 declara imposibles en v1.x la "persistencia", el "registro longitudinal" y la "comparación entre sesiones"; sin embargo, la app implementa panel de consultantes, sesiones persistidas en localStorage, historial por paciente y radar de procesos. O bien las actas se actualizan (v1.1/v2.0 con justificación clínica, según `01_gobernanza_y_reglas.md`), o bien la app debe recortarse. **Este plan no toma esa decisión**; solo la deja registrada. | `19_acta_congelacion_sistema_v1.md` §4-5 vs. `core/state.js`, `ui/dashboard.js`, `modules/resumen.js` |

---

## 3. Plan de corrección propuesto

Orden por riesgo clínico y dependencias. Cada fase es un PR pequeño y verificable; ninguna toca el significado clínico de las herramientas.

### Fase 1 — Integridad de datos y navegación (crítica)
1. **A-1**: en "Comenzar nueva sesión", si hay sesión en curso y el clínico cancela, **abortar** sin tocar `state.persistence`. Ofrecer explícitamente "archivar y empezar" vs. "cancelar".
2. **A-6**: envolver la lectura de `act_patients` en `try/catch` con fallback a `[]` (y aviso si hubo datos corruptos).
3. **A-2**: "Finalizar" del Hexaflex → guardar sesión y `navigateToDashboard` (la sesión queda "en curso", retomable; archivar sigue siendo acción del Resumen).
4. **A-8**: guardia en `renderHistoryView` (sin paciente → volver al panel).
5. **A-7**: corregir la numeración del historial (más antigua = Sesión 1).

**Verificación:** crear paciente → iniciar sesión → cargar datos → volver al panel → retomar → archivar; intentar "nueva sesión" cancelando el confirm y comprobar que la sesión pendiente sobrevive; corromper `act_patients` a mano y comprobar que la app arranca.

### Fase 2 — Seguridad de render (crítica)
1. **B-1**: usar `escapeHTML` de `core/security.js` en **todos** los puntos donde se interpola texto libre del usuario (dashboard, resumen/tarea/historial, visualizador, hojas, radio/snippets, clima, matrix, evitación, estrés). Añadir un helper corto (p. ej. `esc()`) para mantener legibilidad.
2. **A-3**: filtrar la lista de consultantes sin re-render completo (o restaurar foco y posición del cursor tras render).

**Verificación:** nombres y textos con `<script>`, `<img onerror>`, comillas y `&` deben renderizar literalmente en todas las vistas, incluido el texto copiado del resumen.

### Fase 3 — PWA y estilos rotos
1. **A-4**: generar `icons/icon-192.png` e `icon-512.png` (+ `maskable` opcional) coherentes con la identidad visual, o retirar las entradas del manifest hasta tenerlos.
2. **A-5**: definir en `main.css` las clases faltantes: `.toast/.toast.show` (posición fija, animación), `.diana-mark` (tamaño, forma, transición), `.switch-aura` (posición y gradiente), `.loader`; corregir el aura del SOS (`position:absolute`).
3. **B-2**: service worker con caché versionada por release, estrategia stale-while-revalidate para assets propios, solo GET, y comprobación `response.ok` antes de cachear fuentes.
4. Registrar los assets nuevos (iconos) en la lista de precache.

**Verificación:** Lighthouse PWA instalable; toast visible al guardar; marcas de la Diana correctamente dibujadas; publicar un cambio y comprobar que llega tras recarga sin cambiar el nombre de caché a mano.

### Fase 4 — Fricciones de UX (menor, sin cambio clínico)
1. **C-1**: sliders de la Radio con actualización dirigida (sin re-render).
2. **C-2**: arrastre de pensamientos con Pointer Events (o eliminar `cursor: move`).
3. **C-3**: indicador de fase en la respiración SOS (Inhala / Mantén / Exhala).
4. **C-4**: persistir tema en localStorage.
5. **C-5**: SOS restaura la vista desde la que se abrió.
6. **C-6**: pantalla de cierre en 5 Sentidos ("Estás aquí") con salida explícita.
7. **C-7**: conservar scroll del panel de chips del Vaso de Estrés.
8. **C-8**: `keydown` en lugar de `keypress`; normalizar valores numéricos de sliders.
9. **C-9**: `@media (prefers-reduced-motion: reduce)` para animaciones decorativas (manteniendo las respiraciones, que son el ejercicio).

**Verificación:** prueba manual en móvil (touch) y escritorio de cada herramienta.

### Fase 5 — Higiene y gobernanza
1. **D-1**: eliminar `act.zip` del repositorio.
2. **D-2**: mover documentación normativa a `docs/` y actualizar `12_estructura_tecnica.md` si procede.
3. **B-3**: normalizador de sesión único (`normalizeSession()`) aplicado al cargar/retomar/ver historial.
4. **D-3**: decisión documental del propietario sobre persistencia/historial (acta v1.1 o ajuste de la app). **Bloqueante solo para sí misma**; no condiciona las fases 1-4.

---

## 4. Qué NO propone este plan

Conforme al Acta de Congelación v1.0 y a `01_gobernanza_y_reglas.md`, este plan **no** propone: nuevos módulos, métricas o puntuaciones clínicas, feedback automático, modo paciente, gamificación ni recomendaciones. Toda corrección listada es técnica y preserva el principio de no-control.
