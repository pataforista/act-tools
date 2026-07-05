# REVISIÓN DIAGNÓSTICA Y PLAN DE CORRECCIÓN Y MEJORA
## ACT In-Session — PWA
**Versión 1.0 · Julio 2026**

---

## 1. Alcance y método

Revisión estática completa del código de la aplicación (`index.html`, `app.js`, `core/`, `ui/`, `modules/`, `styles/`, `service-worker.js`, `manifest.json`) contrastada con la documentación normativa del sistema (Marco Canónico, Criterios de Aceptación, Copy Clínico, Actas de Congelación).

Cada hallazgo indica archivo y línea, severidad y corrección propuesta. El plan de la sección 6 ordena todo por fases ejecutables.

**Escala de severidad**
- **P0** — Pérdida de datos, flujo bloqueado o app no funcional. Corregir de inmediato.
- **P1** — Defecto visible que degrada el uso clínico real.
- **P2** — Defecto menor, deuda técnica o estética.

---

## 2. Resumen ejecutivo

La aplicación está funcionalmente rica y clínicamente bien orientada: los ejercicios son experienciales, las guías clínicas por herramienta son un acierto y el rediseño reciente (Vaso de Estrés, FEAR→DARE, Paso Mínimo) es coherente con ACT.

Los problemas graves se concentran en cuatro frentes:

1. **Un caso de pérdida de datos real** al iniciar sesión nueva con una sesión en curso (B1).
2. **Navegación rota**: el botón «Finalizar» de la pantalla principal no hace nada; no existe ruta de regreso al panel sin cerrar la sesión (B2).
3. **Texto del consultante sin escapar en todo el render**: una comilla o un `<` escrito por el paciente rompe la interfaz. `core/security.js` existe pero **ningún módulo lo importa** (B4).
4. **Deriva respecto a la gobernanza**: el acta de congelación v1.0 declara imposibles la persistencia y el registro longitudinal, y la app ya tiene panel multi-paciente, historial y radar de procesos (G1). Hay que resolverlo en el plano documental, no ocultarlo.

En estética, el patrón dominante es **~300 estilos inline** que producen inconsistencia tipográfica, tema claro roto y duplicación (el bloque «Aterrizaje clínico» está copiado 5 veces). Todo es corregible sin reescribir la app.

---

## 3. Hallazgos de utilidad (funcionales y de flujo)

### 3.1 P0 — Críticos

**B1 · Pérdida de sesión en curso al iniciar una nueva** — `ui/dashboard.js:238-249`
El `confirm()` solo condiciona el archivado, no el reinicio:
```js
if (patient.currentSession && confirm('…')) archiveCurrentSession();
state.persistence = getDefaultSession();   // se ejecuta SIEMPRE
saveState();                               // sobrescribe la sesión en curso
```
Si el clínico pulsa «Cancelar», la sesión en curso se destruye igualmente sin archivarse.
**Corrección:** si hay sesión en curso y el usuario cancela, abortar (`return`). Considerar archivar siempre por defecto (nunca destruir).

**B2 · «Finalizar» en la pantalla Hexaflex no hace nada** — `modules/hexaflex.js:38,138` + `app.js:33`
El botón llama a `renderHome`, que es `navigateToHome`, que vuelve a renderizar el propio hexaflex. No existe ninguna ruta de la sesión al panel de consultantes salvo «Finalizar Sesión» dentro de Resumen (que archiva).
**Corrección:** en hexaflex, «Finalizar» debe llevar al Resumen (flujo de cierre) o al panel guardando la sesión como pendiente. Pasar `navigateToDashboard` al módulo. Además, en los módulos internos «←» y «Finalizar» hacen exactamente lo mismo (`ui/utils.js:37-39`): dejar «←» (volver al hexaflex) y eliminar o re-semантizar «Finalizar».

**B4 · Entrada del consultante sin escapar (inyección HTML / UI rota)** — global
`core/security.js` (escapeHTML, sanitizeObject) **no se importa en ningún archivo**. Todo el contenido escrito por paciente/clínico se interpola crudo en `innerHTML` y en atributos `value="…"`:
- Nombres de consultantes: `ui/dashboard.js:129` y término de búsqueda `:107`.
- Pensamientos, clima, matrix, respuestas, snippets, cargas personalizadas: `modules/abrirse.js:154`, `presente.js:275`, `analisis.js:69`, `estres.js:321,337`, `resumen.js` (todas las secciones).
- Atributos `value=` sin escapar comillas: `presente.js:291-293`, `abrirse.js:163-165,502,582-584` (algunos sitios hacen `.replace(/"/g,'&quot;')` a mano, otros no — señal de que falta la utilidad central).
Consecuencia práctica: un paciente que escribe `me siento "atrapado" <solo>` rompe el campo o hace desaparecer texto en el resumen.
**Corrección:** usar `escapeHTML()` en **todos** los puntos de interpolación de datos de usuario (render e informes), y un helper `escapeAttr()` para atributos. Es un cambio mecánico y de bajo riesgo; convertirlo en regla del proyecto.

