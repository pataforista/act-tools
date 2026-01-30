# 16_modulo_estar_presente_logica.md
## Módulo 2 · Estar Presente — Lógica interna (determinista)

Versión: 1.0  
Nivel: D · Lógica interna  
Compatibilidad: Arquitectura lógica global v1.0  

---

## 0. Propósito lógico (no clínico)

Definir el comportamiento interno del módulo “Estar Presente” desde una lógica estrictamente determinista:

- Activación
- Estados internos
- Transiciones
- Abortos y salidas seguras
- Manejo de errores técnicos

El módulo no induce regulación emocional, no evalúa desempeño y no orienta conductas.

---

## 1. Invariantes del módulo

Estas condiciones se mantienen en todo momento:

1. La activación, pausa y salida dependen solo del clínico.
2. El módulo es abortable en cualquier punto sin consecuencias internas.
3. No se interpreta la experiencia del usuario.
4. No existe secuencia correcta ni repetición obligatoria.
5. No se registra progreso ni permanencia.
6. El módulo es stateless por defecto al salir.
7. Los errores se tratan como fallos técnicos, no clínicos.

---

## 2. Estados permitidos

Estados internos válidos:

- `idle`
- `active`
- `paused`
- `exit`

Estados prohibidos explícitamente:

- grounded
- regulated
- completed
- improved

---

## 3. Datos internos (no persistentes)

### 3.1 Inputs permitidos

- `input.attention_anchor` : string  
  (ej. respiración, sonido, postura; tratado como dato literal)

- `input.current_experience` : string breve  
  (descripción directa, sin análisis)

- `input.presence_intensity` : valor escalar no interpretado  

Ningún input genera decisiones automáticas.

---

### 3.2 Estado de ejecución

- `run.instance_id` : identificador efímero
- `run.mode` :
  - `noticing`
  - `maintaining`
  - `holding`

Estos modos son técnicos, no implican calidad de presencia.

---

### 3.3 Outputs

- `output.representation` : objeto descriptivo no evaluativo
- `output.status` :
  - `ready`
  - `paused`
  - `exited`
  - `error_technical`

---

## 4. Condiciones de activación

El módulo pasa de `idle` a `active` solo si:

1. El sistema global permite activación.
2. Se recibe el evento `CLINICIAN_START`.
3. Existe al menos un input permitido.

La ausencia de inputs no genera solicitudes ni mensajes.

---

## 5. Eventos del sistema

### 5.1 Eventos externos (clínico)

- `CLINICIAN_START`
- `CLINICIAN_PAUSE`
- `CLINICIAN_RESUME`
- `CLINICIAN_EXIT`
- `CLINICIAN_RESET`

### 5.2 Eventos internos (técnicos)

- `INPUT_SET(payload)`
- `RENDER_REQUEST`
- `RENDER_OK(representation)`
- `RENDER_FAIL(error_code)`
- `TIMER_TICK`  
  (si existe, no define duración óptima ni mínima)

---

## 6. Reglas de transición

### 6.1 Desde `idle`

- `CLINICIAN_START` + input presente  
  → `active`, `run.mode = noticing`

- `INPUT_SET`  
  → permanece `idle`

- `CLINICIAN_EXIT`  
  → `exit`

---

### 6.2 Desde `active`

- `INPUT_SET`  
  → permanece `active`, `noticing`

- `RENDER_REQUEST`  
  → `active`, `maintaining`

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
  → `active`, `noticing`

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
2. No se emiten mensajes clínicos.
3. No se realizan inferencias ni ajustes automáticos.

Códigos internos posibles:

- `E_INPUT_SCHEMA`
- `E_RENDER`
- `E_RESOURCE`
- `E_UNKNOWN`

---

## 8. Abortos y salidas seguras

- `CLINICIAN_EXIT` es válido desde cualquier estado.
- Un error técnico siempre lleva a `exit`.
- La salida no altera módulos posteriores ni estado global.

---

## 9. Límites explícitos (prevención de control encubierto)

Prohibido:

- Forzar foco, atención sostenida o corrección de distracción.
- Interpretar intensidad como calidad.
- Usar tiempo como criterio de permanencia.
- Introducir estados de logro o estabilización.
- Activar otros módulos automáticamente.

---

## 10. Verificación de cierre

- Máquina de estados determinista.
- Sin nociones de éxito o fallo.
- Sin secuencias obligatorias.
- Abortable en cualquier punto.
- Compatible con arquitectura lógica global.

---

Dato operativo:  
El módulo define exactamente **4 estados** y **10 eventos**, sin transiciones implícitas ni métricas.
