/**
 * ACT In-Session - Vaso de Estrés Module
 * Based on the UNSW Stress Bucket psychoeducation model
 */

import { state, saveState } from '../core/state.js';

const SIZES = { small: 50, medium: 100, large: 160 };

const STRESSORS = [
    {
        category: 'Trabajo / Estudio',
        icon: '💼',
        items: [
            { label: 'Mucho trabajo', pct: 15 },
            { label: 'Plazo de entrega', pct: 20 },
            { label: 'Examen', pct: 15 },
            { label: 'Reunión difícil', pct: 10 },
            { label: 'Error cometido', pct: 10 },
            { label: 'Presentación', pct: 15 },
        ]
    },
    {
        category: 'Relaciones',
        icon: '👥',
        items: [
            { label: 'Discusión', pct: 15 },
            { label: 'Soledad', pct: 10 },
            { label: 'Conflicto familiar', pct: 15 },
            { label: 'Ruptura', pct: 25 },
            { label: 'Malentendido', pct: 10 },
        ]
    },
    {
        category: 'Economía',
        icon: '💰',
        items: [
            { label: 'Deudas', pct: 15 },
            { label: 'Trabajo inestable', pct: 20 },
            { label: 'Gasto inesperado', pct: 10 },
        ]
    },
    {
        category: 'Salud',
        icon: '🏥',
        items: [
            { label: 'Dolor crónico', pct: 15 },
            { label: 'Insomnio', pct: 10 },
            { label: 'Enfermedad', pct: 20 },
            { label: 'Cansancio', pct: 10 },
        ]
    },
    {
        category: 'Vida diaria',
        icon: '🌍',
        items: [
            { label: 'Poco tiempo', pct: 10 },
            { label: 'Tráfico / transporte', pct: 5 },
            { label: 'Ruido / molestias', pct: 5 },
            { label: 'Noticias', pct: 5 },
            { label: 'Demasiadas decisiones', pct: 10 },
        ]
    }
];

const STRATEGIES = [
    {
        category: 'Respiración y calma',
        icon: '🧘',
        items: [
            { label: 'Respirar profundo', pct: 10 },
            { label: 'Meditar', pct: 15 },
            { label: 'Yoga / estirar', pct: 15 },
            { label: 'Pausa consciente', pct: 10 },
        ]
    },
    {
        category: 'Movimiento',
        icon: '🏃',
        items: [
            { label: 'Caminar', pct: 10 },
            { label: 'Correr', pct: 15 },
            { label: 'Deporte', pct: 20 },
            { label: 'Bailar', pct: 15 },
        ]
    },
    {
        category: 'Conexión social',
        icon: '💬',
        items: [
            { label: 'Hablar con alguien', pct: 15 },
            { label: 'Abrazo', pct: 10 },
            { label: 'Reír con otros', pct: 10 },
        ]
    },
    {
        category: 'Descanso',
        icon: '😴',
        items: [
            { label: 'Dormir bien', pct: 20 },
            { label: 'Siesta', pct: 10 },
            { label: 'Desconectar pantallas', pct: 10 },
        ]
    },
    {
        category: 'Ocio y disfrute',
        icon: '🎵',
        items: [
            { label: 'Música', pct: 10 },
            { label: 'Leer', pct: 10 },
            { label: 'Naturaleza', pct: 15 },
            { label: 'Hobby creativo', pct: 15 },
            { label: 'Película / serie', pct: 10 },
        ]
    }
];

