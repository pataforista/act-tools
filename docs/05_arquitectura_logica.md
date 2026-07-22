# ARQUITECTURA LÓGICA DEL SISTEMA  
## Instrumento Clínico ACT – PWA  
**Versión 1.0**

---

## 1. Principio general

La arquitectura del sistema debe reflejar el marco clínico:  
- sin linealidad obligatoria  
- sin persistencia por defecto  
- sin lógica de progreso  

La PWA es **orientada a estados**, no a flujos terapéuticos.

---

## 2. Modos del sistema

### 2.1 Modo Clínico (default)
- Control total del clínico
- Acceso a todos los módulos
- Sin guardado automático
- Sin feedback interpretativo

### 2.2 Modo Paciente (futuro)
- No implementado en v1.x
- Requiere ruptura de versión

---

## 3. Estados globales

- `idle`: sistema en espera
- `active`: herramienta en uso
- `paused`: ejercicio detenido
- `exit`: salida voluntaria

No existen estados de “éxito” o “fracaso”.

---

## 4. Navegación

- Acceso directo a cualquier módulo
- No se fuerza secuencia
- El clínico decide inicio y cierre

---

## 5. Memoria y datos

- Sistema **stateless por defecto**
- Ningún dato se persiste sin acción explícita
- No hay historial longitudinal

---

## 6. Errores y fallos

- Todo error debe permitir salida inmediata
- Nunca mostrar mensajes de culpa o advertencia clínica

---

## 7. Estado del documento

Define la lógica mínima para implementación técnica.