**B8 · PWA no instalable: iconos inexistentes** — `manifest.json:9-20`
Referencia `icons/icon-192.png` y `icons/icon-512.png`; el directorio `icons/` no existe en el repo. La instalación como PWA falla la validación y el icono aparece roto.
**Corrección:** generar ambos PNG (más `maskable`), añadirlos al repo y al `ASSETS` del service worker; añadir `apple-touch-icon` en `index.html`.

### 3.2 P1 — Degradan el uso real

**B3 · El buscador de consultantes pierde el foco en cada tecla** — `ui/dashboard.js:182-185`
Cada `input` re-renderiza el dashboard completo; el campo se recrea y el foco (y el cursor) se pierde tras el primer carácter. En la práctica el buscador es inusable.
**Corrección:** re-renderizar solo `#patient-list` (extraer `renderPatientList()`), o restaurar foco/posición tras render. Aplicar el mismo criterio a los contadores.

**B6 · El ruido blanco de la Radio sigue sonando fuera del módulo** — `modules/abrirse.js:41-43` + `app.js:104-105`
La limpieza de audio solo está atada a «←», «Finalizar» y el cambio de pestaña interno. Si el clínico pulsa el botón SOS flotante (o cualquier navegación futura), el ruido continúa sonando encima del módulo de crisis.
**Corrección:** centralizar un `cleanup` de módulo en el router (`loadModule` guarda un callback de salida y lo invoca antes de cada navegación). `radioAudio.stop()` pasa a ese ciclo de vida.

**B7 · Sliders que se re-renderizan durante el arrastre** — `modules/abrirse.js:615-625` (volumen/sintonía), `:273-293` (propiedades del pensamiento)
El evento `input` dispara `internalRender()`, que destruye y recrea el slider en pleno gesto: el arrastre se corta a cada pixel. Mismo patrón en el selector de color y tamaño de fuente de la radio.
**Corrección:** en `input`, actualizar solo los nodos afectados (texto, blur, opacity vía `style`); re-render completo solo en `change`.

**B5 · Historial con numeración invertida** — `modules/resumen.js:464-472`
`Sesión ${history.length - idx}` + `.reverse()` produce que la sesión **más reciente** se muestre como «Sesión 1» y la más antigua como «Sesión N». La numeración clínica esperable es la inversa (sesión 1 = primera).
**Corrección:** `Sesión ${idx + 1}` manteniendo el orden de lista descendente (más reciente arriba), y añadir la fecha ya presente como desambiguación.

**B10 · Tema claro roto y no persistente** — `app.js:107-112`, `styles/main.css`, inline styles globales
- El toggle no persiste (`state.theme` nunca va a `localStorage`); cada recarga vuelve a oscuro.
- Decenas de colores incrustados asumen fondo oscuro: `rgba(255,255,255,0.05)` como fondo de botones/inputs, `color: white` en pensamientos y textos (`abrirse.js:149`, `sos.js`, `estres.js`), `#050a05` etc. En tema claro hay texto blanco sobre blanco y controles invisibles.
**Corrección:** persistir el tema; migrar los colores inline a tokens (`--glass-bg`, `--color-text-*`, `--hex-*`) que ya varían por tema. (Ver E1/E2.)

**B9 · Actualizaciones de la app no llegan a los usuarios** — `service-worker.js`
Estrategia cache-first con nombre de caché manual (`act-clinical-v2`): tras cada despliegue, los usuarios siguen con la versión vieja hasta que alguien recuerde subir el número. Riesgo adicional de desfase entre módulos (unos cacheados nuevos y otros viejos).
**Corrección:** network-first (con fallback a caché) para navegación/HTML, stale-while-revalidate para JS/CSS, o versionado automático del nombre de caché en el flujo de publicación. Cachear las respuestas de fuentes solo si `response.ok`.

