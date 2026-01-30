# ACTA DE CONGELACIÓN MODULAR  
## Módulos 1, 2 y 3 — Sistema Clínico ACT PWA  
**Versión 1.0**

---

## 1. Declaración formal

Se declaran **congelados** los Módulos 1, 2 y 3 del Sistema Clínico ACT PWA v1.0 en su **lógica interna**.

A partir de esta acta:
- No se permite modificar la lógica interna de estos módulos dentro de la serie v1.x.
- No se permite introducir nuevas transiciones, estados, reglas implícitas ni salidas clínicas.
- No se permite reinterpretar su intención clínica ni su rol dentro del sistema.

---

## 2. Módulos cubiertos

La congelación aplica a:

- **Módulo 1 · Abrirse**  
  Documento: `15_modulo_abrirse_logica.md`

- **Módulo 2 · Estar Presente**  
  Documento: `16_modulo_estar_presente_logica.md`

- **Módulo 3 · Expandirse / Hacer lo que Importa**  
  Documento: `17_modulo_expandirse_logica.md`

Incluye:
- Estados internos
- Condiciones de activación
- Reglas de transición
- Condiciones de aborto
- Manejo de errores no clínicos

---

## 3. Relación con controles de colisión

Los siguientes documentos se consideran **cerrados y vinculantes**:

- `control_colision_m1_vs_m2.md`
- `control_colision_m2_vs_m3.md`

No se permiten ajustes posteriores para “mejorar fluidez”, “optimizar experiencia” o “reducir fricción”.

---

## 4. Cambios prohibidos en v1.x

Dentro de la versión 1.x está prohibido:

- Añadir lógica terapéutica nueva.
- Alterar la duración implícita de los ejercicios.
- Introducir criterios de éxito, progreso o resultado.
- Cambiar el control de inicio, pausa o salida.
- Incorporar persistencia o memoria.

Cualquier intento constituye **ruptura de versión**.

---

## 5. Condiciones de modificación

Cualquier cambio a estos módulos requiere:

- Nueva versión mayor del sistema (v2.0).
- Nuevo Marco Canónico.
- Revalidación clínica completa.

No existen excepciones.

---

## 6. Estado del documento

Documento normativo y vinculante.  
Su función es **cerrar**, no describir.

---
