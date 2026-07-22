/**
 * ACT In-Session - Core State Management
 */

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

let savedPatients = [];
try {
    const raw = localStorage.getItem('act_patients');
    if (raw) savedPatients = JSON.parse(raw);
} catch (e) {
    console.error('Error parsing act_patients', e);
    alert('Aviso: Los datos de pacientes estaban corruptos. Se ha iniciado con una lista vacía.');
}

export const state = {
    currentModule: 'dashboard', // dashboard, idle, active, sos
    activeModuleId: null,
    theme: localStorage.getItem('act_theme') || 'dark',
    viewMode: 'hexaflex',
    currentPatientId: localStorage.getItem('act_current_patient_id') || null,
    patients: savedPatients,
    persistence: getDefaultSession()
};

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

// Initialize session if patient exists
if (state.currentPatientId) {
    const patient = state.patients.find(p => p.id === state.currentPatientId);
    if (patient && patient.currentSession) {
        state.persistence = normalizeSession(patient.currentSession);
        state.currentModule = 'idle';
    }
}

export function saveState() {
    if (!state.currentPatientId) return;

    const patientIndex = state.patients.findIndex(p => p.id === state.currentPatientId);
    if (patientIndex !== -1) {
        state.patients[patientIndex].currentSession = state.persistence;
        localStorage.setItem('act_patients', JSON.stringify(state.patients));
    }
}

export function archiveCurrentSession() {
    const patient = state.patients.find(p => p.id === state.currentPatientId);
    if (patient && patient.currentSession) {
        patient.history.push(patient.currentSession);
        patient.currentSession = null;
        localStorage.setItem('act_patients', JSON.stringify(state.patients));
    }
}
