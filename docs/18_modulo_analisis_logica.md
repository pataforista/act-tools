# 18_modulo_analisis_logica.md

NIVEL DE TRABAJO  
D · Lógica interna

MÓDULO  
Módulo 4 · Análisis

---

## 1. Propósito lógico del módulo

Este módulo permite **discriminación funcional de conductas recientes**, sin interpretación clínica, sin evaluación y sin generación de conclusiones terapéuticas.

Su función es **hacer explícitas relaciones funcionales básicas** (contexto–conducta–consecuencia percibida) para que el clínico las utilice verbalmente en sesión.

El módulo **no explica**, **no resume** y **no orienta decisiones**.

---

## 2. Estados aplicables

Estados globales permitidos (según `05_arquitectura_logica.md`):

- `idle`  
  Módulo cargado, sin interacción activa.

- `active`  
  El clínico ha iniciado el ejercicio de análisis.

- `paused`  
  Interrupción temporal sin pérdida de lo mostrado.

- `exit`  
  Salida inmediata, voluntaria, sin persistencia.

No existen estados de éxito, cierre terapéutico ni completitud.

---

## 3. Inputs permitidos

Todos los inputs son **descriptivos**, **no jerárquicos** y **no cuantitativos**.

### 3.1 Inputs primarios
- Conducta reciente (texto breve o selección nominal)
- Contexto inmediato percibido
- Respuesta interna asociada (pensamiento, emoción o impulso)

### 3.2 Inputs secundarios (opcionales)
- Estrategia de afrontamiento utilizada
- Acción evitada o postergada

Reglas:
- No se permiten escalas, sliders, números ni comparaciones.
- Ningún input es obligatorio para avanzar o salir.

---

## 4. Procesamiento interno (no visible)

El sistema realiza únicamente:

- Agrupación lógica de inputs por categoría funcional:
  - Contexto
  - Conducta
  - Consecuencia percibida

- Verificación de consistencia mínima:
  - Si no hay inputs suficientes, se mantiene visualización vacía o parcial.
  - No se generan advertencias clínicas.

No se infieren causas, funciones “reales” ni patrones estables.

---

## 5. Outputs permitidos

Outputs **no evaluativos**, **no acumulativos** y **no interpretativos**.

### 5.1 Tipos de output
- Representación visual simple de relación funcional
- Clasificación descriptiva sin carga moral
- Disposición espacial sin jerarquía

### 5.2 Restricciones
- No etiquetas de “útil”, “inútil”, “adaptativo” o similares.
- No síntesis automática.
- No recomendaciones.

El output es **material de trabajo**, no conclusión.

---

## 6. Compatibilidad clínica

### 6.1 Matrix Swipe
- El módulo puede recibir información proveniente de Matrix Swipe.
- No devuelve resultados comparativos ni direccionales.

### 6.2 DOTS
- Puede utilizarse tras DOTS para **hacer visible la lógica de la evitación**.
- No transforma desesperanza en objetivos ni acciones.

---

## 7. Condiciones de aborto seguro

El módulo debe poder abortarse:

- En cualquier estado (`idle`, `active`, `paused`)
- Sin confirmaciones
- Sin pérdida percibida
- Sin mensajes de advertencia

Al abortar:
- No se guarda información
- No se muestra feedback clínico
- El sistema retorna a estado global `exit`

---

## 8. Riesgos explícitamente evitados

Este módulo **NO DEBE**:

- Evaluar funcionalidad real de la conducta
- Etiquetar evitación como problema
- Convertirse en análisis de desempeño
- Generar insight obligatorio
- Facilitar control encubierto

Si una implementación permite “entenderse mejor” como promesa implícita, **debe descartarse**.

---

## 9. Criterio de cierre

Este módulo se considera correctamente implementado si:

- Solo hace visible información ya presente en sesión
- No introduce juicios, métricas ni direccionalidad
- Es compatible con interrupción inmediata
- Mantiene control clínico total

---

Estado del documento  
Lógica interna cerrada · v1.0
