/**
 * ACT In-Session - Resumen & History Module
 */

import { state, archiveCurrentSession, saveState } from '../core/state.js';

export function renderResumenModule(container, { sessionData = null, navigateToDashboard, navigateToHome, renderHistoryView, renderHomeworkView }) {
    const p = sessionData || state.persistence;
    const isHistorical = !!sessionData;
    const patient = state.patients.find(pat => pat.id === state.currentPatientId);

    container.innerHTML = `
            <header class="tool-header">
                <div class="title-group">
                    <i data-lucide="clipboard-check" style="width: 1.5rem; height: 1.5rem; color: var(--color-primary);"></i>
                    <div>
                        <h2 style="font-size: 1.2rem; font-weight: 700;">${isHistorical ? 'Registro Histórico' : 'Resumen de Sesión'}</h2>
                        <p style="font-size: 0.7rem; color: var(--color-text-secondary);">${patient.name} • ${new Date(p.date).toLocaleDateString()}</p>
                    </div>
                </div>
                <button class="btn-ghost" id="btn-back-resumen">${isHistorical ? 'Volver' : 'Cerrar'}</button>
            </header>

            <div class="resumen-content" style="display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 3rem;">
                <!-- Radar Chart Section -->
                <section class="glass-card" style="display: flex; flex-direction: column; align-items: center; padding: 1.5rem 1rem;">
                    <h3 style="font-size: 0.95rem; margin-bottom: 1rem; color: var(--color-primary);">Perfil de Flexibilidad Psicológica</h3>
                    
                    <div id="radar-container" style="width: 250px; height: 250px; position: relative;">
                        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; overflow: visible;">
                            <!-- Grid -->
                            <polygon points="50,10 84.6,30 84.6,70 50,90 15.4,70 15.4,30" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
                            <polygon points="50,30 67.3,40 67.3,60 50,70 32.7,60 32.7,40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
                            
                            <!-- Hexaflex Labels -->
                            <text x="50" y="5" text-anchor="middle" font-size="3" fill="var(--color-text-secondary)">Presente</text>
                            <text x="90" y="30" text-anchor="start" font-size="3" fill="var(--color-text-secondary)">Abrirse</text>
                            <text x="90" y="70" text-anchor="start" font-size="3" fill="var(--color-text-secondary)">Aceptación</text>
                            <text x="50" y="95" text-anchor="middle" font-size="3" fill="var(--color-text-secondary)">Acción</text>
                            <text x="10" y="70" text-anchor="end" font-size="3" fill="var(--color-text-secondary)">Valores</text>
                            <text x="10" y="30" text-anchor="end" font-size="3" fill="var(--color-text-secondary)">Yo Contexto</text>

                            <!-- Data Polygon (Sample logic for now) -->
                            <polygon id="radar-shape" points="50,50 50,50 50,50 50,50 50,50 50,50" fill="var(--color-primary)" fill-opacity="0.3" stroke="var(--color-primary)" stroke-width="1" />
                        </svg>
                    </div>
                </section>

                <section class="glass-card">
                    <h3>🧠 Pensamientos Externalizados</h3>
                    <ul style="font-size: 0.85rem;">
                        ${p.thoughts.map(t => `<li>${t.text || t}</li>`).join('') || '<em>Sin datos</em>'}
                    </ul>
                </section>
                <!-- Other sections... -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn-primary" id="btn-copy-summary">Copiar Texto</button>
                    <button class="btn-ghost" id="btn-homework-view">Ver Tarea Paciente</button>
                    ${!isHistorical ? `<button class="btn-ghost" id="btn-finalize-session" style="background: var(--color-success); color: white;">Finalizar Sesión</button>` : ''}
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-back-resumen').addEventListener('click', isHistorical ? renderHistoryView : navigateToHome);
    document.getElementById('btn-homework-view').addEventListener('click', () => renderHomeworkView(p));

    if (!isHistorical) {
        document.getElementById('btn-finalize-session').addEventListener('click', () => {
            if (confirm('¿Finalizar sesión?')) {
                archiveCurrentSession();
                navigateToDashboard();
            }
        });
    }

    // Radar Logic
    setTimeout(() => {
        // Simple metric calculation
        const scores = {
            presente: (p.weather.length > 0 ? 0.8 : 0.3) + (p.fiveSenses?.length > 0 ? 0.2 : 0),
            abrirse: (p.thoughts.length > 0 ? 0.7 : 0.2) + (p.struggleSwitch === false ? 0.3 : 0),
            aceptacion: p.acceptanceNotes ? 0.9 : 0.4,
            yo_contexto: 0.5, // Not explicitly tracked yet
            valores: p.diana.some(d => d.x !== 0 || d.y !== 0) ? 0.8 : 0.2,
            acciones: (p.smart.S ? 0.5 : 0) + (p.smart.M ? 0.5 : 0)
        };

        const center = 50;
        const radius = 40;
        const pts = [
            { x: center, y: center - (radius * scores.presente) },
            { x: center + (radius * 0.866 * scores.abrirse), y: center - (radius * 0.5 * scores.abrirse) },
            { x: center + (radius * 0.866 * scores.aceptacion), y: center + (radius * 0.5 * scores.aceptacion) },
            { x: center, y: center + (radius * scores.acciones) },
            { x: center - (radius * 0.866 * scores.valores), y: center + (radius * 0.5 * scores.valores) },
            { x: center - (radius * 0.866 * scores.yo_contexto), y: center - (radius * 0.5 * scores.yo_contexto) }
        ];

        const pointsStr = pts.map(p => `${p.x},${p.y}`).join(' ');

        anime({
            targets: '#radar-shape',
            points: [
                { value: '50,50 50,50 50,50 50,50 50,50 50,50' },
                { value: pointsStr }
            ],
            duration: 1500,
            easing: 'easeOutQuint'
        });
    }, 100);
}

export function renderHistoryView(container, { navigateToDashboard, renderSessionDetail }) {
    const patient = state.patients.find(p => p.id === state.currentPatientId);
    container.innerHTML = `
        <div class="module-view animate-slide-up">
            <header class="tool-header">
                <button class="btn-ghost" id="btn-back-dashboard">←</button>
                <h2 style="font-size: 1.2rem; font-weight: 700;">Historial: ${patient.name}</h2>
            </header>
            <div class="history-list" style="display: flex; flex-direction: column; gap: 1rem;">
                ${patient.history.length === 0 ? '<p>No hay sesiones registradas.</p>' :
            patient.history.map((s, idx) => `
                    <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;">
                        <div>
                            <div style="font-weight: 600;">Sesión ${patient.history.length - idx}</div>
                            <div style="font-size: 0.8rem;">${new Date(s.date).toLocaleDateString()}</div>
                        </div>
                        <button class="btn-ghost btn-view-old-summary" data-idx="${idx}">Ver Detalles</button>
                    </div>
                `).reverse().join('')}
            </div>
        </div>
    `;
    document.getElementById('btn-back-dashboard').addEventListener('click', navigateToDashboard);
    document.querySelectorAll('.btn-view-old-summary').forEach(btn => {
        btn.addEventListener('click', () => renderSessionDetail(patient.history[parseInt(btn.dataset.idx)]));
    });
}