**B11 · Sesiones con esquema antiguo pueden romper los módulos** — `modules/presente.js:313-318`, `abrirse.js`, `estres.js:152-156`
`resumen.js` contempla datos legados (smart/dots), pero los módulos asumen el esquema nuevo: si `grounding` existe sin la clave `cielo` (sesión archivada con versión anterior y luego retomada), `grounding.cielo[key] = …` lanza `TypeError`. Los bloques `??=` de inicialización están duplicados con subconjuntos distintos de claves en 5 sitios.
**Corrección:** una única función `migrateSession(session)` en `core/state.js` que complete claves faltantes al cargar/retomar cualquier sesión; eliminar los `??=` dispersos.

**B15 · La selección de consultante no re-vincula la sesión activa** — `core/state.js` + `ui/dashboard.js:192-199`
`state.persistence` no se re-vincula al cambiar `currentPatientId`; queda apuntando a la sesión del paciente anterior hasta que se pulsa «Comenzar/Continuar». Hoy no hay ruta que guarde en ese intervalo, pero cualquier cambio futuro (p. ej. permitir entrar a sesión desde otro sitio) escribiría los datos del paciente A dentro del paciente B.
**Corrección:** al seleccionar consultante, resetear `state.persistence` (o cargar su `currentSession`); documentar la invariante «persistence pertenece siempre a currentPatientId».

### 3.3 P2 — Menores

**B12 · Falsa affordance de arrastre en el Visualizador** — `modules/abrirse.js:151`
Los pensamientos tienen `cursor: move` y `user-select: none`, pero no hay lógica de drag: solo se seleccionan. **Corrección:** implementar drag con Pointer Events (guardando `x,y`) — valor clínico real: «mover el pensamiento más lejos/más cerca» — o cambiar el cursor a `pointer`.

**B13 · Animaciones huérfanas acumulándose** — `modules/abrirse.js:302`, `presente.js:302-310`, `core/animations.js`
`anime()` con `loop: true` sigue ejecutándose sobre nodos ya desmontados tras cada `innerHTML =`, y `animateDefusion` se vuelve a lanzar en cada re-render (cada tecla) apilando animaciones concurrentes sobre los mismos elementos. En sesiones largas: CPU/batería y jank.
**Corrección:** guardar las instancias y pausarlas antes de cada re-render (patrón ya usado en `sos.js`); integrar con el `cleanup` de módulo de B6. Respetar `prefers-reduced-motion`.

**B16 · `renderHistoryView` sin guarda** — `modules/resumen.js:455-460`
Si no hay consultante seleccionado, `patient.name` lanza excepción. Hoy solo se llega con selección, pero es frágil. **Corrección:** guarda + redirección al panel.

**B17 · Token inexistente `--color-primary-rgb`** — `modules/abrirse.js:200`, `analisis.js:190`
`rgba(var(--color-primary-rgb, 99,102,241), 0.08)` cae siempre en el fallback índigo, que ni siquiera es el dorado primario. **Corrección:** definir `--color-primary-rgb` en `:root` y en `[data-theme=light]`.

---

## 4. Hallazgos de coherencia clínica y gobernanza

**G1 · La implementación contradice el Acta de Congelación v1.0** — `19_acta_congelacion_sistema_v1.md` §4-5 vs. app actual
El acta declara imposibles en v1.x: persistencia, registro longitudinal, comparación entre sesiones. La app tiene panel multi-paciente, sesiones archivadas, historial navegable y un radar por sesión. No es un juicio sobre si esas funciones son buenas (el radar ya incluye el disclaimer correcto «refleja qué procesos se tocaron, no una puntuación»); es una **incoherencia documental** que el propio sistema define como «ruptura».
**Corrección propuesta:** formalizar **v2.0 documental** (nuevo acta que ampare persistencia local mediada por el clínico y defina sus límites: sin scores, sin comparación automática, sin acceso del paciente), o retirar historial/panel. Decisión del propietario clínico; el plan asume la primera opción.

**G2 · Copy con registro mezclado (voseo/tuteo)** — global, contra `08_copy_clinico.md` («segunda persona» única)
Conviven «Escribe lo que notás…» (`presente.js:196`), «Haz clic en el tablero» (`importa.js:52`), «Nombrá lo que estás llevando» (`estres.js:301`), «Retomá cuando lo decidas» (`app.js:89`). Para un instrumento clínico leído en voz alta en sesión, el registro debe ser uno solo.
**Corrección:** decidir voseo o tuteo (el copy más reciente tiende a voseo) y unificar en una pasada; añadir la decisión a `08_copy_clinico.md`.

