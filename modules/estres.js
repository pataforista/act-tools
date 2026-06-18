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

// Paper cup SVG inspired by the classic Jazz/brushstroke paper cup design
function buildCupSVG(percent) {
    const TOP_Y = 22, BTM_Y = 264, CUP_H = BTM_Y - TOP_Y;
    const liqTopY = TOP_Y + CUP_H * (1 - percent / 100);
    const liqH = CUP_H * (percent / 100);

    let liqTop, liqBot;
    if (percent >= 90)      { liqTop = '#f43f5e'; liqBot = '#9f1239'; }
    else if (percent >= 70) { liqTop = '#f59e0b'; liqBot = '#b45309'; }
    else if (percent <= 20) { liqTop = '#10b981'; liqBot = '#065f46'; }
    else                    { liqTop = '#d35400'; liqBot = '#873600'; }

    return `
    <div style="filter: drop-shadow(0 10px 28px rgba(0,0,0,0.65));">
      <svg viewBox="0 0 200 280" width="148" height="207" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="cup-clip">
            <path d="M19,${TOP_Y} L181,${TOP_Y} L161,${BTM_Y} L39,${BTM_Y} Z"/>
          </clipPath>
          <linearGradient id="liq-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${liqTop}"/>
            <stop offset="100%" stop-color="${liqBot}"/>
          </linearGradient>
          <linearGradient id="rim-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#d8d8d8"/>
          </linearGradient>
          <linearGradient id="body-g" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#e8e8e8"/>
            <stop offset="50%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#e8e8e8"/>
          </linearGradient>
        </defs>

        <!-- White cup body -->
        <path d="M19,${TOP_Y} L181,${TOP_Y} L161,${BTM_Y} L39,${BTM_Y} Z" fill="url(#body-g)"/>

        <!-- Liquid fill (clipped) -->
        <g clip-path="url(#cup-clip)">
          <rect x="0" y="${liqTopY}" width="200" height="${Math.max(0, liqH)}" fill="url(#liq-g)" opacity="0.85"/>
          ${percent > 2 ? `<rect x="0" y="${liqTopY}" width="200" height="5" fill="rgba(255,255,255,0.35)"/>` : ''}
        </g>

        <!-- Brushstroke decoration (teal + purple, always on top of liquid) -->
        <g clip-path="url(#cup-clip)">
          <!-- Main teal area - diagonal sweep upper-left to center-right -->
          <path d="M-5,18 C45,-6 130,8 210,30 C222,85 200,115 162,122 C108,142 32,120 -5,96 Z"
                fill="#00b4d8"/>
          <!-- Lighter teal secondary / splash -->
          <path d="M32,114 C88,88 162,95 208,110 C212,142 192,158 156,150 C98,160 28,150 32,114 Z"
                fill="#48cae4" opacity="0.65"/>
          <!-- White texture highlights on teal -->
          <path d="M25,30 C82,10 162,24 204,42 L204,52 C162,32 82,20 20,44 Z" fill="white" opacity="0.28"/>
          <path d="M-5,62 C42,46 114,52 194,66 L194,76 C114,60 42,56 -5,72 Z" fill="white" opacity="0.18"/>
          <!-- Purple/magenta accent streak -->
          <path d="M-5,88 C52,65 148,78 212,94 C214,120 206,130 192,126 C132,120 38,122 -5,120 Z"
                fill="#9b5de5" opacity="0.82"/>
          <!-- Dark indigo vein inside purple -->
          <path d="M5,98 C58,80 152,90 200,104 C200,114 196,118 188,115 C132,110 50,110 5,117 Z"
                fill="#4c1d95" opacity="0.5"/>
          <!-- Scattered teal speckles (texture) -->
          <circle cx="145" cy="135" r="18" fill="#00b4d8" opacity="0.35"/>
          <circle cx="160" cy="148" r="10" fill="#48cae4" opacity="0.3"/>
          <circle cx="55" cy="130" r="8"  fill="#00b4d8" opacity="0.25"/>
        </g>

        <!-- Danger line at 90% level -->
        <line x1="21" y1="${TOP_Y + CUP_H * 0.10}"
              x2="179" y2="${TOP_Y + CUP_H * 0.10}"
              stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="5,4" opacity="0.45"/>

        <!-- Cup side sheen (right edge highlight) -->
        <path d="M175,${TOP_Y + 4} L161,${BTM_Y - 4}" stroke="rgba(255,255,255,0.5)" stroke-width="3" stroke-linecap="round"/>

        <!-- Cup outline -->
        <path d="M19,${TOP_Y} L181,${TOP_Y} L161,${BTM_Y} L39,${BTM_Y} Z"
              fill="none" stroke="rgba(180,180,180,0.6)" stroke-width="2"/>

        <!-- Rim ellipse -->
        <ellipse cx="100" cy="${TOP_Y}" rx="82" ry="9" fill="url(#rim-g)" stroke="#bbbbbb" stroke-width="1.5"/>

        <!-- Percentage badge -->
        <rect x="69" y="27" width="62" height="22" rx="11" fill="rgba(0,0,0,0.62)"/>
        <text x="100" y="42" text-anchor="middle" fill="white"
              font-size="12" font-weight="700" font-family="system-ui,sans-serif">
          ${Math.round(percent)}%
        </text>
      </svg>
    </div>`;
}

