/**
 * ACT In-Session - Dashboard & Patient Management
 */

import { state, saveState, getDefaultSession, archiveCurrentSession, normalizeSession } from '../core/state.js';
import { escapeHTML as esc } from '../core/security.js';

const dashboardUiState = {
    searchTerm: '',
    sortBy: 'recent',
    showCreateForm: false
};

function persistPatients() {
    localStorage.setItem('act_patients', JSON.stringify(state.patients));
}

function getCurrentPatient() {
    return state.patients.find(patient => patient.id === state.currentPatientId) || null;
}

function getPatientLastActivity(patient) {
    if (patient.currentSession?.date) return new Date(patient.currentSession.date).getTime();
    if (patient.history.length > 0) return new Date(patient.history[patient.history.length - 1].date).getTime();
    return 0;
}

function getPatientMetrics() {
    const totalPatients = state.patients.length;
    const activeSessions = state.patients.filter(patient => patient.currentSession).length;
    const totalSessions = state.patients.reduce((acc, patient) => acc + patient.history.length, 0);

    return { totalPatients, activeSessions, totalSessions };
}

function getVisiblePatients() {
    const normalizedSearch = dashboardUiState.searchTerm.trim().toLowerCase();

    const filtered = state.patients.filter(patient => {
        if (!normalizedSearch) return true;

        const patientName = patient.name.toLowerCase();
        const historyCount = String(patient.history.length);

        return patientName.includes(normalizedSearch) || historyCount.includes(normalizedSearch);
    });

    if (dashboardUiState.sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
    } else if (dashboardUiState.sortBy === 'sessions') {
        filtered.sort((a, b) => b.history.length - a.history.length);
    } else {
        filtered.sort((a, b) => getPatientLastActivity(b) - getPatientLastActivity(a));
    }

    return filtered;
}

