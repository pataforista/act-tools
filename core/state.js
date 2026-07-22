/**
 * ACT In-Session - Core State Management
 *
 * v1.x (Acta de Congelación §4-5): la app NO mantiene registro longitudinal,
 * panel de consultantes ni comparación entre sesiones. Solo existe UNA sesión
 * de trabajo en memoria. Un autoguardado volátil en sessionStorage la protege
 * ante recargas accidentales dentro de la misma pestaña; se borra al cerrarla
 * o al iniciar/cargar una sesión nueva. El respaldo duradero es el JSON que el
 * clínico exporta a su expediente.
 */

const SESSION_KEY = 'act_session';

export const getDefaultSession = () => ({
    date: new Date().toISOString(),
    thoughts: [],
    weather: [],
    diana: [
        { id: 'work', label: 'Trabajo / Educación', x: 0, y: 0 },
        { id: 'relationships', label: 'Relaciones', x: 0, y: 0 },
        { id: 'personal', label: 'Personal / Salud', x: 0, y: 0 },
        { id: 'leisure', label: 'Ocio / Social', x: 0, y: 0 }
    ],
    matrix: { top_left: [], top_right: [], bottom_left: [], bottom_right: [] },
    grounding: {
        hojas: { contexto: '', aprendizaje: '', accion: '' },
        cielo: { contexto: '', aprendizaje: '', accion: '' },
        visualizador: { contexto: '', aprendizaje: '', accion: '' },
        radio: { contexto: '', aprendizaje: '', accion: '' },
        lucha: { contexto: '', aprendizaje: '', accion: '' }
    },
    paso: { area: '', accion: '', disposicion: '', cuando: '' },
    fear: { F: '', E: '', A: '', R: '' },
    dare: { D: '', A: '', R: '', E: '' },
    evitacion: [],
    estres: { cupSize: 'medium', load: [], responses: [] }
});

export function normalizeSession(session) {
    if (!session) return session;
    const def = getDefaultSession();
    return {
        ...def,
        ...session,
        diana: session.diana || def.diana,
        matrix: { ...def.matrix, ...(session.matrix || {}) },
        grounding: { ...def.grounding, ...(session.grounding || {}) },
        paso: { ...def.paso, ...(session.paso || {}) },
        fear: { ...def.fear, ...(session.fear || {}) },
        dare: { ...def.dare, ...(session.dare || {}) },
        evitacion: session.evitacion || def.evitacion,
        estres: { ...def.estres, ...(session.estres || {}) }
    };
}

// Recupera el buffer volátil de la pestaña si existe (solo protección ante
// recarga accidental); si no, arranca una sesión nueva y vacía.
function loadBufferedSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (raw) return normalizeSession(JSON.parse(raw));
    } catch (e) {
        console.error('Error al leer la sesión en curso', e);
    }
    return getDefaultSession();
}

export const state = {
    currentModule: 'active',
    activeModuleId: null,
    theme: localStorage.getItem('act_theme') || 'dark',
    viewMode: 'hexaflex',
    persistence: loadBufferedSession()
};

// Autoguardado volátil: solo sobrevive a una recarga dentro de la misma
// pestaña. No es persistencia longitudinal ni permite comparar sesiones.
export function saveState() {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.persistence));
    } catch (e) {
        console.error('No se pudo autoguardar la sesión en curso', e);
    }
}

// Limpia la pantalla y comienza una sesión nueva y vacía.
export function resetSession() {
    state.persistence = getDefaultSession();
    saveState();
}

// Carga una sesión (p. ej. desde un JSON exportado) para retomar el trabajo.
export function loadSessionData(data) {
    const raw = data && data.session ? data.session : data;
    state.persistence = normalizeSession(raw);
    saveState();
}
