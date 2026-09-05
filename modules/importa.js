/**
 * ACT In-Session - Importa Module (Values / Committed Action)
 */

import { state, saveState } from '../core/state.js';
import { renderModuleHeader, attachHeaderEvents, renderGuideBadge, attachGuideBadgeEvents, attachEdgeFade } from '../ui/utils.js';
import { escapeHTML as esc } from '../core/security.js';

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
        attachEdgeFade(container.querySelector('.tool-selector'));
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

const DIANA_RADIUS = 155;

// Turns raw x/y pixels into a plain-language read of the mark, so the
// exercise says something explicit instead of relying only on "closer to
// the center looks better".
function dianaProximityLabel(area) {
    if (area.x === 0 && area.y === 0) return 'Todavía sin marcar';
    const dist = Math.sqrt(area.x * area.x + area.y * area.y) / DIANA_RADIUS;
    if (dist <= 0.33) return 'Compromiso pleno: viviendo cerca de este valor';
    if (dist <= 0.66) return 'Compromiso parcial: a mitad de camino';
    return 'Alejado/a de este valor por ahora';
}

function renderDianaTool(container) {
    let selectedAreaIndex = 0;
    const areas = state.persistence.diana;

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="text-align: center; margin-bottom: 1.5rem;">
                    <p class="clinical-note">Haz clic en el tablero para situar tu compromiso actual en cada área.</p>
                    <p style="font-size: 0.72rem; color: var(--color-text-secondary); margin-top: 0.35rem;">Centro = compromiso pleno con ese valor · Borde = alejado/a de él, por ahora.</p>
                </div>

                <div class="diana-target" id="diana-canvas" style="width: 320px; height: 320px; margin: 0 auto; border-radius: 50%; position: relative; overflow: hidden;">
                    <!-- Target rings: outer edge (100%), middle (66%), inner (33%) -->
                    <div class="diana-ring" style="width: 310px; height: 310px;"></div>
                    <div class="diana-ring" style="width: 205px; height: 205px;"></div>
                    <div class="diana-ring" style="width: 102px; height: 102px; border-style: solid; opacity: 0.5;"></div>
                    <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                        <div style="width: 1px; height: 100%; background: var(--glass-border); opacity: 0.25;"></div>
                        <div style="width: 100%; height: 1px; background: var(--glass-border); opacity: 0.25; position: absolute;"></div>
                    </div>

                    ${areas.map((area, i) => `
                        <div class="diana-mark" style="position: absolute; left: calc(50% + ${area.x}px); top: calc(50% + ${area.y}px); transform: translate(-50%, -50%); opacity: ${selectedAreaIndex === i ? 1 : 0.4}; scale: ${selectedAreaIndex === i ? 1.2 : 0.8}; background: ${selectedAreaIndex === i ? 'var(--color-primary)' : 'var(--color-text-secondary)'};">
                            ${i + 1}
                        </div>
                    `).join('')}
                </div>

                <p style="text-align: center; font-size: 0.8rem; color: var(--color-primary); font-weight: 600; margin-top: 1rem; min-height: 1.2em;">
                    ${esc(areas[selectedAreaIndex].label)}: ${dianaProximityLabel(areas[selectedAreaIndex])}
                </p>

                <div class="area-selector" style="margin-top: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                    ${areas.map((area, i) => `
                        <button class="btn-toggle ${selectedAreaIndex === i ? 'active' : ''}" data-idx="${i}" style="text-align: left; padding: 0.75rem; height: auto; display: flex; flex-direction: column; gap: 0.25rem;">
                            <span style="font-size: 0.6rem; opacity: 0.7; text-transform: uppercase;">Área ${i + 1}</span>
                            <span style="font-size: 0.85rem; font-weight: bold;">${esc(area.label)}</span>
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
            if (dist < DIANA_RADIUS) {
                state.persistence.diana[selectedAreaIndex].x = x;
                state.persistence.diana[selectedAreaIndex].y = y;
                saveState();
                internalRender();

                // Pop effect
                anime({
                    targets: `.diana-mark:nth-child(${selectedAreaIndex + 5})`,
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
                            <button class="btn-toggle ${paso.area === a.label ? 'active' : ''}" data-area="${esc(a.label).replace(/"/g, '&quot;')}" style="font-size: 0.78rem; padding: 0.6rem; height: auto;">
                                ${esc(a.label)}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="glass" style="padding: 1rem; border-radius: var(--radius-md); display: grid; gap: 0.95rem;">
                    <div>
                        <label style="font-size: 0.72rem; color: var(--color-text-secondary);">El paso más pequeño posible (próximas 24 h)</label>
                        <input type="text" id="paso-accion" class="input-underline" value="${esc(paso.accion || '').replace(/"/g, '&quot;')}" placeholder="Hoy voy a...">
                    </div>
                    <div>
                        <label style="font-size: 0.72rem; color: var(--color-text-secondary);">¿Qué malestar estás dispuesto/a a llevar contigo para darlo?</label>
                        <input type="text" id="paso-disposicion" class="input-underline" value="${esc(paso.disposicion || '').replace(/"/g, '&quot;')}" placeholder="Hago espacio a...">
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
    // Instead of two static worksheets of 8 fields, the patient walks one barrier→move
    // *pivot* at a time: name the barrier, then turn it toward its direction. The felt
    // turn (not the cataloguing) is the point. Data model (fear/dare) is unchanged.
    state.persistence.fear ??= { F: '', E: '', A: '', R: '' };
    state.persistence.dare ??= { D: '', A: '', R: '', E: '' };

    const pivots = [
        { fearKey: 'F', fearLabel: 'Fusión', fearQ: '¿Con qué pensamiento te estás enganchando?', dareKey: 'D', dareLabel: 'Defusión', dareQ: '¿Cómo podés tomar distancia de ese pensamiento?' },
        { fearKey: 'A', fearLabel: 'Evitación del malestar', fearQ: '¿Qué malestar estás evitando?', dareKey: 'A', dareLabel: 'Aceptación', dareQ: '¿A qué estás dispuesto/a a hacer espacio?' },
        { fearKey: 'E', fearLabel: 'Expectativas / metas rígidas', fearQ: '¿Qué expectativa o meta rígida se interpone?', dareKey: 'R', dareLabel: 'Dirección realista', dareQ: '¿Qué paso pequeño y posible aparece?' },
        { fearKey: 'R', fearLabel: 'Alejamiento de los valores', fearQ: '¿De qué valor te aleja esto?', dareKey: 'E', dareLabel: 'Encarnar los valores', dareQ: '¿Qué valor querés llevar a la acción?' }
    ];

    let current = 0;
    const revealed = pivots.map(() => false);

    const guide = renderGuideBadge({
        trigger: 'El paciente está trabado frente a una acción valiosa y aparecen barreras (fusión, evitación, exigencia, desconexión de valores). Útil para pasar de la barrera a la dirección, una por una.',
        intro: 'No vamos a corregir nada. Frente a cada barrera que aparece, vamos a girar hacia la dirección que elegís. Una barrera, un giro.',
        questions: [
            '¿Qué barrera está más viva ahora mismo?',
            'Si girás hacia la dirección, ¿qué aparece?',
            '¿Notás la diferencia entre la barrera y el movimiento que elegís?'
        ],
        abort: 'El giro se vuelve un "debería" o autoexigencia. Volver a que es una dirección elegida, no una obligación.'
    });

    const internalRender = () => {
        const p = pivots[current];
        const isRevealed = revealed[current];
        const isLast = current === pivots.length - 1;

        container.innerHTML = `
            <div class="tool-content">
                ${guide}
                <div class="intro" style="text-align: center; margin-bottom: 1rem;">
                    <p class="clinical-note">De la barrera a la dirección. Un giro cada vez.</p>
                </div>

                <div style="display: flex; justify-content: center; gap: 0.4rem; margin-bottom: 1.25rem;">
                    ${pivots.map((_, i) => `<span style="width: 24px; height: 4px; border-radius: 2px; background: ${i === current ? 'var(--color-primary)' : (revealed[i] ? '#10b981' : 'var(--glass-border)')};"></span>`).join('')}
                </div>

                <div class="glass" style="padding: 1rem; border-radius: var(--radius-md); border-left: 3px solid #ef4444;">
                    <h4 style="font-size: 0.8rem; color: #ef4444; margin-bottom: 0.6rem;">↩ Barrera · ${p.fearLabel}</h4>
                    <input type="text" id="pivot-fear" value="${esc(state.persistence.fear[p.fearKey] || '').replace(/"/g, '&quot;')}" placeholder="${p.fearQ}" class="input-underline">
                </div>

                ${isRevealed ? `
                <div style="text-align: center; color: var(--color-primary); font-size: 1.4rem; margin: 0.5rem 0;">↓</div>
                <div class="glass" style="padding: 1rem; border-radius: var(--radius-md); border-left: 3px solid #10b981; animation: slideUp 0.3s ease;">
                    <h4 style="font-size: 0.8rem; color: #10b981; margin-bottom: 0.6rem;">→ Dirección · ${p.dareLabel}</h4>
                    <input type="text" id="pivot-dare" value="${esc(state.persistence.dare[p.dareKey] || '').replace(/"/g, '&quot;')}" placeholder="${p.dareQ}" class="input-underline">
                </div>
                ` : `
                <div style="text-align: center; margin-top: 1.25rem;">
                    <button class="btn-primary" id="btn-pivot-turn">Girar hacia la dirección →</button>
                </div>
                `}

                <div style="margin-top: 1.75rem; display: flex; justify-content: center; gap: 1rem;">
                    <button class="btn-ghost" id="btn-pivot-prev" ${current === 0 ? 'disabled' : ''}>Anterior</button>
                    <button class="btn-primary" id="btn-pivot-next">${isLast ? 'Terminar' : 'Siguiente giro'}</button>
                </div>
            </div>
        `;

        attachGuideBadgeEvents();

        document.getElementById('pivot-fear')?.addEventListener('input', (e) => {
            state.persistence.fear[p.fearKey] = e.target.value;
            saveState();
        });
        document.getElementById('pivot-dare')?.addEventListener('input', (e) => {
            state.persistence.dare[p.dareKey] = e.target.value;
            saveState();
        });

        document.getElementById('btn-pivot-turn')?.addEventListener('click', () => {
            revealed[current] = true;
            internalRender();
            document.getElementById('pivot-dare')?.focus();
        });
        document.getElementById('btn-pivot-next')?.addEventListener('click', () => {
            current = (current + 1) % pivots.length;
            internalRender();
        });
        document.getElementById('btn-pivot-prev')?.addEventListener('click', () => {
            if (current > 0) current--;
            internalRender();
        });
    };
    internalRender();
}
