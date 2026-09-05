/**
 * ACT In-Session - UI Utilities & Components
 */

let toastHideTimer = null;

/**
 * Shows a toast. Pass { actionLabel, onAction } to offer an inline undo —
 * used wherever a single click removes something a person might want back
 * (a load chip, a saved thought, a matrix item) without a confirm() dialog.
 */
export function showToast(message, { actionLabel, onAction, duration } = {}) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.innerHTML = '';
    const body = document.createElement('div');
    body.className = 'toast-body';
    const text = document.createElement('span');
    text.innerText = message;
    body.appendChild(text);

    if (actionLabel && onAction) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'toast-undo';
        btn.innerText = actionLabel;
        btn.addEventListener('click', () => {
            clearTimeout(toastHideTimer);
            toast.classList.remove('show');
            onAction();
        });
        body.appendChild(btn);
    }

    toast.appendChild(body);
    toast.classList.add('show');
    clearTimeout(toastHideTimer);
    toastHideTimer = setTimeout(() => toast.classList.remove('show'), duration || (actionLabel ? 4500 : 2000));
}

/**
 * Toggles has-more-left/has-more-right on a horizontally scrollable element
 * so a fade only appears at an edge that actually hides more content —
 * never a permanent decoration on a row that already fits.
 */
export function attachEdgeFade(el) {
    if (!el) return;
    const update = () => {
        const scrollable = el.scrollWidth > el.clientWidth + 1;
        el.classList.toggle('has-more-right', scrollable && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
        el.classList.toggle('has-more-left', scrollable && el.scrollLeft > 1);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
}

/**
 * One "Aterrizaje clínico" question, numbered as a step (see .grounding-field
 * in main.css). Keeps the markup identical across tools that all repeat the
 * same contexto/aprendizaje/acción pattern.
 */
export function groundingField(id, placeholder, value) {
    return `
        <div class="grounding-field">
            <input type="text" id="${id}" class="input-field" placeholder="${placeholder}" value="${value}">
        </div>
    `;
}

export function renderModuleHeader(module, options = {}) {
    const { showSave = true } = options;

    return `
        <header class="tool-header">
            <div class="title-group">
                <button class="btn-ghost btn-icon" id="btn-back" aria-label="Volver">←</button>
                <div class="title-text">
                    <i data-lucide="${module.icon}" style="width: 1.4rem; height: 1.4rem; flex-shrink: 0;"></i>
                    <h2 class="tool-title">${module.title}</h2>
                </div>
            </div>
            <div class="tool-header__actions">
                ${showSave ? '<button class="btn-ghost btn-icon" id="btn-global-save" aria-label="Guardar ahora" title="Guardar ahora">💾</button>' : ''}
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
