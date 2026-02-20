/**
 * ACT In-Session - Análisis Module (Functional Analysis)
 */

import { state, saveState } from '../core/state.js';
import { renderModuleHeader, attachHeaderEvents } from '../ui/utils.js';

export function renderAnalisisModule(container, module, { renderHome }) {
    let activeToolId = 'matrix';
    const tools = [
        { id: 'matrix', title: 'Matrix Swipe', icon: 'layout' },
        { id: 'dots', title: 'DOTS', icon: 'clipboard-list' }
    ];

    const render = () => {
        container.innerHTML = `
            <div class="module-view animate-slide-up">
                ${renderModuleHeader(module)}
                <div class="tool-selector glass-card" style="display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: var(--radius-md); margin-bottom: 2rem;">
                    ${tools.map(t => `
                        <button class="btn-tool ${activeToolId === t.id ? 'active' : ''}" data-id="${t.id}" style="display: flex; align-items: center; gap: 0.5rem; flex: 1; font-size: 0.85rem; padding: 0.5rem; border-radius: var(--radius-sm);">
                            <i data-lucide="${t.icon}" style="width: 1rem; height: 1rem;"></i>
                            <span>${t.title}</span>
                        </button>
                    `).join('')}
                </div>
                <div id="tool-container"></div>
            </div>
        `;
        attachHeaderEvents(renderHome, saveState);
        document.querySelectorAll('.btn-tool').forEach(btn => {
            btn.addEventListener('click', () => { activeToolId = btn.getAttribute('data-id'); render(); });
        });
        const toolContainer = document.getElementById('tool-container');
        if (activeToolId === 'matrix') renderMatrixTool(toolContainer);
        else if (activeToolId === 'dots') renderDOTSTool(toolContainer);
    };
    render();
}

function renderMatrixTool(container) {
    const categories = {
        top_left: { label: 'INTERIOR / ALEJAMIENTO', color: '#ef4444', sub: 'Pensamientos/Sentimientos' },
        top_right: { label: 'INTERIOR / ACERCAMIENTO', color: '#10b981', sub: 'Valores/Propósito' },
        bottom_left: { label: 'EXTERIOR / ALEJAMIENTO', color: '#f59e0b', sub: 'Conductas de Evitación' },
        bottom_right: { label: 'EXTERIOR / ACERCAMIENTO', color: '#3b82f6', sub: 'Acciones Comprometidas' }
    };

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="text-align: center; margin-bottom: 1rem;">
                    <p class="clinical-note">Organiza tu experiencia en los cuatro cuadrantes.</p>
                </div>
                
                <div class="matrix-container glass" style="position: relative; height: 380px; padding: 4px; border-radius: var(--radius-lg); overflow: hidden;">
                    <!-- Axis Labels -->
                    <div style="position: absolute; left: 50%; top: 10px; transform: translateX(-50%); font-size: 0.6rem; font-weight: 900; color: var(--color-text-secondary); letter-spacing: 2px;">INTERIOR</div>
                    <div style="position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%); font-size: 0.6rem; font-weight: 900; color: var(--color-text-secondary); letter-spacing: 2px;">EXTERIOR</div>
                    <div style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%) rotate(-90deg); font-size: 0.6rem; font-weight: 900; color: var(--color-text-secondary); letter-spacing: 2px;">ALEJAMIENTO</div>
                    <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%) rotate(90deg); font-size: 0.6rem; font-weight: 900; color: var(--color-text-secondary); letter-spacing: 2px;">ACERCAMIENTO</div>
                    
                    <div class="matrix-grid" style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 4px; height: 100%; padding: 2rem;">
                        ${Object.entries(categories).map(([id, cat]) => `
                            <div class="matrix-quadrant glass" data-id="${id}" style="padding: 1rem; position: relative; display: flex; flex-direction: column; gap: 0.5rem; border: 1px solid ${cat.color}22; overflow-y: auto;">
                                <header style="font-size: 0.5rem; color: ${cat.color}; border-color: ${cat.color}44;">${cat.label}</header>
                                <div class="items" style="display: flex; flex-direction: column; gap: 0.4rem;">
                                    ${state.persistence.matrix[id].length ?
                state.persistence.matrix[id].map(item => `<div class="glass" style="padding: 0.5rem; font-size: 0.75rem; border-left: 2px solid ${cat.color}; background: rgba(0,0,0,0.1); border-radius: 4px;">${item}</div>`).join('') :
                `<div style="font-size: 0.6rem; opacity: 0.3; font-style: italic; text-align: center; margin-top: 1rem;">${cat.sub}</div>`
            }
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="matrix-input-group" style="margin-top: 1.5rem; display: flex; gap: 0.5rem; flex-direction: column;">
                    <input type="text" id="matrix-item-input" class="input-field" placeholder="Escribe algo y selecciona cuadrante...">
                    <div style="display: flex; gap: 0.5rem;">
                        ${Object.entries(categories).map(([id, cat]) => `
                            <button class="btn-toggle flex-1" data-quadrant="${id}" style="font-size: 0.65rem; padding: 0.5rem; border-color: ${cat.color}44;">
                                ${cat.label.split(' / ')[1]}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const input = document.getElementById('matrix-item-input');
        container.querySelectorAll('[data-quadrant]').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = input.value.trim();
                if (text) {
                    state.persistence.matrix[btn.dataset.quadrant].push(text);
                    input.value = '';
                    saveState();
                    internalRender();

                    // Little entrance animation for the new item
                    anime({
                        targets: `.matrix-quadrant[data-id="${btn.dataset.quadrant}"] .items div:last-child`,
                        translateX: [-20, 0],
                        opacity: [0, 1],
                        duration: 500,
                        easing: 'easeOutQuad'
                    });
                } else {
                    input.focus();
                }
            });
        });
    };
    internalRender();
}

function renderDOTSTool(container) {
    const strategies = [
        { id: 'D', label: 'D · Distracción' },
        { id: 'O', label: 'O · Otros' },
        { id: 'T', label: 'T · Thinking' },
        { id: 'S', label: 'S · Substances' }
    ];
    container.innerHTML = `
        <div class="dots-list" style="display: flex; flex-direction: column; gap: 1rem;">
            ${strategies.map(s => `
                <div class="glass" style="padding: 1.25rem;">
                    <h4>${s.label}</h4>
                    <input type="text" data-key="${s.id}" value="${state.persistence.dots[s.id] || ''}" class="input-underline">
                </div>
            `).join('')}
        </div>
    `;
    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => { state.persistence.dots[e.target.dataset.key] = e.target.value; saveState(); });
    });
}