**G3 · Copy de marketing en el panel** — `ui/dashboard.js:72`
«Un espacio premium para gestionar consultantes…» viola la voz definida (neutral, no promocional). **Corrección:** «Gestión de consultantes, sesiones y continuidad terapéutica.»

**G4 · Datos clínicos sensibles en `localStorage` sin aviso ni respaldo**
Nombres de pacientes y contenido de sesiones viven solo en el navegador: borrar datos del navegador = perder el archivo clínico completo; un dispositivo compartido los expone.
**Corrección (v1 razonable):** (a) exportar/importar JSON cifrable desde el panel; (b) aviso en primer uso sobre dónde viven los datos; (c) valorar seudonimizar (iniciales/alias) en lugar de nombre completo. Cifrado local con passphrase queda como mejora mayor.

---

## 5. Hallazgos de estética y accesibilidad

**E1 · ~300 estilos inline** — todos los módulos
Es la causa raíz de: tema claro roto (B10), inconsistencia de espaciado/tamaños, y duplicación. Los peores ofensores: `renderGuideBadge` (`ui/utils.js:61-103`, un bloque de estilos completo por instancia), pestañas de herramientas (mismo markup inline repetido en 4 módulos), bloque «Aterrizaje clínico» (5 copias), chips con estilos ad-hoc.
**Corrección:** extraer a `main.css` clases: `.tool-tabs`, `.guide-badge`, `.grounding-block`, `.chip`, `.chip--removable`, `.quadrant`, `.property-panel`. No cambiar diseño: consolidarlo.

**E2 · Colores fuera del sistema de tokens**
`#38bdf8`, `#10b981`, `#ef4444`, `#f59e0b`, `#7dd3fc`… repetidos literalmente decenas de veces cuando ya existen `--hex-*`, `--color-success/danger/accent`. Impide tematizar y produce derivas (tres azules distintos para «acercamiento»).
**Corrección:** mapa único de tokens semánticos (`--acerca`, `--aleja`, `--carga`) y sustitución mecánica.

**E3 · Duplicación de componentes**
- Bloque «Aterrizaje clínico» (HTML + listeners + init `??=`): 5 copias casi idénticas (`abrirse.js` ×3, `presente.js` ×1) → un componente `renderGroundingBlock(toolKey, placeholders)` en `ui/utils.js` (elimina también B11 parcialmente).
- Selector de pestañas de herramienta: 4 copias → `renderToolTabs(tools, activeId)`.

**E4 · Iconografía mezclada (emoji vs. lucide)**
🆘 💾 🥤 📋 ← conviven con iconos lucide en la misma pantalla (`index.html:44,56`, `hexaflex.js:124-129`, `utils.js:30`). **Corrección:** lucide para acciones/navegación; emoji solo donde es contenido expresivo del ejercicio (vaso, hoja). Sustituir «←» de texto por `arrow-left`.

**E5 · Tipografía**
- Tamaños ilegibles: `font-size: 0.5rem` (8 px) en cabeceras de cuadrantes Matrix (`analisis.js:66`), `0.6rem` en ejes y áreas (`analisis.js:58-61`, `importa.js:72`). Mínimo recomendado: 0.7rem con `letter-spacing` reducido.
- Escala caótica: 0.5→3rem en saltos arbitrarios inline. Definir escala (p. ej. 0.72/0.8/0.9/1/1.15/1.5) como tokens.
- `index.html:34` carga 6 familias de Google Fonts; solo Outfit es base y el resto se usa únicamente en el Visualizador. Recortar a las realmente usadas y valorar autoalojarlas (coherente con la decisión ya tomada de autoalojar anime/lucide para offline).

**E6 · Accesibilidad**
- Botones «×» de borrado sin `aria-label` y con área táctil ~16 px (`estres.js:322`, `presente.js:203`, `abrirse.js:551`): mínimo 44×44 táctil (padding invisible) + etiqueta.
- `keypress` está deprecado; usar `keydown` (`presente.js:225,321`, `abrirse.js:264,390`).
- El foco no se gestiona tras re-render (además de B3): tras añadir un ítem, devolver el foco al input.
- `prompt()`/`confirm()` nativos (`dashboard.js:207,222,242`, `resumen.js:374`, `estres.js:419`) rompen estética y no son tematizables: sustituir por un diálogo propio reutilizable (además evita traducciones del navegador).
- Contraste en tema claro sin auditar (bloqueado por B10). Tras migrar tokens, pasar auditoría AA.
- Respetar `prefers-reduced-motion` en todas las animaciones en bucle (glitch, shake, pulse).

