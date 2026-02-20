/**
 * ACT In-Session - Dashboard & Patient Management
 */

import { state, saveState, getDefaultSession, archiveCurrentSession } from '../core/state.js';

export function renderDashboard(container, navigateToHome, navigateToHistory) {
    state.currentModule = 'dashboard';
    container.innerHTML = `
        <div class="dashboard-view animate-slide-up">
            <header class="dashboard-header" style="text-align: center; margin-bottom: 2.5rem;">
                <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--color-primary); margin-bottom: 0.5rem;">ACT In-Session</h1>
                <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Gestión de Consultantes y Sesiones</p>
            </header>

            <div class="patient-manager glass-card" style="padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.1rem; font-weight: 600;">Consultantes</h2>
                    <button class="btn-primary" id="btn-add-patient" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">+ Nuevo</button>
                </div>

                <div id="patient-list" style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${state.patients.length === 0 ? `
                        <div style="text-align: center; padding: 2rem; color: var(--color-text-secondary); font-style: italic; font-size: 0.85rem;">
                            No hay pacientes registrados.
                        </div>
                    ` : state.patients.map(p => `
                        <div class="patient-item glass ${state.currentPatientId === p.id ? 'active' : ''}" 
                             data-id="${p.id}" 
                             style="padding: 1rem; border-radius: var(--radius-md); cursor: pointer; display: flex; justify-content: space-between; align-items: center; border: 1px solid ${state.currentPatientId === p.id ? 'var(--color-primary)' : 'var(--glass-border)'};">
                            <div>
                                <div style="font-weight: 600; font-size: 0.95rem;">${p.name}</div>
                                <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${p.history.length} sesiones previas</div>
                            </div>
                            ${state.currentPatientId === p.id ? '<span style="color: var(--color-primary);">● Seleccionado</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div id="session-controls" style="display: ${state.currentPatientId ? 'flex' : 'none'}; flex-direction: column; gap: 1rem;">
                <button class="btn-primary" id="btn-start-session" style="padding: 1.25rem;">Comenzar Nueva Sesión</button>
                ${state.patients.find(p => p.id === state.currentPatientId)?.currentSession ? `
                    <button class="btn-ghost" id="btn-resume-session" style="padding: 1rem; border: 1px solid var(--color-primary);">Continuar Sesión Pendiente</button>
                ` : ''}
                <button class="btn-ghost" id="btn-view-history" style="opacity: 0.7;">Ver Historial de Sesiones</button>
            </div>
        </div>
    `;

    // Event Listeners
    document.getElementById('btn-add-patient').addEventListener('click', () => {
        const name = prompt('Nombre del pacien/consultante:');
        if (name) {
            const newPatient = {
                id: 'p_' + Date.now(),
                name: name,
                history: [],
                currentSession: null
            };
            state.patients.push(newPatient);
            localStorage.setItem('act_patients', JSON.stringify(state.patients));
            renderDashboard(container, navigateToHome, navigateToHistory);
        }
    });

    document.querySelectorAll('.patient-item').forEach(item => {
        item.addEventListener('click', () => {
            state.currentPatientId = item.dataset.id;
            localStorage.setItem('act_current_patient_id', state.currentPatientId);
            renderDashboard(container, navigateToHome, navigateToHistory);
        });
    });

    if (state.currentPatientId) {
        document.getElementById('btn-start-session').addEventListener('click', () => {
            const patient = state.patients.find(p => p.id === state.currentPatientId);
            if (patient.currentSession && confirm('Hay una sesión en curso. ¿Deseas guardarla en el historial e iniciar una nueva?')) {
                archiveCurrentSession();
            }
            state.persistence = getDefaultSession();
            saveState();
            navigateToHome();
        });

        const resumeBtn = document.getElementById('btn-resume-session');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                const patient = state.patients.find(p => p.id === state.currentPatientId);
                state.persistence = patient.currentSession;
                navigateToHome();
            });
        }

        document.getElementById('btn-view-history').addEventListener('click', navigateToHistory);
    }
}
