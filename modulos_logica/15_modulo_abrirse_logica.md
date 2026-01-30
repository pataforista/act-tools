# 15_modulo_abrirse_logica.md
## Módulo 1 · Abrirse — Lógica interna (determinista)

Versión: 1.0  
Nivel: D · Lógica interna  
Compatibilidad: Arquitectura lógica global v1.0  

---

## 0. Propósito lógico (no clínico)

Definir el comportamiento interno del módulo “Abrirse” en términos estrictamente lógicos:

- Activación
- Transiciones de estado
- Abortos y salidas seguras
- Manejo de errores técnicos

El módulo no evalúa, no interpreta y no persiste datos por defecto.

---

## 1. Invariantes del módulo

Estas condiciones deben cumplirse siempre:

1. El control de activación, pausa, reanudación y salida pertenece exclusivamente al clínico.
2. El módulo es abortable en cualquier punto sin consecuencias internas.
3. Ningún input se utiliza para clasificar, puntuar o inferir estados clínicos.
4. No existe secuencia obligatoria ni repetición forzada.
5. El módulo es stateless por defecto al salir.
6. Los errores se manejan como fallos técnicos genéricos, sin contenido clínico.

---

## 2. Estados permitidos

Estados internos válidos:

- `idle`  
- `active`  
- `paused`  
- `exit`  

Estados explícitamente prohibidos:

- completed  
- success  
- failure  
- improvement  

---

## 3. Datos internos (no persistentes)

### 3.1 Inputs permitidos

- `input.text_brief` : string  
- `input.emotion_label` : string  
- `input.struggle_level` : valor escalar no interpretado  

Los inputs son tratados como datos opacos.

### 3.2 Estado de ejecución

- `run.instance_id` : identificador efímero  
- `run.phase` :  
  - `collecting`  
  - `rendering`  
  - `holding`  

Estas fases son técnicas, no implican avance terapéutico.

### 3.3 Outputs

- `output.representation` : objeto no evaluativo  
- `output.status` :  
  - `ready`  
  - `paused`  
  - `exited`  
  - `error_technical`  

---

## 4. Condiciones de activación

El módulo puede pasar de `idle` a `active` solo si:

1. El sistema global permite activación.
2. Existe un evento explícito `CLINICIAN_START`.
3. Al menos un input permitido está presente.

Si no hay inputs, el módulo permanece en `idle` sin solicitar información.

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
- `TIMER_TICK` (si existe, sin métricas clínicas)

---

## 6. Reglas de transición

### 6.1 Desde `idle`

- `CLINICIAN_START` + input presente  
  → `active` con `run.phase = collecting`

- `INPUT_SET`  
  → permanece `idle`

- `CLINICIAN_EXIT`  
  → `exit`

---

### 6.2 Desde `active`

- `INPUT_SET`  
  → permanece `active`, `collecting`

- `RENDER_REQUEST`  
  → `active`, `rendering`

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
  → `active`, `collecting`

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
2. No se muestra contenido clínico.
3. No se realizan inferencias ni redirecciones automáticas.

Códigos internos posibles:

- `E_INPUT_SCHEMA`
- `E_RENDER`
- `E_RESOURCE`
- `E_UNKNOWN`

---

## 8. Abortos y salidas seguras

- `CLINICIAN_EXIT` es válido desde cualquier estado no terminal.
- Un fallo técnico siempre deriva en `exit`.
- Salir no modifica estado global ni otros módulos.

---

## 9. Límites explícitos (antideriva)

Prohibido:

- Convertir inputs en umbrales o decisiones.
- Usar tiempo como criterio de logro o permanencia.
- Introducir estados ocultos de avance.
- Navegar automáticamente a otros módulos.

---

## 10. Verificación de cierre

- Máquina de estados completamente determinista.
- Sin nociones de éxito, logro o fracaso.
- Sin secuencias forzadas.
- Abortable en cualquier punto.
- Compatible con arquitectura lógica global.

---

Dato operativo:  
El módulo define exactamente **4 estados** y **10 eventos**, sin transiciones implícitas.