**E7 · Detalles visuales**
- Doble cabecera: la fila global del toggle de tema (`index.html:43-45`) queda flotando sobre la cabecera propia de cada módulo. Integrar el toggle en las cabeceras o moverlo al panel.
- `button { min-height: 52px; padding: .85rem 1.75rem }` global (`main.css:387-396`) obliga a cada chip/botón pequeño a sobreescribir con inline styles. Hacer el default neutro y estilar por clase.
- «Vaso de Estrés» y «Ver Resumen» en hexaflex usan `.btn-primary` con inline styles que lo convierten en ghost (`hexaflex.js:124-129`): usar `.btn-ghost` directamente.

---

## 6. Hallazgos técnicos y de repositorio

**T1 · `act.zip` (772 KB) versionado en la raíz** — eliminar del repo (y del historial si se desea aligerar clones).
**T2 · Documentación normativa mezclada con código en la raíz** — mover los `NN_*.md`, `gobernanza/`, `controles_colision/`, `modulos_*/` a `docs/` (la app no los referencia). Añadir un `README.md` real (qué es, cómo se sirve, cómo se despliega).
**T3 · Sin herramientas de calidad** — añadir ESLint + Prettier (config mínima) y un smoke test de Playwright (crear consultante → sesión → escribir en 2 herramientas → resumen → finalizar → historial). Es el harness que protege todo el plan de refactor.
**T4 · `vendor/lucide.min.js` pesa 410 KB** — se usan ~20 iconos. Generar un bundle propio con solo los usados o pasarlos a SVG inline (menos JS, sin `createIcons()` tras cada render).
**T5 · `state.currentModule`/`activeModuleId` semi-muertos** — `core/state.js:31-32`: `activeModuleId` nunca se escribe; `currentModule` solo distingue dashboard/idle. Simplificar o completar (útil si se quiere restaurar el módulo activo tras recarga).

---

## 7. Plan de corrección y mejora

> Regla transversal desde la Fase 0: **todo texto de usuario pasa por `escapeHTML`/`escapeAttr`** y **toda navegación pasa por el router con `cleanup`**.

### Fase 0 — Correcciones críticas (P0) · ~1 jornada
| # | Ítem | Archivos | Criterio de aceptación |
|---|------|----------|------------------------|
| 0.1 | B1 no destruir sesión en curso | `ui/dashboard.js` | Cancelar el diálogo no altera la sesión; aceptar la archiva siempre antes de crear la nueva |
| 0.2 | B2 ruta de salida de la sesión | `app.js`, `modules/hexaflex.js`, `ui/utils.js` | «Finalizar» del hexaflex lleva a Resumen; existe «Guardar y volver al panel» que no archiva; ← y Finalizar de módulos ya no son redundantes |
| 0.3 | B4 escape centralizado | `core/security.js` + todos los módulos | Escribir `"<b>xss</b>"` en cualquier campo se muestra literal en herramienta, resumen, tarea e historial |
| 0.4 | B8 iconos PWA | `manifest.json`, `icons/`, `service-worker.js`, `index.html` | Lighthouse marca la PWA como instalable |
| 0.5 | B6+B13 ciclo de vida de módulo | `app.js` (router), `modules/abrirse.js` | Abrir SOS desde la Radio silencia el ruido; ninguna animación en bucle sobrevive a la navegación |

### Fase 1 — Defectos que degradan el uso (P1) · ~2 jornadas
| # | Ítem | Archivos | Criterio de aceptación |
|---|------|----------|------------------------|
| 1.1 | B3 buscador sin pérdida de foco | `ui/dashboard.js` | Se puede teclear un nombre completo de corrido |
| 1.2 | B7 sliders estables | `modules/abrirse.js` | Arrastre continuo de volumen/sintonía/propiedades sin cortes |
| 1.3 | B5 numeración de historial | `modules/resumen.js` | Sesión 1 = primera sesión; orden visual más reciente arriba |
| 1.4 | B9 actualización del SW | `service-worker.js` | Un despliegue llega sin tocar `CACHE_NAME`; probar con cambio de copy |
| 1.5 | B10 tema claro + persistencia | `app.js`, `styles/main.css`, módulos (junto a E1/E2) | Toda pantalla legible en claro; el tema sobrevive a recarga |
| 1.6 | B11 migración de esquema | `core/state.js` | Retomar una sesión con esquema v0 no lanza errores y completa claves |
| 1.7 | B15 vínculo persistence↔paciente | `core/state.js`, `ui/dashboard.js` | Cambiar de consultante nunca puede escribir datos cruzados |
| 1.8 | E6 diálogo propio (reemplaza confirm/prompt) | `ui/utils.js` + usos | Cero `confirm`/`prompt` nativos en la app |

