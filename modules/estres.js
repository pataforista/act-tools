/**
 * ACT In-Session - Vaso de Estrés Module
 *
 * ACT-consistent redesign (replaces the UNSW "empty the bucket" coping model).
 * The cup is NOT something to empty: naming the load is *contact*, not avoidance.
 * Responses to the load are sorted by workability — acercan a lo que importa vs
 * alejan (evitación) — and NEITHER empties the cup. The insight the patient reaches
 * by doing, not by being told: se puede llevar el vaso lleno y aun así moverse
 * hacia lo que importa.
 */

import { state, saveState } from '../core/state.js';
import { renderGuideBadge, attachGuideBadgeEvents, showToast } from '../ui/utils.js';
import { escapeHTML as esc } from '../core/security.js';

// A bigger cup = more capacity/willingness → the same load fills it less.
// This overturns the old agenda: the relationship changes, not the level.
const CAPACITY = { small: 1.3, medium: 1.0, large: 0.75 };

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

// Paper cup SVG. Level is shown by liquid height with a single neutral hue — no
// green="safe" / red="danger" valence, which would smuggle back a control agenda.
function buildCupSVG(percent) {
    const TOP_Y = 22, BTM_Y = 264, CUP_H = BTM_Y - TOP_Y;
    const liqTopY = TOP_Y + CUP_H * (1 - percent / 100);
    const liqH = CUP_H * (percent / 100);
    const liqTop = '#38bdf8', liqBot = '#0369a1';

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
          <path d="M-5,18 C45,-6 130,8 210,30 C222,85 200,115 162,122 C108,142 32,120 -5,96 Z"
                fill="#00b4d8"/>
          <path d="M32,114 C88,88 162,95 208,110 C212,142 192,158 156,150 C98,160 28,150 32,114 Z"
                fill="#48cae4" opacity="0.65"/>
          <path d="M25,30 C82,10 162,24 204,42 L204,52 C162,32 82,20 20,44 Z" fill="white" opacity="0.28"/>
          <path d="M-5,62 C42,46 114,52 194,66 L194,76 C114,60 42,56 -5,72 Z" fill="white" opacity="0.18"/>
          <path d="M-5,88 C52,65 148,78 212,94 C214,120 206,130 192,126 C132,120 38,122 -5,120 Z"
                fill="#9b5de5" opacity="0.82"/>
          <path d="M5,98 C58,80 152,90 200,104 C200,114 196,118 188,115 C132,110 50,110 5,117 Z"
                fill="#4c1d95" opacity="0.5"/>
          <circle cx="145" cy="135" r="18" fill="#00b4d8" opacity="0.35"/>
          <circle cx="160" cy="148" r="10" fill="#48cae4" opacity="0.3"/>
          <circle cx="55" cy="130" r="8"  fill="#00b4d8" opacity="0.25"/>
        </g>

        <!-- Cup side sheen (right edge highlight) -->
        <path d="M175,${TOP_Y + 4} L161,${BTM_Y - 4}" stroke="rgba(255,255,255,0.5)" stroke-width="3" stroke-linecap="round"/>

        <!-- Cup outline -->
        <path d="M19,${TOP_Y} L181,${TOP_Y} L161,${BTM_Y} L39,${BTM_Y} Z"
              fill="none" stroke="rgba(180,180,180,0.6)" stroke-width="2"/>

        <!-- Rim ellipse -->
        <ellipse cx="100" cy="${TOP_Y}" rx="82" ry="9" fill="url(#rim-g)" stroke="#bbbbbb" stroke-width="1.5"/>

      </svg>
    </div>`;
}

export function renderEstresModule(container, config, { renderHome }) {
    state.persistence.estres ??= { cupSize: 'medium', load: [], responses: [] };
    const est = state.persistence.estres;
    if (!Array.isArray(est.load)) est.load = [];
    if (!Array.isArray(est.responses)) est.responses = [];
    if (!CAPACITY[est.cupSize]) est.cupSize = 'medium';

    let activeTab = 'carga';
    let responseDraft = '';
    // Animate the entrance only once; re-rendering on every interaction would
    // otherwise restart the fade-in and make the whole module flicker.
    let firstRender = true;
    let scrollPos = 0;

    const factor = () => CAPACITY[est.cupSize];
    const rawLoad = () => est.load.reduce((a, s) => a + (s.pct || 0), 0);
    const percent = () => Math.min(100, Math.max(0, rawLoad() * factor()));

    const guide = renderGuideBadge({
        trigger: 'El paciente describe acumulación de estrés o intenta "vaciar" su malestar. Útil para desactivar la agenda de control y separar la carga (lo que está) de la respuesta (lo que hace con ella).',
        intro: 'Este vaso muestra lo que estás llevando ahora. No vamos a vaciarlo luchando. Vamos a mirar qué hacés con la carga, y si eso te acerca o te aleja de lo que importa.',
        questions: [
            '¿Qué estás llevando ahora mismo?',
            'Cuando aparece la presión, ¿qué hacés? ¿Te acerca o te aleja?',
            '¿Podés llevar el vaso lleno y aun así moverte hacia lo que importa?'
        ],
        abort: 'El paciente usa el ejercicio para buscar cómo bajar el nivel. Nombrar la agenda de control y volver a la disposición.'
    });

    function addLoad(label, pct) {
        est.load.push({ label, pct });
        saveState();
        renderInner();
    }

    function buildChipPanel(groups) {
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
                            style="padding: 0.35rem 0.7rem; border-radius: 20px; border: 1px solid rgba(56,189,248,0.4); background: rgba(56,189,248,0.1); color: #7dd3fc; font-size: 0.8rem; cursor: pointer; transition: var(--transition-base); touch-action: manipulation; white-space: nowrap;">
                            ${item.label}
                            <span style="opacity: 0.65; font-size: 0.7rem; margin-left: 3px;">+${item.pct}%</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    function renderInner() {
        const scrollArea = container.querySelector('#estres-scroll-area');
        if (scrollArea) scrollPos = scrollArea.scrollTop;

        const pct = percent();
        const toward = est.responses.filter(r => r.dir === 'toward');
        const away = est.responses.filter(r => r.dir === 'away');

        let statusText;
        if (pct >= 100) statusText = 'El vaso rebosa. Aun así, podés elegir hacia dónde te movés.';
        else if (pct >= 85) statusText = 'El vaso está muy lleno. Nota cómo es llevarlo ahora.';
        else if (pct >= 50) statusText = 'Estás llevando una carga. Nota su peso.';
        else if (pct <= 15) statusText = 'El vaso lleva poca carga en este momento.';
        else statusText = 'Hay algo de carga en el vaso. Solo nótala.';

        container.innerHTML = `
            <div class="module-view${firstRender ? ' animate-scale-in' : ''}" style="display: flex; flex-direction: column; gap: 1.25rem;">

                <header class="tool-header" style="border-bottom: 2px solid #38bdf8; padding-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 1.5rem;">🥤</span>
                        <div>
                            <h2 style="font-size: 1.1rem; color: #38bdf8;">Vaso de Estrés</h2>
                            <p style="font-size: 0.75rem; color: var(--color-text-secondary);">Lo que llevás ahora</p>
                        </div>
                    </div>
                    <button class="btn-ghost" id="btn-estres-back">← Inicio</button>
                </header>

                ${guide}

                <!-- Capacidad / espacio -->
                <div>
                    <p style="font-size: 0.72rem; color: var(--color-text-secondary); margin: 0 0 0.4rem;">Espacio que sentís para llevar la carga hoy</p>
                    <div style="display: flex; gap: 0.5rem; width: 100%;">
                        ${[['small', 'Poco', '#38bdf8'], ['medium', 'Medio', '#38bdf8'], ['large', 'Amplio', '#38bdf8']].map(([size, label, col]) => `
                            <button class="estres-size-btn ${est.cupSize === size ? 'active' : ''}"
                                data-size="${size}"
                                style="flex: 1; padding: 0.6rem 0.25rem; border-radius: var(--radius-sm); border: 2px solid ${est.cupSize === size ? col : 'var(--glass-border)'}; background: ${est.cupSize === size ? col + '22' : 'transparent'}; color: ${est.cupSize === size ? col : 'var(--color-text-secondary)'}; font-weight: 600; font-size: 0.78rem; cursor: pointer; transition: var(--transition-base);">
                                ${label}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Vaso visual + estado -->
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
                    ${buildCupSVG(pct)}
                    <div style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-md); text-align: center; font-size: 0.9rem; color: var(--color-text-secondary); background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2);">
                        ${statusText}
                    </div>
                </div>

                <!-- Vida en movimiento (crece con las respuestas que acercan) -->
                <div class="glass-card" style="padding: 0.9rem 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                        <h3 style="font-size: 0.82rem; color: #10b981; margin: 0;">🌱 Tu vida en movimiento</h3>
                        <span style="font-size: 0.7rem; color: var(--color-text-secondary);">${toward.length} paso${toward.length === 1 ? '' : 's'}</span>
                    </div>
                    ${toward.length
                ? `<div style="display: flex; flex-wrap: wrap; gap: 0.3rem; align-items: center; font-size: 1rem;">${toward.map(() => '👣').join('<span style="opacity:0.4;">·</span>')}</div>
                       <p style="font-size: 0.72rem; color: var(--color-text-secondary); margin: 0.5rem 0 0;">El vaso sigue lleno. Tu vida se mueve igual.</p>`
                : `<p style="font-size: 0.75rem; color: var(--color-text-secondary); margin: 0; opacity: 0.7;">Todavía no marcaste un movimiento hacia lo que importa.</p>`
            }
                </div>

                <!-- Tabs: Carga / Respuestas -->
                <div class="glass-card" style="padding: 0; overflow: hidden;">
                    <div class="fab-safe" style="display: flex; border-bottom: 1px solid var(--glass-border);">
                        <button class="estres-tab ${activeTab === 'carga' ? 'active' : ''}" data-tab="carga"
                            style="flex: 1; padding: 0.75rem; border: none; background: ${activeTab === 'carga' ? 'rgba(56,189,248,0.15)' : 'transparent'}; color: ${activeTab === 'carga' ? '#7dd3fc' : 'var(--color-text-secondary)'}; font-weight: 700; font-size: 0.85rem; cursor: pointer; border-bottom: 2px solid ${activeTab === 'carga' ? '#7dd3fc' : 'transparent'}; transition: var(--transition-base);">
                            💧 La carga
                        </button>
                        <button class="estres-tab ${activeTab === 'respuestas' ? 'active' : ''}" data-tab="respuestas"
                            style="flex: 1; padding: 0.75rem; border: none; background: ${activeTab === 'respuestas' ? 'rgba(16,185,129,0.15)' : 'transparent'}; color: ${activeTab === 'respuestas' ? '#34d399' : 'var(--color-text-secondary)'}; font-weight: 700; font-size: 0.85rem; cursor: pointer; border-bottom: 2px solid ${activeTab === 'respuestas' ? '#34d399' : 'transparent'}; transition: var(--transition-base);">
                            🧭 Tus respuestas
                        </button>
                    </div>
                    <div id="estres-scroll-area" style="padding: 1rem; max-height: 300px; overflow-y: auto;">
                        ${activeTab === 'carga' ? renderCargaTab() : renderRespuestasTab(toward, away)}
                    </div>
                </div>

                <button id="btn-estres-reset"
                    style="background: rgba(255,255,255,0.07); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); color: var(--color-text-secondary); font-weight: 600; font-size: 0.8rem; cursor: pointer;">
                    Reiniciar ejercicio
                </button>
            </div>
        `;

        firstRender = false;
        if (window.lucide) lucide.createIcons();
        attachGuideBadgeEvents();
        attachEvents();

        const newScrollArea = container.querySelector('#estres-scroll-area');
        if (newScrollArea) newScrollArea.scrollTop = scrollPos;
    }

    function renderCargaTab() {
        return `
            <p style="font-size: 0.78rem; color: var(--color-text-secondary); margin: 0 0 0.75rem;">Nombrá lo que estás llevando. Nombrarlo es hacer contacto, no cargar más.</p>
            ${buildChipPanel(STRESSORS)}
            <div style="margin-top: 0.5rem; display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center;">
                <input id="estres-custom-desc" type="text" placeholder="Otra cosa que llevás…"
                    style="flex: 2; min-width: 120px; padding: 0.45rem 0.75rem; border-radius: 20px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: var(--color-text-primary); font-size: 0.8rem;">
                <select id="estres-custom-pct" style="padding: 0.45rem 0.5rem; border-radius: 20px; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: var(--color-text-primary); font-size: 0.8rem;">
                    <option value="5">5%</option>
                    <option value="10" selected>10%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                </select>
                <button id="btn-custom-load" style="padding: 0.45rem 0.85rem; border-radius: 20px; border: none; background: #0ea5e9; color: white; font-weight: 700; font-size: 0.8rem; cursor: pointer;">Añadir</button>
            </div>

            <div style="margin-top: 1rem;">
                <p style="font-size: 0.72rem; color: var(--color-text-secondary); margin: 0 0 0.4rem;">En el vaso ahora:</p>
                ${est.load.length === 0
                ? '<p style="font-size: 0.78rem; opacity: 0.5;">El vaso está vacío.</p>'
                : `<div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">${est.load.map((s, i) => `
                        <span style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.6rem; border-radius: 16px; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.3); font-size: 0.76rem;">
                            ${esc(s.label)} <span style="opacity: 0.6;">${s.pct}%</span>
                            <button class="item-remove-btn btn-remove-load" data-idx="${i}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.85rem; line-height: 1; padding: 0;">×</button>
                        </span>
                    `).join('')}</div>`
            }
            </div>
        `;
    }

    function renderRespuestasTab(toward, away) {
        const responseList = (arr, color, note) => arr.length
            ? arr.map((r) => {
                const globalIdx = est.responses.indexOf(r);
                return `
                    <div style="display: flex; align-items: center; gap: 0.4rem; background: ${color}14; border: 1px solid ${color}44; border-radius: var(--radius-sm); padding: 0.45rem 0.6rem; margin-bottom: 0.35rem;">
                        <div style="flex: 1;">
                            <p style="margin: 0; font-size: 0.8rem;">${esc(r.text)}</p>
                            <p style="margin: 0.1rem 0 0; font-size: 0.65rem; color: var(--color-text-secondary);">${note}</p>
                        </div>
                        <button class="item-remove-btn btn-remove-resp" data-idx="${globalIdx}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.9rem; line-height: 1;">×</button>
                    </div>`;
            }).join('')
            : '<p style="font-size: 0.75rem; opacity: 0.5; margin: 0 0 0.5rem;">—</p>';

        return `
            <p style="font-size: 0.78rem; color: var(--color-text-secondary); margin: 0 0 0.75rem;">Con el vaso así de lleno, cuando aparece la presión, ¿qué hacés? Clasificá cada respuesta. Ninguna vacía el vaso.</p>
            <input id="estres-resp-input" type="text" placeholder="Cuando aparece la presión, yo…" value="${esc(responseDraft).replace(/"/g, '&quot;')}"
                style="width: 100%; box-sizing: border-box; padding: 0.55rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--glass-border); background: rgba(255,255,255,0.05); color: var(--color-text-primary); font-size: 0.82rem; margin-bottom: 0.5rem;">
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                <button class="btn-classify" data-dir="away" style="flex: 1; padding: 0.55rem; border-radius: var(--radius-sm); border: 1px solid rgba(239,68,68,0.5); background: rgba(239,68,68,0.1); color: #f87171; font-weight: 600; font-size: 0.76rem; cursor: pointer;">↩ Me aleja (evitación)</button>
                <button class="btn-classify" data-dir="toward" style="flex: 1; padding: 0.55rem; border-radius: var(--radius-sm); border: 1px solid rgba(16,185,129,0.5); background: rgba(16,185,129,0.1); color: #34d399; font-weight: 600; font-size: 0.76rem; cursor: pointer;">→ Me acerca (a lo que importa)</button>
            </div>

            <p style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #f87171; margin: 0 0 0.4rem;">Me alejan</p>
            ${responseList(away, '#ef4444', 'alivio corto · el vaso sigue igual')}

            <p style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #34d399; margin: 0.75rem 0 0.4rem;">Me acercan</p>
            ${responseList(toward, '#10b981', 'acción valiosa · el vaso sigue lleno, tu vida se mueve')}
        `;
    }

    function attachEvents() {
        document.getElementById('btn-estres-back')?.addEventListener('click', renderHome);

        container.querySelectorAll('.estres-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                est.cupSize = btn.dataset.size;
                saveState();
                renderInner();
            });
        });

        container.querySelectorAll('.estres-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                activeTab = btn.dataset.tab;
                scrollPos = 0;
                renderInner();
            });
        });

        // Carga
        container.querySelectorAll('.estres-chip').forEach(btn => {
            btn.addEventListener('click', () => addLoad(btn.dataset.label, parseInt(btn.dataset.pct)));
        });
        const addCustomLoad = () => {
            const desc = document.getElementById('estres-custom-desc')?.value.trim() || 'Otra carga';
            const pct = parseInt(document.getElementById('estres-custom-pct')?.value || '10');
            addLoad(desc, pct);
        };
        document.getElementById('btn-custom-load')?.addEventListener('click', addCustomLoad);
        document.getElementById('estres-custom-desc')?.addEventListener('keydown', e => { if (e.key === 'Enter') addCustomLoad(); });
        container.querySelectorAll('.btn-remove-load').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                const [removed] = est.load.splice(idx, 1);
                saveState();
                renderInner();
                showToast(`Quitaste "${removed.label}"`, {
                    actionLabel: 'Deshacer',
                    onAction: () => {
                        est.load.splice(idx, 0, removed);
                        saveState();
                        renderInner();
                    }
                });
            });
        });

        // Respuestas
        const respInput = document.getElementById('estres-resp-input');
        respInput?.addEventListener('input', e => responseDraft = e.target.value);
        container.querySelectorAll('.btn-classify').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = (document.getElementById('estres-resp-input')?.value || '').trim();
                if (!text) return;
                est.responses.push({ text, dir: btn.dataset.dir });
                responseDraft = '';
                saveState();
                renderInner();
            });
        });
        container.querySelectorAll('.btn-remove-resp').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                const [removed] = est.responses.splice(idx, 1);
                saveState();
                renderInner();
                showToast('Respuesta quitada', {
                    actionLabel: 'Deshacer',
                    onAction: () => {
                        est.responses.splice(idx, 0, removed);
                        saveState();
                        renderInner();
                    }
                });
            });
        });

        document.getElementById('btn-estres-reset')?.addEventListener('click', () => {
            if (confirm('¿Reiniciar el ejercicio? Se borran la carga y las respuestas.')) {
                est.load = [];
                est.responses = [];
                responseDraft = '';
                activeTab = 'carga';
                scrollPos = 0;
                saveState();
                renderInner();
            }
        });
    }

    renderInner();
}