export function renderEstresModule(container, config, { renderHome }) {
    let cupSize = state.estres?.cupSize || 'medium';
    let level = state.estres?.level ?? SIZES[cupSize] * 0.4;
    let activeTab = 'estresores';

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
        addHistory((sign > 0 ? '⬆ ' : '⬇ ') + label, signedPct);
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

        let statusClass, statusHTML;
        if (percent >= 90) {
            statusClass = 'estres-status-danger';
            statusHTML = '💥 ¡CUIDADO! El vaso está a punto de desbordarse. Aplica una estrategia ya.';
        } else if (percent >= 70) {
            statusClass = 'estres-status-warn';
            statusHTML = '⚠️ Vaso muy lleno. Aplica una estrategia de afrontamiento.';
        } else if (percent <= 20) {
            statusClass = 'estres-status-safe';
            statusHTML = '🧘 Nivel bajo. Tienes mucho margen.';
        } else {
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
                    ${buildCupSVG(percent)}
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
                    <div style="padding: 1rem; max-height: 260px; overflow-y: auto;">
                        ${activeTab === 'estresores' ? buildChipPanel(STRESSORS, 1) : buildChipPanel(STRATEGIES, -1)}
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

        document.getElementById('btn-estres-back')?.addEventListener('click', renderHome);

        container.querySelectorAll('.estres-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prevPct = getPercent();
                cupSize = btn.dataset.size;
                level = (prevPct / 100) * getMax();
                persistState();
                renderInner();
            });
        });

        container.querySelectorAll('.estres-quick').forEach(btn => {
            btn.addEventListener('click', () => {
                const pct = parseInt(btn.dataset.delta);
                const delta = (pct / 100) * getMax();
                addHistory((pct > 0 ? '⬆ ' : '⬇ ') + btn.dataset.label, pct);
                changeLevel(delta, btn.dataset.label);
            });
        });

        document.getElementById('btn-estres-reset')?.addEventListener('click', () => {
            if (confirm('¿Vaciar el vaso y borrar el historial?')) {
                level = 0;
                state.estres = { cupSize, level, history: [] };
                saveState();
                renderInner();
            }
        });

        container.querySelectorAll('.estres-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                activeTab = btn.dataset.tab;
                renderInner();
            });
        });

        container.querySelectorAll('.estres-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                applyChip(btn.dataset.label, parseInt(btn.dataset.pct), parseInt(btn.dataset.sign));
            });
        });

        document.getElementById('btn-custom-apply')?.addEventListener('click', () => {
            const desc = document.getElementById('estres-custom-desc')?.value.trim()
                || (activeTab === 'estresores' ? 'Estresor personalizado' : 'Estrategia personalizada');
            const pct = parseInt(document.getElementById('estres-custom-pct')?.value || '10');
            const sign = activeTab === 'estresores' ? 1 : -1;
            applyChip(desc, pct, sign);
        });
    }

    renderInner();
}
