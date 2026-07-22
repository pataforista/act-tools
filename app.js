/**
 * ACT In-Session Instrument v1.0
 * Modular Entry Point
 */

import { state, saveState, getDefaultSession } from './core/state.js';
import { modules } from './data/config.js';
import { renderDashboard } from './ui/dashboard.js';
import { renderHexaflexModule } from './modules/hexaflex.js';
import { renderAbrirseModule } from './modules/abrirse.js';
import { renderPresenteModule } from './modules/presente.js';
import { renderImportaModule } from './modules/importa.js';
import { renderAnalisisModule } from './modules/analisis.js';
import { renderResumenModule, renderHistoryView, renderHomeworkScreen } from './modules/resumen.js';
import { renderSOSModule } from './modules/sos.js';
import { renderEstresModule } from './modules/estres.js';

const mainContent = document.getElementById('main-content');

/**
 * Global Routing
 */

// The SOS crisis button is a floating global control; it belongs to an active
// session, not the patient-management dashboard, where it would overlap the CTAs.
function setSosVisible(visible) {
    const btn = document.getElementById('btn-sos');
    if (btn) btn.style.display = visible ? 'flex' : 'none';
}

function navigateToHome() {
    setSosVisible(true);
    renderHexaflexModule(mainContent, { modules, loadModule, renderHome: navigateToHome, navigateToDashboard, togglePause });
}

function navigateToDashboard() {
    setSosVisible(false);
    renderDashboard(mainContent, navigateToHome, navigateToHistory);
}

function navigateToHistory() {
    renderHistoryView(mainContent, { navigateToDashboard, renderSessionDetail: (s) => renderResumenModule(mainContent, { sessionData: s, navigateToDashboard, navigateToHome, renderHistoryView: navigateToHistory, renderHomeworkView }) });
}

function renderHomeworkView(session) {
    const isHistorical = session !== state.persistence;
    renderHomeworkScreen(mainContent, session, () => {
        renderResumenModule(mainContent, {
            sessionData: isHistorical ? session : null,
            navigateToDashboard,
            navigateToHome,
            renderHistoryView: navigateToHistory,
            renderHomeworkView
        });
    });
}

function loadModule(id) {
    if (id === 'resumen') {
        renderResumenModule(mainContent, { navigateToDashboard, navigateToHome, renderHistoryView: navigateToHistory, renderHomeworkView });
        return;
    }

    const config = modules.find(m => m.id === id);
    if (!config) return;

    if (id === 'abrirse') renderAbrirseModule(mainContent, config, { renderHome: navigateToHome });
    else if (id === 'presente') renderPresenteModule(mainContent, config, { renderHome: navigateToHome });
    else if (id === 'yo') renderPresenteModule(mainContent, config, { renderHome: navigateToHome, initialTool: 'cielo' });
    else if (id === 'importa') renderImportaModule(mainContent, config, { renderHome: navigateToHome });
    else if (id === 'accion') renderImportaModule(mainContent, config, { renderHome: navigateToHome, initialTool: 'paso' });
    else if (id === 'analisis') renderAnalisisModule(mainContent, config, { renderHome: navigateToHome });
    else if (id === 'estres') renderEstresModule(mainContent, config, { renderHome: navigateToHome });
}

function togglePause() {
    const existing = document.getElementById('pause-overlay');
    if (existing) {
        existing.remove();
        return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'pause-overlay';
    overlay.style.cssText = 'position: fixed; inset: 0; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; background: rgba(8, 12, 20, 0.92); backdrop-filter: blur(8px); text-align: center; padding: 2rem;';
    overlay.innerHTML = `
        <div style="font-size: 2.5rem;">⏸</div>
        <h2 style="font-size: 1.3rem; color: var(--color-primary); margin: 0;">Sesión en pausa</h2>
        <p style="font-size: 0.85rem; color: var(--color-text-secondary); max-width: 280px; margin: 0;">El espacio queda en pausa. Retomá cuando lo decidas.</p>
        <button class="btn-primary" id="btn-resume-pause">Reanudar</button>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#btn-resume-pause')?.addEventListener('click', () => overlay.remove());
}

function init() {
    if (state.currentModule === 'dashboard' || !state.currentPatientId) {
        navigateToDashboard();
    } else {
        navigateToHome();
    }

    // Global Elements
    const sosBtn = document.getElementById('btn-sos');
    sosBtn?.addEventListener('click', () => {
        mainContent.style.display = 'none';
        let sosContainer = document.getElementById('sos-content');
        if (!sosContainer) {
            sosContainer = document.createElement('div');
            sosContainer.id = 'sos-content';
            sosContainer.className = 'screen';
            mainContent.parentNode.insertBefore(sosContainer, mainContent.nextSibling);
        }
        sosContainer.style.display = 'block';

        renderSOSModule(sosContainer, { 
            navigateToHome: () => {
                sosContainer.style.display = 'none';
                mainContent.style.display = 'block';
            } 
        });
    });

    const themeBtn = document.getElementById('theme-toggle');
    themeBtn?.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('act_theme', state.theme);
        document.body.setAttribute('data-theme', state.theme);
    });

    document.body.setAttribute('data-theme', state.theme);
    lucide.createIcons();

    lucide.createIcons();
}

// Initial session check
init();
