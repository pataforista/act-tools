/**
 * ACT In-Session - Importa Module (Values / Committed Action)
 */

import { state, saveState } from '../core/state.js';
import { renderModuleHeader, attachHeaderEvents, renderGuideBadge, attachGuideBadgeEvents } from '../ui/utils.js';

export function renderImportaModule(container, module, { renderHome, initialTool } = {}) {
    const tools = [
        { id: 'diana', title: 'Diana (Target)', icon: 'target' },
        { id: 'paso', title: 'Paso Mínimo', icon: 'footprints' },
        { id: 'dare', title: 'FEAR → DARE', icon: 'rocket' }
    ];

    let activeToolId = tools.some(t => t.id === initialTool) ? initialTool : 'diana';

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
        else if (activeToolId === 'paso') renderPasoTool(toolContainer);
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

function renderPasoTool(container) {
    // Replaces the SMART worksheet: a values-linked micro-commitment with willingness
    // baked in, instead of five achievement-framed criteria to fill.
    state.persistence.paso ??= { area: '', accion: '', disposicion: '', cuando: '' };
    const paso = state.persistence.paso;
    const areas = state.persistence.diana;

    const guide = renderGuideBadge({
        trigger: 'El paciente identifica un valor pero no lo traduce en conducta, o plantea metas grandes/abstractas. Útil para pasar de la intención a un paso concreto y posible.',
        intro: 'No buscamos una gran meta. Buscamos el paso más pequeño que puedas dar en dirección a lo que importa, incluso llevando el malestar contigo.',
        questions: [
            '¿Cuál es el paso más pequeño que sí depende de vos?',
            '¿Qué malestar estás dispuesto/a a llevar para darlo?',
            '¿Esto es una dirección, o una meta que tenés que alcanzar?'
        ],
        abort: 'El paso se vuelve una exigencia de rendimiento o se usa para calmar culpa. Volver a la dirección, no al logro.'
    });

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                ${guide}
                <div class="intro" style="text-align: center; margin-bottom: 1.25rem;">
                    <p class="clinical-note">Un paso mínimo, en una dirección valiosa. No es una meta a cumplir: es hacia dónde te movés.</p>
                </div>

                <div class="glass" style="padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
                    <label style="font-size: 0.72rem; color: var(--color-text-secondary);">¿Hacia qué área querés moverte?</label>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-top: 0.5rem;">
                        ${areas.map(a => `
                            <button class="btn-toggle ${paso.area === a.label ? 'active' : ''}" data-area="${a.label.replace(/"/g, '&quot;')}" style="font-size: 0.78rem; padding: 0.6rem; height: auto;">
                                ${a.label}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="glass" style="padding: 1rem; border-radius: var(--radius-md); display: grid; gap: 0.95rem;">
                    <div>
                        <label style="font-size: 0.72rem; color: var(--color-text-secondary);">El paso más pequeño posible (próximas 24 h)</label>
                        <input type="text" id="paso-accion" class="input-underline" value="${paso.accion || ''}" placeholder="Hoy voy a...">
                    </div>
                    <div>
                        <label style="font-size: 0.72rem; color: var(--color-text-secondary);">¿Qué malestar estás dispuesto/a a llevar contigo para darlo?</label>
                        <input type="text" id="paso-disposicion" class="input-underline" value="${paso.disposicion || ''}" placeholder="Hago espacio a...">
                    </div>
                    <div>
                        <label style="font-size: 0.72rem; color: var(--color-text-secondary);">¿Cuándo?</label>
                        <div style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
                            ${['Hoy', 'Esta semana'].map(w => `
                                <button class="btn-toggle ${paso.cuando === w ? 'active' : ''}" data-cuando="${w}" style="flex: 1; font-size: 0.78rem;">${w}</button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        attachGuideBadgeEvents();

        container.querySelectorAll('[data-area]').forEach(btn => {
            btn.addEventListener('click', () => { paso.area = btn.dataset.area; saveState(); internalRender(); });
        });
        container.querySelectorAll('[data-cuando]').forEach(btn => {
            btn.addEventListener('click', () => { paso.cuando = btn.dataset.cuando; saveState(); internalRender(); });
        });
        document.getElementById('paso-accion')?.addEventListener('input', e => { paso.accion = e.target.value; saveState(); });
        document.getElementById('paso-disposicion')?.addEventListener('input', e => { paso.disposicion = e.target.value; saveState(); });
    };
    internalRender();
}

function renderDARETool(container) {
    state.persistence.fear ??= { F: '', E: '', A: '', R: '' };
    state.persistence.dare ??= { D: '', A: '', R: '', E: '' };

    const fearItems = [
        { key: 'F', label: 'F · Fusión', placeholder: '¿Con qué pensamiento te estás enganchando?' },
        { key: 'E', label: 'E · Expectativas / Evaluaciones', placeholder: '¿Qué expectativa o juicio se interpone?' },
        { key: 'A', label: 'A · Evitación del malestar', placeholder: '¿Qué malestar estás evitando?' },
        { key: 'R', label: 'R · Alejamiento de los valores', placeholder: '¿De qué valor te aleja esto?' }
    ];

    const dareItems = [
        { key: 'D', label: 'D · Defusión', placeholder: '¿Cómo podés tomar distancia del pensamiento?' },
        { key: 'A', label: 'A · Aceptación del malestar', placeholder: '¿A qué estás dispuesto/a a hacer espacio?' },
        { key: 'R', label: 'R · Dirección realista', placeholder: '¿Qué paso pequeño y posible aparece?' },
        { key: 'E', label: 'E · Encarnar los valores', placeholder: '¿Qué valor querés llevar a la acción?' }
    ];

    container.innerHTML = `
        <div class="tool-content">
            <div class="intro" style="text-align: center; margin-bottom: 1.5rem;">
                <p class="clinical-note">Nota las barreras (FEAR) y, frente a cada una, la dirección que elegís (DARE). No es para corregir: es para ver el contraste.</p>
            </div>

            <div style="display: grid; gap: 1.5rem;">
                <div class="glass" style="padding: 1rem; border-radius: var(--radius-md); border-left: 3px solid #ef4444;">
                    <h4 style="font-size: 0.85rem; color: #ef4444; margin-bottom: 0.75rem;">FEAR · Lo que aleja</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                        ${fearItems.map(item => `
                            <div>
                                <label style="font-size: 0.72rem; color: var(--color-text-secondary);">${item.label}</label>
                                <input type="text" data-fear="${item.key}" value="${state.persistence.fear[item.key] || ''}" placeholder="${item.placeholder}" class="input-underline">
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="glass" style="padding: 1rem; border-radius: var(--radius-md); border-left: 3px solid #10b981;">
                    <h4 style="font-size: 0.85rem; color: #10b981; margin-bottom: 0.75rem;">DARE · La dirección que elegís</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                        ${dareItems.map(item => `
                            <div>
                                <label style="font-size: 0.72rem; color: var(--color-text-secondary);">${item.label}</label>
                                <input type="text" data-dare="${item.key}" value="${state.persistence.dare[item.key] || ''}" placeholder="${item.placeholder}" class="input-underline">
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    container.querySelectorAll('[data-fear]').forEach(input => {
        input.addEventListener('input', (e) => {
            state.persistence.fear[e.target.dataset.fear] = e.target.value;
            saveState();
        });
    });

    container.querySelectorAll('[data-dare]').forEach(input => {
        input.addEventListener('input', (e) => {
            state.persistence.dare[e.target.dataset.dare] = e.target.value;
            saveState();
        });
    });
}
