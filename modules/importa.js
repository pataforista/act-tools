/**
 * ACT In-Session - Importa Module (Values / Committed Action)
 */

import { state, saveState } from '../core/state.js';
import { renderModuleHeader, attachHeaderEvents } from '../ui/utils.js';

export function renderImportaModule(container, module, { renderHome }) {
    let activeToolId = 'diana';
    const tools = [
        { id: 'diana', title: 'Diana (Target)', icon: 'target' },
        { id: 'smart', title: 'SMART-ACT', icon: 'file-text' },
        { id: 'dare', title: 'FEAR → DARE', icon: 'rocket' }
    ];

    const render = () => {
        container.innerHTML = `
            <div class="module-view animate-slide-up">
                ${renderModuleHeader(module)}
                <div class="tool-selector glass-card" style="display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; overflow-x: auto;">
                    ${tools.map(t => `
                        <button class="btn-tool ${activeToolId === t.id ? 'active' : ''}" data-id="${t.id}" style="display: flex; align-items: center; gap: 0.5rem; flex: 0 0 auto; font-size: 0.85rem; padding: 0.5rem 1rem; border-radius: var(--radius-sm); white-space: nowrap;">
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
        if (activeToolId === 'diana') renderDianaTool(toolContainer);
        else if (activeToolId === 'smart') renderSMARTTool(toolContainer);
        else if (activeToolId === 'dare') renderDARETool(toolContainer);
    };
    render();
}

function renderDianaTool(container) {
    let selectedAreaIndex = 0;
    const areas = state.persistence.diana;

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="text-align: center; margin-bottom: 1.5rem;">
                    <p class="clinical-note">Haz clic en el tablero para situar tu compromiso actual en cada área.</p>
                </div>
                
                <div class="diana-target" id="diana-canvas" style="width: 320px; height: 320px; margin: 0 auto; border-radius: 50%; position: relative; overflow: hidden;">
                    <!-- Target Rings -->
                    <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                        <div style="width: 1px; height: 100%; background: var(--glass-border); opacity: 0.3;"></div>
                        <div style="width: 100%; height: 1px; background: var(--glass-border); opacity: 0.3; position: absolute;"></div>
                    </div>
                    
                    ${areas.map((area, i) => `
                        <div class="diana-mark" style="position: absolute; left: calc(50% + ${area.x}px); top: calc(50% + ${area.y}px); transform: translate(-50%, -50%); opacity: ${selectedAreaIndex === i ? 1 : 0.4}; scale: ${selectedAreaIndex === i ? 1.2 : 0.8}; background: ${selectedAreaIndex === i ? 'var(--color-primary)' : 'var(--color-text-secondary)'};">
                            ${i + 1}
                        </div>
                    `).join('')}
                </div>

                <div class="area-selector" style="margin-top: 2rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                    ${areas.map((area, i) => `
                        <button class="btn-toggle ${selectedAreaIndex === i ? 'active' : ''}" data-idx="${i}" style="text-align: left; padding: 0.75rem; height: auto; display: flex; flex-direction: column; gap: 0.25rem;">
                            <span style="font-size: 0.6rem; opacity: 0.7; text-transform: uppercase;">Área ${i + 1}</span>
                            <span style="font-size: 0.85rem; font-weight: bold;">${area.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        const target = document.getElementById('diana-canvas');
        target.addEventListener('click', (e) => {
            const rect = target.getBoundingClientRect();
            const x = e.clientX - rect.left - 160;
            const y = e.clientY - rect.top - 160;

            // Limit to circle
            const dist = Math.sqrt(x * x + y * y);
            if (dist < 155) {
                state.persistence.diana[selectedAreaIndex].x = x;
                state.persistence.diana[selectedAreaIndex].y = y;
                saveState();
                internalRender();

                // Pop effect
                anime({
                    targets: `.diana-mark:nth-child(${selectedAreaIndex + 2})`,
                    scale: [1, 1.5, 1.2],
                    duration: 400,
                    easing: 'easeOutElastic(1, .6)'
                });
            }
        });

        container.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedAreaIndex = parseInt(btn.dataset.idx);
                internalRender();
            });
        });
    };
    internalRender();
}

function renderSMARTTool(container) {
    container.innerHTML = `
        <div class="smart-form" style="display: flex; flex-direction: column; gap: 1rem;">
            ${['S', 'M', 'A', 'R', 'T'].map(k => `
                <div class="glass" style="padding: 1rem;">
                    <label style="font-size: 0.7rem;">${k}</label>
                    <input type="text" data-key="${k}" value="${state.persistence.smart[k]}" class="input-underline">
                </div>
            `).join('')}
        </div>
    `;
    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => { state.persistence.smart[e.target.dataset.key] = e.target.value; saveState(); });
    });
}

function renderDARETool(container) {
    // DARE tool logic...
}
