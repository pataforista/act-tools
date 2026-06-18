/**
 * ACT In-Session - Vaso de Estrés Module
 * Based on the UNSW Stress Bucket psychoeducation model
 */

import { state, saveState } from '../core/state.js';

const SIZES = { small: 50, medium: 100, large: 160 };

export function renderEstresModule(container, config, { renderHome }) {
    let cupSize = state.estres?.cupSize || 'medium';
    let level = state.estres?.level ?? SIZES[cupSize] * 0.4;

    function getMax() { return SIZES[cupSize]; }
    function getPercent() { return Math.min(100, Math.max(0, (level / getMax()) * 100)); }

    function persistState() {
        if (!state.estres) state.estres = {};
        state.estres.cupSize = cupSize;
        state.estres.level = level;
        saveState();
    }

    function changeLevel(delta, description) {
        const max = getMax();
        const newLevel = Math.max(0, Math.min(max, level + delta));
        const overflow = level + delta > max;
        level = newLevel;
        persistState();
        renderInner();
        if (overflow) {
            setTimeout(() => alert('💦 ¡El vaso se ha desbordado!\nHas alcanzado tu límite. Prueba a Beber o Derramar.'), 50);
        }
    }

    function renderInner() {
        const percent = getPercent();

        let liquidColor, statusClass, statusHTML;
        if (percent >= 90) {
            liquidColor = 'linear-gradient(180deg, #f43f5e 0%, #9f1239 100%)';
            statusClass = 'estres-status-danger';
            statusHTML = '💥 ¡CUIDADO! El vaso está a punto de desbordarse. Bebe o derrama ahora.';
        } else if (percent >= 70) {
            liquidColor = 'linear-gradient(180deg, #f59e0b 0%, #b45309 100%)';
            statusClass = 'estres-status-warn';
            statusHTML = '⚠️ Vaso muy lleno. Aplica una estrategia de afrontamiento.';
        } else if (percent <= 20) {
            liquidColor = 'linear-gradient(180deg, #10b981 0%, #065f46 100%)';
            statusClass = 'estres-status-safe';
            statusHTML = '🧘 Nivel bajo. Tienes mucho margen.';
        } else {
            liquidColor = 'linear-gradient(180deg, #d35400 0%, #873600 100%)';
            statusClass = 'estres-status-safe';
            statusHTML = '✅ Nivel equilibrado. Sigue así.';
        }

        const history = state.estres?.history || [];

        container.innerHTML = `
            <div class="module-view animate-scale-in" style="display: flex; flex-direction: column; gap: 1.25rem;">

                <header class="tool-header" style="border-bottom: 2px solid #f59e0b; padding-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 1.5rem;">🥤</span>
                        <div>
                            <h2 style="font-size: 1.1rem; color: #f59e0b;">Vaso de Estrés</h2>
                            <p style="font-size: 0.75rem; color: var(--color-text-secondary);">Cuánto llevas dentro</p>
                        </div>
                    </div>
                    <button class="btn-ghost" id="btn-estres-back">← Inicio</button>
                </header>

                <!-- Selector de tamaño -->
                <div style="display: flex; gap: 0.5rem; width: 100%;">
                    ${[['small','🥤 Pequeño','#10b981'],['medium','🥤 Mediano','#f59e0b'],['large','🥤 Grande','#f43f5e']].map(([size, label, col]) => `
                        <button class="estres-size-btn ${cupSize === size ? 'active' : ''}"
                            data-size="${size}"
                            style="flex: 1; padding: 0.6rem 0.25rem; border-radius: var(--radius-sm); border: 2px solid ${cupSize === size ? col : 'var(--glass-border)'}; background: ${cupSize === size ? col + '22' : 'transparent'}; color: ${cupSize === size ? col : 'var(--color-text-secondary)'}; font-weight: 600; font-size: 0.75rem; cursor: pointer; transition: var(--transition-base);">
                            ${label}
                        </button>
                    `).join('')}
                </div>

                <!-- Vaso visual -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
                    <div id="estres-cup" style="position: relative; width: 140px; height: 210px;">
                        <!-- Cuerpo -->
                        <div style="width: 100%; height: 100%; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid rgba(255,255,255,0.5); border-radius: 0 0 32px 32px; overflow: hidden; background: var(--glass-bg); box-shadow: var(--glass-shadow); position: relative;">
                            <!-- Línea de peligro -->
                            <div style="position: absolute; top: 8%; left: 0; width: 100%; height: 2px; background: repeating-linear-gradient(90deg, #f43f5e, #f43f5e 6px, transparent 6px, transparent 12px); opacity: 0.5; z-index: 2;"></div>
                            <!-- Líquido -->
                            <div id="estres-liquid" style="position: absolute; bottom: 0; left: 0; width: 100%; height: ${percent}%; background: ${liquidColor}; transition: height 0.4s cubic-bezier(0.34,1.56,0.64,1); box-shadow: inset 0 8px 16px rgba(255,200,100,0.2);"></div>
                            <!-- Porcentaje -->
                            <div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.65); padding: 3px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; z-index: 5; color: #fff; backdrop-filter: blur(4px);">
                                ${Math.round(percent)}%
                            </div>
                        </div>
                        <!-- Asa -->
                        <div style="position: absolute; right: -22px; top: 28px; width: 22px; height: 58px; border: 4px solid rgba(255,255,255,0.3); border-left: none; border-radius: 0 24px 24px 0;"></div>
                    </div>

                    <!-- Estado -->
                    <div class="estres-status ${statusClass}" style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-md); text-align: center; font-weight: 600; font-size: 0.9rem;">
                        ${statusHTML}
                    </div>
                </div>

                <!-- Botones de acción -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                    <button class="btn-primary estres-action" data-action="serve" data-delta="10"
                        style="background: #ea580c; box-shadow: 0 4px 0 rgba(0,0,0,0.3); padding: 0.9rem; border-radius: var(--radius-md); border: none; color: white; font-weight: 700; font-size: 1rem; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px; touch-action: manipulation;">
                        🔄 Servir +10%
                        <span style="font-size: 0.65rem; opacity: 0.75;">Estresor</span>
                    </button>
                    <button class="btn-primary estres-action" data-action="drink" data-delta="-10"
                        style="background: #2563eb; box-shadow: 0 4px 0 rgba(0,0,0,0.3); padding: 0.9rem; border-radius: var(--radius-md); border: none; color: white; font-weight: 700; font-size: 1rem; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px; touch-action: manipulation;">
                        🥤 Beber −10%
                        <span style="font-size: 0.65rem; opacity: 0.75;">Afrontar</span>
                    </button>
                    <button class="btn-primary estres-action" data-action="spill" data-delta="-30"
                        style="background: #7c3aed; box-shadow: 0 4px 0 rgba(0,0,0,0.3); padding: 0.9rem; border-radius: var(--radius-md); border: none; color: white; font-weight: 700; font-size: 1rem; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px; touch-action: manipulation;">
                        💦 Derramar −30%
                        <span style="font-size: 0.65rem; opacity: 0.75;">Soltar estrés</span>
                    </button>
                    <button id="btn-estres-reset"
                        style="background: rgba(255,255,255,0.07); box-shadow: 0 4px 0 rgba(0,0,0,0.3); padding: 0.9rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); color: var(--color-text-secondary); font-weight: 700; font-size: 1rem; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px; touch-action: manipulation;">
                        🔄 Nuevo Vaso
                        <span style="font-size: 0.65rem; opacity: 0.75;">Reiniciar</span>
                    </button>
                </div>

                <!-- Acción personalizada -->
                <div class="glass-card" style="padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem;">
                    <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin: 0;">Acción personalizada</p>
                    <input id="estres-custom-desc" type="text" placeholder="Ej. Examen, Meditar, Hablar con alguien…"
                        style="width: 100%; padding: 0.6rem 0.9rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: var(--color-text-primary); font-size: 0.9rem;">
                    <div style="display: flex; gap: 0.5rem;">
                        <select id="estres-custom-pct" style="padding: 0.6rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: var(--color-text-primary); font-size: 0.85rem; flex: 1;">
                            <option value="5">5%</option>
                            <option value="10" selected>10%</option>
                            <option value="20">20%</option>
                        </select>
                        <button id="btn-custom-serve" style="flex: 1; padding: 0.6rem; border-radius: var(--radius-sm); background: #ea580c; border: none; color: white; font-weight: 700; font-size: 0.85rem; cursor: pointer;">⬆ Estresor</button>
                        <button id="btn-custom-drink" style="flex: 1; padding: 0.6rem; border-radius: var(--radius-sm); background: #2563eb; border: none; color: white; font-weight: 700; font-size: 0.85rem; cursor: pointer;">⬇ Afrontar</button>
                    </div>
                </div>

                <!-- Historial -->
                <div class="glass-card" style="padding: 1rem; max-height: 180px; overflow-y: auto;">
                    <h3 style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0 0 0.6rem;">📋 Movimientos recientes</h3>
                    ${history.length === 0
                        ? `<p style="font-size: 0.8rem; color: var(--color-text-secondary); text-align: center; opacity: 0.5;">Sin movimientos aún</p>`
                        : `<ul style="list-style: none; display: flex; flex-direction: column; gap: 0.4rem;">
                            ${history.slice(0, 30).map(h => `
                                <li style="display: flex; justify-content: space-between; font-size: 0.8rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.35rem;">
                                    <span style="color: var(--color-text-secondary);">${new Date(h.time).toLocaleTimeString()} · ${h.text}</span>
                                    <span style="font-weight: 700; color: ${h.delta > 0 ? '#f59e0b' : '#10b981'};">${h.delta > 0 ? '+' : ''}${h.delta}%</span>
                                </li>
                            `).join('')}
                        </ul>`
                    }
                </div>

            </div>

            <style>
                .estres-status-safe  { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
                .estres-status-warn  { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
                .estres-status-danger { background: rgba(244,63,94,0.15); color: #f43f5e; border: 1px solid rgba(244,63,94,0.3); animation: breathe 1s infinite; }
            </style>
        `;

        lucide.createIcons();

        // Navigation
        document.getElementById('btn-estres-back')?.addEventListener('click', renderHome);

        // Size selector
        container.querySelectorAll('.estres-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const newSize = btn.dataset.size;
                const prevPercent = getPercent();
                cupSize = newSize;
                level = (prevPercent / 100) * getMax();
                persistState();
                renderInner();
            });
        });

        // Quick actions
        container.querySelectorAll('.estres-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const pct = parseInt(btn.dataset.delta);
                const max = getMax();
                const delta = (pct / 100) * max;
                const labels = { serve: 'Servir (estresor)', drink: 'Beber (afrontar)', spill: 'Derramar (soltar)' };
                addHistory(labels[btn.dataset.action], pct);
                changeLevel(delta, labels[btn.dataset.action]);
            });
        });

        // Reset
        document.getElementById('btn-estres-reset')?.addEventListener('click', () => {
            if (confirm('¿Empezar con un vaso nuevo? Se borrará el nivel e historial.')) {
                level = getMax() * 0.3;
                state.estres = { cupSize, level, history: [] };
                saveState();
                renderInner();
            }
        });

        // Custom actions
        document.getElementById('btn-custom-serve')?.addEventListener('click', () => applyCustom(1));
        document.getElementById('btn-custom-drink')?.addEventListener('click', () => applyCustom(-1));
    }

    function addHistory(text, deltaPct) {
        if (!state.estres) state.estres = {};
        if (!state.estres.history) state.estres.history = [];
        state.estres.history.unshift({ time: Date.now(), text, delta: deltaPct });
        if (state.estres.history.length > 30) state.estres.history.pop();
        saveState();
    }

    function applyCustom(sign) {
        const desc = (document.getElementById('estres-custom-desc')?.value.trim()) || (sign > 0 ? 'Estresor personalizado' : 'Afrontamiento personalizado');
        const pct = parseInt(document.getElementById('estres-custom-pct')?.value || '10') * sign;
        const delta = (pct / 100) * getMax();
        addHistory((sign > 0 ? '⬆ ' : '⬇ ') + desc, pct);
        changeLevel(delta, desc);
    }

    renderInner();
}
