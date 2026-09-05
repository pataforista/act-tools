/**
 * ACT In-Session - Análisis Module (Functional Analysis)
 */

import { state, saveState } from '../core/state.js';
import { renderModuleHeader, attachHeaderEvents, renderGuideBadge, attachGuideBadgeEvents, showToast } from '../ui/utils.js';
import { escapeHTML as esc } from '../core/security.js';

export function renderAnalisisModule(container, module, { renderHome }) {
    let activeToolId = 'matrix';
    const tools = [
        { id: 'matrix', title: 'Matrix Swipe', icon: 'layout' },
        { id: 'costo', title: 'Coste Evitación', icon: 'scale' }
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
        else if (activeToolId === 'costo') renderEvitacionTool(toolContainer);
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
                state.persistence.matrix[id].map((item, i) => `
                                        <div class="glass" style="padding: 0.5rem; font-size: 0.75rem; border-left: 2px solid ${cat.color}; background: rgba(0,0,0,0.1); border-radius: 4px; display: flex; align-items: center; gap: 0.4rem;">
                                            <span style="flex: 1;">${esc(item)}</span>
                                            <button class="item-remove-btn btn-del-matrix" data-qid="${id}" data-idx="${i}" aria-label="Quitar">×</button>
                                        </div>
                                    `).join('') :
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

        container.querySelectorAll('.btn-del-matrix').forEach(btn => {
            btn.addEventListener('click', () => {
                const qid = btn.dataset.qid;
                const idx = parseInt(btn.dataset.idx);
                const [removed] = state.persistence.matrix[qid].splice(idx, 1);
                saveState();
                internalRender();
                showToast('Ítem quitado del cuadrante', {
                    actionLabel: 'Deshacer',
                    onAction: () => {
                        state.persistence.matrix[qid].splice(idx, 0, removed);
                        saveState();
                        internalRender();
                    }
                });
            });
        });
    };
    internalRender();
}

