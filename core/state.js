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
    smart: { S: '', M: '', A: '', R: '', T: '' },
    fear: { F: '', E: '', A: '', R: '' },
    dare: { D: '', A: '', R: '', E: '' },
    dots: { D: '', O: '', T: '', S: '' }
});

export const state = {
    currentModule: 'dashboard', // dashboard, idle, active, sos
    activeModuleId: null,
    theme: 'dark',
    viewMode: 'hexaflex',
    currentPatientId: localStorage.getItem('act_current_patient_id') || null,
    patients: JSON.parse(localStorage.getItem('act_patients')) || [],
    persistence: getDefaultSession()
};

// Initialize session if patient exists
if (state.currentPatientId) {
    const patient = state.patients.find(p => p.id === state.currentPatientId);
    if (patient && patient.currentSession) {
        state.persistence = patient.currentSession;
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