### Fase 2 — Mejoras de utilidad · ~2 jornadas
| # | Ítem | Detalle |
|---|------|---------|
| 2.1 | G4 exportar/importar datos | Botón en panel: exporta JSON completo (y por consultante); importa con validación. Aviso de primer uso sobre almacenamiento local |
| 2.2 | Exportar resumen | Además de copiar: descargar `.txt` (y compartir vía Web Share API en móvil) para la tarea del paciente |
| 2.3 | B12 drag real en Visualizador | Pointer Events, persistiendo posición; valor clínico: distancia física del pensamiento |
| 2.4 | G2 unificación de registro (voseo/tuteo) | Pasada completa de copy + decisión registrada en `08_copy_clinico.md` |
| 2.5 | G3 copy del panel | Sustituir texto promocional |
| 2.6 | Autosave visible | Eliminar el botón 💾 (todo ya guarda en `input`) y mostrar indicador discreto «Guardado ✓» en la cabecera |
| 2.7 | E6 accesibilidad táctil | ×/chips a 44 px táctiles, `aria-label`, `keydown`, foco tras añadir ítems, `prefers-reduced-motion` |

### Fase 3 — Estética y deuda · ~2-3 jornadas
| # | Ítem | Detalle |
|---|------|---------|
| 3.1 | E1 extracción de estilos inline | Clases en `main.css`; objetivo: <30 estilos inline residuales (solo valores dinámicos) |
| 3.2 | E2+B17 tokens semánticos | `--acerca/--aleja/--carga`, `--color-primary-rgb`, escala tipográfica; sustitución global |
| 3.3 | E3 componentes compartidos | `renderGroundingBlock`, `renderToolTabs`, `renderChip` en `ui/utils.js` |
| 3.4 | E4 iconografía unificada | lucide para UI, emoji solo expresivo |
| 3.5 | E5 tipografía | Eliminar tamaños <0.7rem; recortar fuentes de Google a las usadas (o autoalojar) |
| 3.6 | E7 cabecera única y defaults de botón | Toggle de tema integrado; `button` base neutro |
| 3.7 | T1/T2 higiene de repo | Borrar `act.zip`; mover docs a `docs/`; `README.md` |
| 3.8 | T3 calidad | ESLint+Prettier; smoke test Playwright del flujo completo (idealmente al inicio de Fase 1 para proteger el refactor) |
| 3.9 | T4 lucide recortado | Bundle propio o SVG inline |

### Fase G — Gobernanza (paralela, requiere decisión del propietario clínico)
| # | Ítem | Detalle |
|---|------|---------|
| G.1 | Resolver G1 | Redactar acta v2.0 que ampare persistencia local mediada por clínico, historial sin comparación automática y radar descriptivo; o retirar esas funciones. Sin esto, el sistema está formalmente «en ruptura» con sus propios documentos |
| G.2 | Revisar el radar de Resumen | Mantenerlo como mapa descriptivo exige: sin valores numéricos visibles, sin persistir puntuaciones, disclaimer actual. Alternativa más conservadora: lista de procesos tocados (checks, sin forma de «puntuación») |

---

## 8. Orden recomendado y verificación

1. **Fase 0 completa** (un solo PR revisable): es donde vive el riesgo clínico real (pérdida de datos, UI rota por texto del paciente).
2. **3.8 (tests) adelantado** antes de la Fase 1: el smoke test protege el refactor de estilos y del router.
3. Fases 1 → 2 → 3 en PRs pequeños por ítem o pareja de ítems.
4. Fase G en paralelo desde el primer día (es documental).

**Verificación mínima por release:** flujo completo manual (crear consultante → sesión → 3 herramientas con texto que incluya `"` `<` `>` → resumen → tarea → finalizar → historial), en tema oscuro y claro, en un móvil real, y con red desconectada (PWA offline).

---

## 9. Estado del documento

Diagnóstico y plan propuestos para revisión. No modifica código ni documentos normativos; las decisiones de la Fase G corresponden al propietario clínico del sistema.
