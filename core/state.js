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
    if (!session || typeof session !== 'object') return getDefaultSession();
    const def = getDefaultSession();

    const safeMatrix = (typeof session.matrix === 'object' && session.matrix !== null && !Array.isArray(session.matrix))
        ? {
            top_left: Array.isArray(session.matrix.top_left) ? session.matrix.top_left : [],
            top_right: Array.isArray(session.matrix.top_right) ? session.matrix.top_right : [],
            bottom_left: Array.isArray(session.matrix.bottom_left) ? session.matrix.bottom_left : [],
            bottom_right: Array.isArray(session.matrix.bottom_right) ? session.matrix.bottom_right : []
        }
        : def.matrix;

    const safeDiana = Array.isArray(session.diana) && session.diana.length > 0
        ? session.diana.map(d => ({
            id: String(d.id || ''),
            label: String(d.label || ''),
            x: Number(d.x) || 0,
            y: Number(d.y) || 0
        }))
        : def.diana;

    const safeGrounding = (typeof session.grounding === 'object' && session.grounding !== null)
        ? { ...def.grounding, ...session.grounding }
        : def.grounding;

    const safeEstres = (typeof session.estres === 'object' && session.estres !== null)
        ? {
            cupSize: ['small', 'medium', 'large'].includes(session.estres.cupSize) ? session.estres.cupSize : 'medium',
            load: Array.isArray(session.estres.load) ? session.estres.load : [],
            responses: Array.isArray(session.estres.responses) ? session.estres.responses : []
        }
        : def.estres;

    return {
        ...def,
        ...session,
        date: session.date || def.date,
        thoughts: Array.isArray(session.thoughts) ? session.thoughts : [],
        weather: Array.isArray(session.weather) ? session.weather : [],
        diana: safeDiana,
        matrix: safeMatrix,
        grounding: safeGrounding,
        paso: (typeof session.paso === 'object' && session.paso !== null) ? { ...def.paso, ...session.paso } : def.paso,
        fear: (typeof session.fear === 'object' && session.fear !== null) ? { ...def.fear, ...session.fear } : def.fear,
        dare: (typeof session.dare === 'object' && session.dare !== null) ? { ...def.dare, ...session.dare } : def.dare,
        evitacion: Array.isArray(session.evitacion) ? session.evitacion : [],
        estres: safeEstres
    };
}

// Recupera el buffer volátil de la pestaña si existe (solo protección ante
// recarga accidental); si no, arranca una sesión nueva y vacía.
function loadBufferedSession() {
    try {
        if (typeof sessionStorage !== 'undefined') {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (raw) return normalizeSession(JSON.parse(raw));
        }
    } catch (e) {
        console.error('Error al leer la sesión en curso', e);
    }
    return getDefaultSession();
}

function getStoredTheme() {
    try {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem('act_theme') || 'dark';
        }
    } catch (e) {
        // Fallback for sandboxed or private mode
    }
    return 'dark';
}

export const state = {
    currentModule: 'active',
    activeModuleId: null,
    theme: getStoredTheme(),
    viewMode: 'hexaflex',
    persistence: loadBufferedSession()
};

// Autoguardado volátil: solo sobrevive a una recarga dentro de la misma
// pestaña. No es persistencia longitudinal ni permite comparar sesiones.
export function saveState() {
    try {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.persistence));
        }
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
