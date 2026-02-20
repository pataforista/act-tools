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
import { renderResumenModule, renderHistoryView } from './modules/resumen.js';
import { renderSOSModule } from './modules/sos.js';

const mainContent = document.getElementById('main-content');

/**
 * Global Routing
 */

function navigateToHome() {
    renderHexaflexModule(mainContent, { modules, loadModule, renderHome: navigateToHome, togglePause });
}

function navigateToDashboard() {
    renderDashboard(mainContent, navigateToHome, navigateToHistory);
}

function navigateToHistory() {
    renderHistoryView(mainContent, { navigateToDashboard, renderSessionDetail: (s) => renderResumenModule(mainContent, { sessionData: s, navigateToDashboard, navigateToHome, renderHistoryView: navigateToHistory, renderHomeworkView }) });
}

function renderHomeworkView(session) {
    // Homework view logic... (can be in its own file if needed)
}

function loadModule(id) {
    const config = modules.find(m => m.id === id);
    if (!config) return;

    if (id === 'abrirse') renderAbrirseModule(mainContent, config, { renderHome: navigateToHome });
    else if (id === 'presente' || id === 'yo') renderPresenteModule(mainContent, config, { renderHome: navigateToHome });
    else if (id === 'importa' || id === 'accion') renderImportaModule(mainContent, config, { renderHome: navigateToHome });
    else if (id === 'analisis') renderAnalisisModule(mainContent, config, { renderHome: navigateToHome });
    else if (id === 'resumen') renderResumenModule(mainContent, { navigateToDashboard, navigateToHome, renderHistoryView: navigateToHistory, renderHomeworkView });
}

function togglePause() {
    // Pause logic...
}

function init() {
    if (state.currentModule === 'dashboard' || !state.currentPatientId) {
        navigateToDashboard();
    } else {
        navigateToHome();
    }

    // Global Elements
    const sosBtn = document.getElementById('btn-sos');
    sosBtn?.addEventListener('click', () => renderSOSModule(mainContent, { navigateToHome }));

    const themeBtn = document.getElementById('theme-toggle');
    themeBtn?.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', state.theme);
        lucide.createIcons();
    });

    lucide.createIcons();
}

// Initial session check
init();