function renderEvitacionTool(container) {
    // Replaces the flat DOTS inventory: instead of cataloguing avoidance, the patient
    // *weighs* each move — short-term relief against long-term cost (creative hopelessness).
    state.persistence.evitacion ??= [];
    let draft = { tipo: '', alivio: '', costo: '' };

    // DOTS taxonomy kept as optional scaffolding prompts, not required fields.
    const prompts = [
        { label: 'Distracción', hint: 'Me distraigo con...' },
        { label: 'Otros', hint: 'Me apoyo / descargo en otros con...' },
        { label: 'Pensar', hint: 'Le doy vueltas a...' },
        { label: 'Sustancias', hint: 'Uso ... para no sentir' }
    ];

    const guide = renderGuideBadge({
        trigger: 'El paciente describe estrategias para no sentir (distracción, rumiación, sustancias, buscar tranquilización). Útil para hacer contacto con la inviabilidad del control a largo plazo (desesperanza creativa).',
        intro: 'No vamos a juzgar lo que hacés para aliviarte. Vamos a mirar de cerca qué te da a corto plazo... y qué te ha costado a la larga.',
        questions: [
            '¿Esto funciona a corto plazo? ¿Y a largo plazo?',
            '¿Qué te ha costado en tiempo, energía o cercanía a lo que importa?',
            '¿Te acerca a tu vida, o solo te aleja del malestar?'
        ],
        abort: 'El paciente entra en autocrítica ("qué mal lo hago"). Devolver a la observación funcional: no es culpa, es coste.'
    });

    const internalRender = () => {
        const list = state.persistence.evitacion;
        container.innerHTML = `
            <div class="tool-content">
                ${guide}
                <div class="intro" style="text-align: center; margin-bottom: 1rem;">
                    <p class="clinical-note">Las cosas que hacés para no sentir. No para juzgarlas: para ver qué te dan y qué te cuestan.</p>
                </div>

                <div class="glass" style="padding: 1rem; border-radius: var(--radius-md); display: grid; gap: 0.75rem; margin-bottom: 1rem;">
                    <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                        ${prompts.map(p => `
                            <button class="btn-toggle btn-evit-prompt" data-hint="${p.hint.replace(/"/g, '&quot;')}" style="font-size: 0.72rem; padding: 0.35rem 0.7rem; height: auto;">${p.label}</button>
                        `).join('')}
                    </div>
                    <input type="text" id="evit-tipo" class="input-field" placeholder="¿Qué hacés para no sentir?" value="${esc(draft.tipo).replace(/"/g, '&quot;')}">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <input type="text" id="evit-alivio" class="input-field" placeholder="Alivio a corto plazo" value="${esc(draft.alivio).replace(/"/g, '&quot;')}" style="border-color: #10b98144;">
                        <input type="text" id="evit-costo" class="input-field" placeholder="Coste a largo plazo" value="${esc(draft.costo).replace(/"/g, '&quot;')}" style="border-color: #ef444444;">
                    </div>
                    <button id="btn-add-evit" class="btn-primary" style="font-size: 0.8rem;">Añadir a la balanza</button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${list.length === 0
                ? '<p style="text-align: center; font-size: 0.8rem; color: var(--color-text-secondary); opacity: 0.5;">Todavía no hay nada en la balanza.</p>'
                : list.map((e, i) => `
                            <div class="glass" style="padding: 0.85rem; border-radius: var(--radius-md);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <strong style="font-size: 0.85rem;">${esc(e.tipo) || 'Evitación'}</strong>
                                    <button class="btn-ghost btn-del-evit" data-idx="${i}" style="color: #ef4444; font-size: 0.72rem;">Quitar ×</button>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                                    <div style="padding: 0.5rem; border-radius: var(--radius-sm); background: rgba(16,185,129,0.08); border-left: 2px solid #10b981;">
                                        <span style="font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1px; color: #10b981;">Corto plazo</span>
                                        <p style="font-size: 0.78rem; margin: 0.2rem 0 0;">${esc(e.alivio) || '—'}</p>
                                    </div>
                                    <div style="padding: 0.5rem; border-radius: var(--radius-sm); background: rgba(239,68,68,0.08); border-left: 2px solid #ef4444;">
                                        <span style="font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1px; color: #ef4444;">Largo plazo</span>
                                        <p style="font-size: 0.78rem; margin: 0.2rem 0 0;">${esc(e.costo) || '—'}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                </div>

                ${list.length ? `
                <div class="glass" style="margin-top: 1rem; padding: 0.85rem; border-radius: var(--radius-sm); background: rgba(var(--color-primary-rgb, 99,102,241),0.08);">
                    <p style="font-size: 0.78rem; font-style: italic; color: var(--color-text-secondary); margin: 0;">💭 Si esto funcionara de verdad a largo plazo, ¿seguirías necesitando hacerlo?</p>
                </div>` : ''}
            </div>
        `;

        attachGuideBadgeEvents();

        const addEvitacion = () => {
            if (!draft.tipo.trim() && !draft.alivio.trim() && !draft.costo.trim()) return;
            state.persistence.evitacion.push({ tipo: draft.tipo.trim(), alivio: draft.alivio.trim(), costo: draft.costo.trim() });
            draft = { tipo: '', alivio: '', costo: '' };
            saveState();
            internalRender();
        };

        ['evit-tipo', 'evit-alivio', 'evit-costo'].forEach((id) => {
            const field = id.replace('evit-', '');
            const el = document.getElementById(id);
            el?.addEventListener('input', e => draft[field] = e.target.value);
            el?.addEventListener('keydown', e => { if (e.key === 'Enter') addEvitacion(); });
        });

        container.querySelectorAll('.btn-evit-prompt').forEach(btn => {
            btn.addEventListener('click', () => {
                draft.tipo = btn.dataset.hint;
                internalRender();
                document.getElementById('evit-tipo')?.focus();
            });
        });

        document.getElementById('btn-add-evit')?.addEventListener('click', addEvitacion);

        container.querySelectorAll('.btn-del-evit').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                const [removed] = state.persistence.evitacion.splice(idx, 1);
                saveState();
                internalRender();
                showToast('Quitado de la balanza', {
                    actionLabel: 'Deshacer',
                    onAction: () => {
                        state.persistence.evitacion.splice(idx, 0, removed);
                        saveState();
                        internalRender();
                    }
                });
            });
        });
    };
    internalRender();
}
