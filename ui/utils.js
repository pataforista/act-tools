/**
 * ACT In-Session - UI Utilities & Components
 */

export function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

export function renderModuleHeader(module, options = {}) {
    const { showSave = true } = options;

    return `
        <header class="tool-header">
            <div class="title-group">
                <button class="btn-ghost" id="btn-back">←</button>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i data-lucide="${module.icon}" style="width: 1.5rem; height: 1.5rem;"></i>
                    <h2 style="font-size: 1.2rem; font-weight: 700;">${module.title}</h2>
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                ${showSave ? '<button class="btn-ghost" id="btn-global-save" style="font-size: 0.75rem; color: var(--color-primary);">💾 Guardar Ahora</button>' : ''}
                <button class="btn-ghost" id="btn-close-module">Finalizar</button>
            </div>
        </header>
    `;
}

export function attachHeaderEvents(renderHome, saveState) {
    document.getElementById('btn-back')?.addEventListener('click', renderHome);
    document.getElementById('btn-close-module')?.addEventListener('click', renderHome);

    const saveBtn = document.getElementById('btn-global-save');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveState();
            showToast('✓ Sesión Guardada');
        });
    }

    lucide.createIcons();
}

/**
 * Renders a collapsible clinical guide badge for a tool.
 * @param {Object} config
 * @param {string} config.trigger      - When to use this tool (clinical trigger)
 * @param {string} config.intro        - Suggested therapist intro phrase
 * @param {string[]} config.questions  - Key questions to ask during the exercise
 * @param {string} config.abort        - Signal to stop the exercise
 * @returns {string} HTML string of the guide badge
 */
export function renderGuideBadge({ trigger, intro, questions, abort }) {
    const id = 'guide-' + Math.random().toString(36).slice(2, 7);
    return `
        <div class="guide-badge-wrapper" style="margin-bottom: 1rem; position: relative;">
            <button class="btn-guide-toggle" data-guide-id="${id}"
                style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem;
                       color: var(--color-text-secondary); background: transparent;
                       border: 1px solid var(--glass-border); border-radius: var(--radius-sm);
                       padding: 0.3rem 0.7rem; cursor: pointer; transition: all 0.2s;">
                <span style="font-size: 0.9rem;">🧭</span> Guía clínica
            </button>
            <div id="${id}" class="guide-panel glass" style="display: none; margin-top: 0.5rem;
                 padding: 1rem 1.1rem; border-radius: var(--radius-md); border-left: 3px solid var(--color-primary);
                 background: rgba(0,0,0,0.18); animation: slideUp 0.2s ease; font-size: 0.8rem;">

                <div style="display: grid; gap: 0.65rem;">
                    <div>
                        <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px;
                              color: var(--color-primary); font-weight: 700;">⚡ TRIGGER</span>
                        <p style="margin-top: 0.2rem; color: var(--color-text-secondary);">${trigger}</p>
                    </div>
                    <div>
                        <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px;
                              color: var(--color-primary); font-weight: 700;">💬 INTRODUCCIÓN SUGERIDA</span>
                        <p style="margin-top: 0.2rem; font-style: italic; color: var(--color-text-secondary);">"${intro}"</p>
                    </div>
                    <div>
                        <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px;
                              color: var(--color-primary); font-weight: 700;">❓ PREGUNTAS CLAVE</span>
                        <ul style="margin-top: 0.3rem; padding-left: 1rem; display: flex; flex-direction: column; gap: 0.25rem; color: var(--color-text-secondary);">
                            ${questions.map(q => `<li>${q}</li>`).join('')}
                        </ul>
                    </div>
                    <div>
                        <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 1px;
                              color: #ef4444; font-weight: 700;">🛑 SEÑAL DE ABORTO</span>
                        <p style="margin-top: 0.2rem; color: var(--color-text-secondary);">${abort}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Attaches toggle behavior for all .btn-guide-toggle elements.
 * Call this after rendering guide badges.
 */
export function attachGuideBadgeEvents() {
    document.querySelectorAll('.btn-guide-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = document.getElementById(btn.dataset.guideId);
            if (!panel) return;
            const isOpen = panel.style.display !== 'none';
            panel.style.display = isOpen ? 'none' : 'block';
            btn.style.borderColor = isOpen ? 'var(--glass-border)' : 'var(--color-primary)';
            btn.style.color = isOpen ? 'var(--color-text-secondary)' : 'var(--color-primary)';
        });
    });
}
