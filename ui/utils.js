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
