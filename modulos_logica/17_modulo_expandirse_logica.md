# 17_modulo_expandirse_logica.md
## Módulo 3 · Expandirse — Lógica interna (determinista)

Versión: 1.0  
Nivel: D · Lógica interna  
Compatibilidad: Arquitectura lógica global v1.0  

---

## 0. Propósito lógico (no clínico)

Definir el comportamiento interno del módulo “Expandirse” desde una lógica estrictamente determinista:

- Activación
- Estados y transiciones
- Abortos y salidas seguras
- Manejo de errores técnicos

El módulo no dirige conductas, no regula estados internos y no evalúa resultados.

---

## 1. Invariantes del módulo

1. Toda activación, pausa y salida depende solo del clínico.
2. Abortable en cualquier punto, sin consecuencias.
3. No interpreta significado, intención ni progreso.
4. No fuerza secuencias ni repetición.
5. Stateless por defecto al salir.
6. Errores tratados como fallos técnicos genéricos.

---

## 2. Estados permitidos

Estados válidos:

- `idle`
- `active`
- `paused`
- `exit`

Estados prohibidos explícitos:

- insight
- cambio
- avance
- logro

---

## 3. Datos internos (no persistentes)

### 3.1 Inputs permitidos

- `input.context_range` : string  
  (marco, situación o dominio ampliado; literal)

- `input.possible_directions` : array<string>  
  (opciones coexistentes; no priorizadas)

- `input.scope_shift` : valor escalar no interpretado  
  (indica amplitud percibida; dato opaco)

Ningún input activa selección, preferencia o jerarquía.

---

### 3.2 Estado de ejecución

- `run.instance_id` : identificador efímero
- `run.mode` :
  - `opening`
  - `spreading`
  - `holding`

Modos técnicos; no implican “exploración correcta”.

---

### 3.3 Outputs

- `output.representation` : objeto no evaluativo (mapa/abanico descriptivo)
- `output.status` :
  - `ready`
  - `paused`
  - `exited`
  - `error_technical`

---

## 4. Condiciones de activación

Transición de `idle` a `active` solo si:

1. El sistema global permite activación.
2. Evento explícito `CLINICIAN_START`.
3. Existe al menos un input permitido.

La ausencia de inputs mantiene `idle` sin solicitud automática.

---

## 5. Eventos del sistema

### 5.1 Externos (clínico)

- `CLINICIAN_START`
- `CLINICIAN_PAUSE`
- `CLINICIAN_RESUME`
- `CLINICIAN_EXIT`
- `CLINICIAN_RESET`

### 5.2 Internos (técnicos)

- `INPUT_SET(payload)`
- `RENDER_REQUEST`
- `RENDER_OK(representation)`
- `RENDER_FAIL(error_code)`
- `TIMER_TICK`  
  (si existe, no normativo)

---

## 6. Reglas de transición

### 6.1 Desde `idle`

- `CLINICIAN_START` + input presente  
  → `active`, `run.mode = opening`

- `INPUT_SET`  
  → permanece `idle`

- `CLINICIAN_EXIT`  
  → `exit`

---

### 6.2 Desde `active`

- `INPUT_SET`  
  → permanece `active`, `opening`

- `RENDER_REQUEST`  
  → `active`, `spreading`

- `RENDER_OK`  
  → `active`, `holding`, `output.status = ready`

- `CLINICIAN_PAUSE`  
  → `paused`, `output.status = paused`

- `CLINICIAN_EXIT`  
  → `exit`, descartar todo

- `RENDER_FAIL`  
  → `exit`, `output.status = error_technical`

- `CLINICIAN_RESET`  
  → `idle`, descartar todo

---

### 6.3 Desde `paused`

- `CLINICIAN_RESUME`  
  → `active`, `opening`

- `CLINICIAN_EXIT`  
  → `exit`

- `CLINICIAN_RESET`  
  → `idle`

- `INPUT_SET`  
  → permanece `paused`

---

### 6.4 Desde `exit`

- Cualquier evento excepto `CLINICIAN_RESET`  
  → sin efecto

- `CLINICIAN_RESET`  
  → `idle`

---

## 7. Manejo de errores

Principios:

1. Todo error técnico fuerza salida inmediata.
2. Sin mensajes clínicos.
3. Sin inferencias ni redirecciones automáticas.

Códigos internos:

- `E_INPUT_SCHEMA`
- `E_RENDER`
- `E_RESOURCE`
- `E_UNKNOWN`

---

## 8. Abortos y salidas seguras

- `CLINICIAN_EXIT` válido desde cualquier estado.
- Error técnico siempre deriva en `exit`.
- La salida no altera otros módulos ni estado global.

---

## 9. Límites explícitos (anticontrol)

Prohibido:

- Priorizar opciones o “elegir” direcciones.
- Convertir amplitud en mejora.
- Usar tiempo como criterio de expansión.
- Cerrar alternativas o inducir decisión.
- Activar otros módulos automáticamente.

---

## 10. Verificación de cierre

- Máquina de estados determinista.
- Sin éxito/fracaso.
- Sin secuencia obligatoria.
- Abortable total.
- Compatible con arquitectura lógica global.

---

Dato operativo:  
El módulo define **4 estados** y **10 eventos**, con outputs incompatibles con M1 y M2.