export function renderDashboard(container, navigateToHome, navigateToHistory) {
    state.currentModule = 'dashboard';

    const currentPatient = getCurrentPatient();
    const metrics = getPatientMetrics();
    const visiblePatients = getVisiblePatients();

    container.innerHTML = `
        <div class="dashboard-view animate-slide-up">
            <section class="dashboard-hero glass-card">
                <div class="dashboard-hero__header">
                    <div>
                        <p class="dashboard-kicker">Panel clínico</p>
                        <h1>ACT In-Session</h1>
                        <p class="dashboard-subtitle">Un espacio premium para gestionar consultantes, sesiones y continuidad terapéutica.</p>
                    </div>
                    <button class="btn-ghost dashboard-create-toggle" id="btn-toggle-create">
                        ${dashboardUiState.showCreateForm ? 'Cancelar' : '+ Nuevo consultante'}
                    </button>
                </div>

                <div class="dashboard-stats">
                    <article class="dashboard-stat-card">
                        <span>Total consultantes</span>
                        <strong>${metrics.totalPatients}</strong>
                    </article>
                    <article class="dashboard-stat-card">
                        <span>Sesiones activas</span>
                        <strong>${metrics.activeSessions}</strong>
                    </article>
                    <article class="dashboard-stat-card">
                        <span>Sesiones cerradas</span>
                        <strong>${metrics.totalSessions}</strong>
                    </article>
                </div>

                <form class="dashboard-create-form ${dashboardUiState.showCreateForm ? '' : 'is-hidden'}" id="dashboard-create-form">
                    <label for="patient-name-input">Nombre del consultante</label>
                    <div class="dashboard-create-row">
                        <input id="patient-name-input" class="dashboard-input" name="name" type="text" maxlength="80" placeholder="Ej. Ana Rodríguez" required>
                        <button class="btn-primary" type="submit">Guardar</button>
                    </div>
                </form>
            </section>

            <section class="patient-manager glass-card">
                <div class="dashboard-toolbar">
                    <div class="dashboard-toolbar__search">
                        <label for="patient-search">Buscar</label>
                        <input id="patient-search" class="dashboard-input" type="search" value="${dashboardUiState.searchTerm}" placeholder="Nombre o n° de sesiones">
                    </div>
                    <div class="dashboard-toolbar__sort">
                        <label for="patient-sort">Ordenar por</label>
                        <select id="patient-sort" class="dashboard-input">
                            <option value="recent" ${dashboardUiState.sortBy === 'recent' ? 'selected' : ''}>Actividad reciente</option>
                            <option value="name" ${dashboardUiState.sortBy === 'name' ? 'selected' : ''}>Nombre</option>
                            <option value="sessions" ${dashboardUiState.sortBy === 'sessions' ? 'selected' : ''}>Cantidad de sesiones</option>
                        </select>
                    </div>
                </div>

                <div id="patient-list" class="patient-list">
                    <!-- populated by renderPatientList -->
                </div>
            </section>

            <section id="session-controls" class="session-controls ${state.currentPatientId ? '' : 'is-hidden'}">
                <button class="btn-primary" id="btn-start-session">Comenzar nueva sesión</button>
                ${currentPatient?.currentSession ? `
                    <button class="btn-ghost" id="btn-resume-session">Continuar sesión pendiente</button>
                ` : ''}
                <div class="session-controls__secondary">
                    <button class="btn-ghost" id="btn-view-history">Ver historial</button>
                    <button class="btn-ghost" id="btn-clear-selection">Quitar selección</button>
                </div>
            </section>
        </div>
    `;

    document.getElementById('btn-toggle-create').addEventListener('click', () => {
        dashboardUiState.showCreateForm = !dashboardUiState.showCreateForm;
        renderDashboard(container, navigateToHome, navigateToHistory);
    });

    const createForm = document.getElementById('dashboard-create-form');
    createForm?.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(createForm);
        const name = (formData.get('name') || '').toString().trim();
        if (!name) return;

        state.patients.unshift({
            id: `p_${Date.now()}`,
            name,
            history: [],
            currentSession: null
        });

        dashboardUiState.showCreateForm = false;
        dashboardUiState.searchTerm = '';
        persistPatients();
        renderDashboard(container, navigateToHome, navigateToHistory);
    });

    document.getElementById('patient-search').addEventListener('input', event => {
        dashboardUiState.searchTerm = event.target.value;
        renderPatientList();
    });

    document.getElementById('patient-sort').addEventListener('change', event => {
        dashboardUiState.sortBy = event.target.value;
        renderPatientList();
    });

    const renderPatientList = () => {
        const visible = getVisiblePatients();
        const listEl = document.getElementById('patient-list');
        if (!listEl) return;

        listEl.innerHTML = visible.length === 0 ? `
            <div class="dashboard-empty-state">
                ${state.patients.length === 0
                    ? 'No hay consultantes registrados. Usa el botón “Nuevo consultante” para comenzar.'
                    : 'No encontramos resultados para tu búsqueda actual.'}
            </div>
        ` : visible.map(patient => `
            <article class="patient-item glass ${state.currentPatientId === patient.id ? 'active' : ''}" data-id="${patient.id}">
                <div class="patient-item__main">
                    <h3>${esc(patient.name)}</h3>
                    <p>${patient.history.length} sesiones previas ${patient.currentSession ? '• sesión en curso' : ''}</p>
                </div>
                <div class="patient-item__actions">
                    <button class="btn-ghost btn-select-patient" data-action="select" data-id="${patient.id}">
                        ${state.currentPatientId === patient.id ? 'Seleccionado' : 'Seleccionar'}
                    </button>
                    <button class="btn-ghost btn-rename-patient" data-action="rename" data-id="${patient.id}">Renombrar</button>
                    <button class="btn-ghost btn-delete-patient" data-action="delete" data-id="${patient.id}">Eliminar</button>
                </div>
            </article>
        `).join('');

        listEl.querySelectorAll('[data-action="select"]').forEach(button => {
            button.addEventListener('click', event => {
                const patientId = event.currentTarget.dataset.id;
                state.currentPatientId = patientId;
                localStorage.setItem('act_current_patient_id', patientId);
                renderDashboard(container, navigateToHome, navigateToHistory);
            });
        });

        listEl.querySelectorAll('[data-action="rename"]').forEach(button => {
            button.addEventListener('click', event => {
                const patientId = event.currentTarget.dataset.id;
                const patient = state.patients.find(item => item.id === patientId);
                if (!patient) return;
                const updatedName = prompt('Nuevo nombre del consultante:', patient.name)?.trim();
                if (!updatedName) return;
                patient.name = updatedName;
                persistPatients();
                renderDashboard(container, navigateToHome, navigateToHistory);
            });
        });

        listEl.querySelectorAll('[data-action="delete"]').forEach(button => {
            button.addEventListener('click', event => {
                const patientId = event.currentTarget.dataset.id;
                const patient = state.patients.find(item => item.id === patientId);
                if (!patient) return;
                const confirmed = confirm(`¿Eliminar definitivamente a ${patient.name} y su historial?`);
                if (!confirmed) return;
                state.patients = state.patients.filter(item => item.id !== patientId);
                if (state.currentPatientId === patientId) {
                    state.currentPatientId = null;
                    localStorage.removeItem('act_current_patient_id');
                }
                persistPatients();
                renderDashboard(container, navigateToHome, navigateToHistory);
            });
        });
    };

    renderPatientList();

    if (!state.currentPatientId) return;

    document.getElementById('btn-start-session').addEventListener('click', () => {
        const patient = getCurrentPatient();
        if (!patient) return;

        if (patient.currentSession) {
            if (confirm('Hay una sesión en curso. ¿Deseas guardarla en el historial e iniciar una nueva?')) {
                archiveCurrentSession();
            } else {
                return;
            }
        }

        state.persistence = getDefaultSession();
        saveState();
        navigateToHome();
    });

    const resumeButton = document.getElementById('btn-resume-session');
    if (resumeButton) {
        resumeButton.addEventListener('click', () => {
            const patient = getCurrentPatient();
            if (!patient?.currentSession) return;
            state.persistence = normalizeSession(patient.currentSession);
            navigateToHome();
        });
    }

    document.getElementById('btn-view-history').addEventListener('click', navigateToHistory);

    document.getElementById('btn-clear-selection').addEventListener('click', () => {
        state.currentPatientId = null;
        localStorage.removeItem('act_current_patient_id');
        renderDashboard(container, navigateToHome, navigateToHistory);
    });
}