export function renderEstresModule(container, config, { renderHome }) {
    let cupSize = state.estres?.cupSize || 'medium';
    let level = state.estres?.level ?? SIZES[cupSize] * 0.4;
    let activeTab = 'estresores'; // 'estresores' | 'estrategias'

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
        const overflow = level + delta > max;
        level = Math.max(0, Math.min(max, level + delta));
        persistState();
        renderInner();
        if (overflow) {
            setTimeout(() => alert('💦 ¡El vaso se ha desbordado!\nHas alcanzado tu límite. Prueba una estrategia de afrontamiento.'), 50);
        }
    }

    function addHistory(text, deltaPct) {
        if (!state.estres) state.estres = {};
        if (!state.estres.history) state.estres.history = [];
        state.estres.history.unshift({ time: Date.now(), text, delta: deltaPct });
        if (state.estres.history.length > 30) state.estres.history.pop();
        saveState();
    }

    function applyChip(label, pct, sign) {
        const signedPct = pct * sign;
        const delta = (signedPct / 100) * getMax();
        const prefix = sign > 0 ? '⬆ ' : '⬇ ';
        addHistory(prefix + label, signedPct);
        changeLevel(delta, label);
    }

    function buildChipPanel(groups, sign) {
        return groups.map(g => `
            <div style="margin-bottom: 0.85rem;">
                <p style="font-size: 0.72rem; font-weight: 700; color: var(--color-text-secondary); letter-spacing: 0.05em; margin: 0 0 0.4rem; text-transform: uppercase;">
                    ${g.icon} ${g.category}
                </p>
                <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                    ${g.items.map(item => `
                        <button class="estres-chip"
                            data-label="${item.label.replace(/"/g, '&quot;')}"
                            data-pct="${item.pct}"
                            data-sign="${sign}"
                            style="padding: 0.35rem 0.7rem; border-radius: 20px; border: 1px solid ${sign > 0 ? 'rgba(234,88,12,0.4)' : 'rgba(37,99,235,0.4)'}; background: ${sign > 0 ? 'rgba(234,88,12,0.1)' : 'rgba(37,99,235,0.1)'}; color: ${sign > 0 ? '#fb923c' : '#60a5fa'}; font-size: 0.8rem; cursor: pointer; transition: var(--transition-base); touch-action: manipulation; white-space: nowrap;">
                            ${item.label}
                            <span style="opacity: 0.65; font-size: 0.7rem; margin-left: 3px;">${sign > 0 ? '+' : '−'}${item.pct}%</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    function renderInner() {
        const percent = getPercent();

        let liquidColor, statusClass, statusHTML;
        if (percent >= 90) {
            liquidColor = 'linear-gradient(180deg, #f43f5e 0%, #9f1239 100%)';
            statusClass = 'estres-status-danger';
            statusHTML = '💥 ¡CUIDADO! El vaso está a punto de desbordarse. Aplica una estrategia ya.';
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

                <!-- Vaso visual + estado -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
                    <div style="position: relative; width: 140px; height: 210px;">
                        <div style="width: 100%; height: 100%; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid rgba(255,255,255,0.5); border-radius: 0 0 32px 32px; overflow: hidden; background: var(--glass-bg); box-shadow: var(--glass-shadow); position: relative;">
                            <div style="position: absolute; top: 8%; left: 0; width: 100%; height: 2px; background: repeating-linear-gradient(90deg, #f43f5e, #f43f5e 6px, transparent 6px, transparent 12px); opacity: 0.5; z-index: 2;"></div>
                            <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: ${percent}%; background: ${liquidColor}; transition: height 0.4s cubic-bezier(0.34,1.56,0.64,1); box-shadow: inset 0 8px 16px rgba(255,200,100,0.2);"></div>
                            <div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.65); padding: 3px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; z-index: 5; color: #fff; backdrop-filter: blur(4px);">
                                ${Math.round(percent)}%
                            </div>
                        </div>
                        <div style="position: absolute; right: -22px; top: 28px; width: 22px; height: 58px; border: 4px solid rgba(255,255,255,0.3); border-left: none; border-radius: 0 24px 24px 0;"></div>
                    </div>

                    <div class="estres-status ${statusClass}" style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-md); text-align: center; font-weight: 600; font-size: 0.9rem;">
                        ${statusHTML}
                    </div>
                </div>

                <!-- Botones genéricos rápidos -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
                    <button class="estres-quick" data-delta="10" data-label="Estresor general"
                        style="background: #ea580c; padding: 0.7rem 0.25rem; border-radius: var(--radius-sm); border: none; color: white; font-weight: 700; font-size: 0.8rem; cursor: pointer; touch-action: manipulation;">
                        🔄 +10%
                    </button>
                    <button class="estres-quick" data-delta="-10" data-label="Afrontamiento"
                        style="background: #2563eb; padding: 0.7rem 0.25rem; border-radius: var(--radius-sm); border: none; color: white; font-weight: 700; font-size: 0.8rem; cursor: pointer; touch-action: manipulation;">
                        🥤 −10%
                    </button>
                    <button id="btn-estres-reset"
                        style="background: rgba(255,255,255,0.07); padding: 0.7rem 0.25rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); color: var(--color-text-secondary); font-weight: 700; font-size: 0.8rem; cursor: pointer; touch-action: manipulation;">
                        🔄 Vaciar
                    </button>
                </div>

                <!-- Tabs: Estresores / Estrategias -->
                <div class="glass-card" style="padding: 0; overflow: hidden;">
                    <!-- Tab headers -->
                    <div style="display: flex; border-bottom: 1px solid var(--glass-border);">
                        <button class="estres-tab ${activeTab === 'estresores' ? 'active' : ''}" data-tab="estresores"
                            style="flex: 1; padding: 0.75rem; border: none; background: ${activeTab === 'estresores' ? 'rgba(234,88,12,0.15)' : 'transparent'}; color: ${activeTab === 'estresores' ? '#fb923c' : 'var(--color-text-secondary)'}; font-weight: 700; font-size: 0.85rem; cursor: pointer; border-bottom: 2px solid ${activeTab === 'estresores' ? '#fb923c' : 'transparent'}; transition: var(--transition-base);">
                            🔴 Estresores
                        </button>
                        <button class="estres-tab ${activeTab === 'estrategias' ? 'active' : ''}" data-tab="estrategias"
                            style="flex: 1; padding: 0.75rem; border: none; background: ${activeTab === 'estrategias' ? 'rgba(37,99,235,0.15)' : 'transparent'}; color: ${activeTab === 'estrategias' ? '#60a5fa' : 'var(--color-text-secondary)'}; font-weight: 700; font-size: 0.85rem; cursor: pointer; border-bottom: 2px solid ${activeTab === 'estrategias' ? '#60a5fa' : 'transparent'}; transition: var(--transition-base);">
                            🔵 Estrategias
                        </button>
                    </div>
                    <!-- Tab content -->
                    <div style="padding: 1rem; max-height: 260px; overflow-y: auto;">
                        ${activeTab === 'estresores'
                            ? buildChipPanel(STRESSORS, 1)
                            : buildChipPanel(STRATEGIES, -1)
                        }
                        <!-- Acción personalizada inline -->
                        <div style="margin-top: 0.5rem; display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center;">
                            <input id="estres-custom-desc" type="text"
                                placeholder="${activeTab === 'estresores' ? 'Otro estresor…' : 'Otra estrategia…'}"
                                style="flex: 2; min-width: 120px; padding: 0.45rem 0.75rem; border-radius: 20px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: var(--color-text-primary); font-size: 0.8rem;">
                            <select id="estres-custom-pct" style="padding: 0.45rem 0.5rem; border-radius: 20px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: var(--color-text-primary); font-size: 0.8rem;">
                                <option value="5">5%</option>
                                <option value="10" selected>10%</option>
                                <option value="15">15%</option>
                                <option value="20">20%</option>
                            </select>
                            <button id="btn-custom-apply"
                                style="padding: 0.45rem 0.85rem; border-radius: 20px; border: none; background: ${activeTab === 'estresores' ? '#ea580c' : '#2563eb'}; color: white; font-weight: 700; font-size: 0.8rem; cursor: pointer;">
                                ${activeTab === 'estresores' ? '⬆ Añadir' : '⬇ Aplicar'}
                            </button>
                        </div>
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
                .estres-status-safe   { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
                .estres-status-warn   { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
                .estres-status-danger { background: rgba(244,63,94,0.15);  color: #f43f5e; border: 1px solid rgba(244,63,94,0.3); animation: breathe 1s infinite; }
                .estres-chip:hover, .estres-chip:active { opacity: 0.8; transform: scale(0.97); }
            </style>
        `;

        lucide.createIcons();

        // Nav
        document.getElementById('btn-estres-back')?.addEventListener('click', renderHome);

        // Size buttons
        container.querySelectorAll('.estres-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prevPct = getPercent();
                cupSize = btn.dataset.size;
                level = (prevPct / 100) * getMax();
                persistState();
                renderInner();
            });
        });

        // Quick buttons
        container.querySelectorAll('.estres-quick').forEach(btn => {
            btn.addEventListener('click', () => {
                const pct = parseInt(btn.dataset.delta);
                const delta = (pct / 100) * getMax();
                addHistory((pct > 0 ? '⬆ ' : '⬇ ') + btn.dataset.label, pct);
                changeLevel(delta, btn.dataset.label);
            });
        });

        // Reset
        document.getElementById('btn-estres-reset')?.addEventListener('click', () => {
            if (confirm('¿Vaciar el vaso y borrar el historial?')) {
                level = 0;
                state.estres = { cupSize, level, history: [] };
                saveState();
                renderInner();
            }
        });

        // Tab switching
        container.querySelectorAll('.estres-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                activeTab = btn.dataset.tab;
                renderInner();
            });
        });

        // Chip buttons
        container.querySelectorAll('.estres-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                applyChip(btn.dataset.label, parseInt(btn.dataset.pct), parseInt(btn.dataset.sign));
            });
        });

        // Custom apply
        document.getElementById('btn-custom-apply')?.addEventListener('click', () => {
            const desc = document.getElementById('estres-custom-desc')?.value.trim() || (activeTab === 'estresores' ? 'Estresor personalizado' : 'Estrategia personalizada');
            const pct = parseInt(document.getElementById('estres-custom-pct')?.value || '10');
            const sign = activeTab === 'estresores' ? 1 : -1;
            applyChip(desc, pct, sign);
        });
    }

    renderInner();
}
