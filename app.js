/**
 * ACT In-Session Instrument v1.x
 * Modular Entry Point
 *
 * v1.x sin registro longitudinal: la app abre directamente en el Hexaflex de
 * una sesión de trabajo. Exportar / Cargar / Nueva viven en la cabecera.
 */

import { state, resetSession } from './core/state.js';
import { exportSessionToFile, importSessionFromFile } from './core/sessionio.js';
import { modules } from './data/config.js';
import { renderHexaflexModule } from './modules/hexaflex.js';
import { renderAbrirseModule } from './modules/abrirse.js';
import { renderPresenteModule } from './modules/presente.js';
import { renderImportaModule } from './modules/importa.js';
import { renderAnalisisModule } from './modules/analisis.js';
import { renderResumenModule, renderHomeworkScreen } from './modules/resumen.js';
import { renderSOSModule } from './modules/sos.js';
import { renderEstresModule } from './modules/estres.js';
import { showToast } from './ui/utils.js';
import { radioAudio } from './core/audio.js';

const mainContent = document.getElementById('main-content');

/**
 * Global Routing
 */

// The SOS crisis button is a floating global control.
function setSosVisible(visible) {
    const btn = document.getElementById('btn-sos');
    if (btn) btn.style.display = visible ? 'flex' : 'none';
}

// Acciones de sesión disponibles en la cabecera del Hexaflex.
const sessionMenu = {
    onNew: () => {
        if (confirm('¿Iniciar una nueva sesión? Se limpiará el trabajo en pantalla. Exporta antes si deseas conservarlo.')) {
            resetSession();
            navigateToHome();
            showToast('Nueva sesión iniciada');
        }
    },
    onExport: () => {
        exportSessionToFile();
        showToast('Sesión exportada (.json)');
    },
    onImport: () => triggerImport()
};

function triggerImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) return;
        importSessionFromFile(file)
            .then(() => {
                navigateToHome();
                showToast('Sesión cargada');
            })
            .catch((err) => {
                console.error(err);
                showToast(err?.message || 'No se pudo cargar el archivo');
            });
    });
    input.click();
}

function navigateToHome() {
    setSosVisible(true);
    renderHexaflexModule(mainContent, { modules, loadModule, renderHome: navigateToHome, togglePause, sessionMenu });
}

function renderHomeworkView() {
    renderHomeworkScreen(mainContent, state.persistence, () => {
        renderResumenModule(mainContent, { navigateToHome, renderHomeworkView });
    });
}

function loadModule(id) {
    if (id === 'resumen') {
        renderResumenModule(mainContent, { navigateToHome, renderHomeworkView });
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
    radioAudio.stop();
    const existing = document.getElementById('pause-overlay');
    if (existing) {
        existing.remove();
        return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'pause-overlay';
    overlay.style.cssText = 'position: fixed; inset: 0; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; background: rgba(8, 12, 20, 0.92); backdrop-filter: blur(8px); text-align: center; padding: 2rem;';
    overlay.innerHTML = `
        <div style="display: flex; justify-content: center;"><i data-lucide="pause-circle" style="width: 2.5rem; height: 2.5rem; color: var(--color-primary);"></i></div>
        <h2 style="font-size: 1.3rem; color: var(--color-primary); margin: 0;">Sesión en pausa</h2>
        <p style="font-size: 0.85rem; color: var(--color-text-secondary); max-width: 280px; margin: 0;">El espacio queda en pausa. Retoma cuando lo decidas.</p>
        <button class="btn-primary" id="btn-resume-pause">Reanudar</button>
    `;
    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons();
    overlay.querySelector('#btn-resume-pause')?.addEventListener('click', () => overlay.remove());
}

function init() {
    navigateToHome();

    // Global Elements
    const sosBtn = document.getElementById('btn-sos');
    sosBtn?.addEventListener('click', () => {
        mainContent.style.display = 'none';
        setSosVisible(false); // the SOS screen has its own "Cerrar"; a second floating SOS button here is just clutter
        let sosContainer = document.getElementById('sos-content');
        if (!sosContainer) {
            sosContainer = document.createElement('div');
            sosContainer.id = 'sos-content';
            sosContainer.className = 'screen';
            mainContent.parentNode.insertBefore(sosContainer, mainContent.nextSibling);
        }
        sosContainer.style.display = 'block';

        const closeSos = () => {
            window.removeEventListener('keydown', handleSosKey);
            sosContainer.style.display = 'none';
            mainContent.style.display = 'block';
            setSosVisible(true);
        };

        const handleSosKey = (e) => {
            if (e.key === 'Escape' && sosContainer.style.display !== 'none') {
                closeSos();
            }
        };

        window.addEventListener('keydown', handleSosKey);

        renderSOSModule(sosContainer, {
            navigateToHome: closeSos
        });
    });

    const themeBtn = document.getElementById('theme-toggle');
    themeBtn?.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('act_theme', state.theme);
        
    // Lifecycle & memory optimization for long clinical sessions:
    // pause active animations and audio when the browser tab is hidden.
    if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                radioAudio.stop();
                if (typeof window !== 'undefined' && window.anime && Array.isArray(window.anime.running)) {
                    window.anime.running.forEach(anim => {
                        if (anim && typeof anim.pause === 'function') {
                            anim.pause();
                        }
                    });
                }
            }
        });
    }

    document.body.setAttribute('data-theme', state.theme);
    });

    document.body.setAttribute('data-theme', state.theme);
    lucide.createIcons();
}

// Initial render
init();
