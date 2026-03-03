/**
 * ACT In-Session - Presente Module (Mindfulness / Grounding)
 */

import { state, saveState } from '../core/state.js';
import { renderModuleHeader, attachHeaderEvents } from '../ui/utils.js';

export function renderPresenteModule(container, module, { renderHome }) {
    let activeToolId = 'stop';

    const tools = [
        { id: 'stop', title: 'STOP', icon: 'octagon' },
        { id: 'sentidos', title: '5 Sentidos', icon: 'hand' },
        { id: 'cielo', title: 'Cielo y Clima', icon: 'cloud' }
    ];

    const render = () => {
        container.innerHTML = `
            <div class="module-view animate-slide-up">
                ${renderModuleHeader(module)}

                <div class="tool-selector glass-card" style="display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; overflow-x: auto; -webkit-overflow-scrolling: touch;">
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
            btn.addEventListener('click', () => {
                activeToolId = btn.getAttribute('data-id');
                render();
            });
        });

        const toolContainer = document.getElementById('tool-container');
        if (activeToolId === 'stop') {
            renderSTOPTool(toolContainer);
        } else if (activeToolId === 'sentidos') {
            render5SentidosTool(toolContainer);
        } else if (activeToolId === 'cielo') {
            renderCieloYClimaTool(toolContainer);
        }
    };

    render();
}

function renderSTOPTool(container) {
    const steps = [
        { id: 'S', title: 'S · Stop', text: 'Haz una pausa en lo que estás haciendo.' },
        { id: 'T', title: 'T · Take a breath', text: 'Nota tu respiración mientras inhalas y exhalas.' },
        { id: 'O', title: 'O · Observe', text: 'Observa qué está pasando en tu cuerpo y mente ahora.' },
        { id: 'P', title: 'P · Proceed', text: 'Elige cómo quieres continuar en este momento.' }
    ];
    let currentStep = 0;

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="stop-steps-container" style="display: flex; flex-direction: column; gap: 1rem;">
                    ${steps.map((s, i) => `
                        <div class="glass" style="padding: 1.25rem; border-radius: var(--radius-md); opacity: ${i === currentStep ? '1' : '0.5'}; border-left: 4px solid ${i === currentStep ? 'var(--color-primary)' : 'transparent'};">
                            <h4>${s.title}</h4>
                            <p>${s.text}</p>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 2rem; display: flex; justify-content: center; gap: 1rem;">
                    <button class="btn-ghost" id="btn-prev-stop" ${currentStep === 0 ? 'disabled' : ''}>Anterior</button>
                    <button class="btn-primary" id="btn-next-stop">${currentStep === steps.length - 1 ? 'Reiniciar' : 'Siguiente'}</button>
                </div>
            </div>
        `;

        document.getElementById('btn-next-stop').addEventListener('click', () => {
            currentStep = (currentStep + 1) % steps.length;
            internalRender();
        });
        document.getElementById('btn-prev-stop')?.addEventListener('click', () => {
            if (currentStep > 0) currentStep--;
            internalRender();
        });
    };
    internalRender();
}

function render5SentidosTool(container) {
    const senses = [
        { count: 5, item: 'cosas que puedes ver', color: '#f59e0b' },
        { count: 4, item: 'cosas que puedes tocar', color: '#10b981' },
        { count: 3, item: 'sonidos que puedes oír', color: '#3b82f6' },
        { count: 2, item: 'olores que puedes notar', color: '#8b5cf6' },
        { count: 1, item: 'sabor o sensación en la boca', color: '#ef4444' }
    ];
    let currentSense = 0;

    const internalRender = () => {
        const s = senses[currentSense];
        container.innerHTML = `
            <div class="tool-content" style="text-align: center;">
                <div class="sense-display glass" style="padding: 3rem 2rem; border-radius: var(--radius-lg); border: 2px solid ${s.color};">
                    <div style="font-size: 4rem; color: ${s.color};">${s.count}</div>
                    <div style="font-size: 1.25rem;">${s.item}</div>
                </div>
                <div style="margin-top: 2.5rem; display: flex; justify-content: center; gap: 1rem;">
                    <button class="btn-ghost" id="btn-prev-5" ${currentSense === 0 ? 'disabled' : ''}>Anterior</button>
                    <button class="btn-primary" id="btn-next-5">${currentSense === senses.length - 1 ? 'Finalizar' : 'Siguiente'}</button>
                </div>
            </div>
        `;
        document.getElementById('btn-next-5').addEventListener('click', () => {
            currentSense = (currentSense + 1) % senses.length;
            internalRender();
        });
        document.getElementById('btn-prev-5')?.addEventListener('click', () => {
            if (currentSense > 0) currentSense--;
            internalRender();
        });
    };
    internalRender();
}

/* ── Sky / Weather tool ─────────────────────────────────── */
// Module-level timer so it persists across cloud add/delete re-renders
// and can be cleaned up when the user leaves the tool.
let _skyTimer   = null;
let _skySimTime = null; // simulated hour (0–24); null = not yet started

/**
 * Sky config for a given simulated hour t ∈ [0, 24).
 * Seven phases: noche, amanecer, mañana, mediodía, tarde, atardecer, anochecer.
 */
function getSkyConfig(t) {
    if (t < 5.5)  return { gradient: 'linear-gradient(to bottom, #020818 0%, #071428 55%, #0d1f3a 100%)', period: 'noche',     showStars: true,  showMoon: true,  showSun: false, cloudColor: 'rgba(180,200,255,0.13)', textLight: true  };
    if (t < 7)    return { gradient: 'linear-gradient(to bottom, #0d1f3a 0%, #5c3060 30%, #e8724a 65%, #f9b44b 100%)',        period: 'amanecer', showStars: false, showMoon: false, showSun: true,  cloudColor: 'rgba(255,180,120,0.32)', textLight: true  };
    if (t < 11)   return { gradient: 'linear-gradient(to bottom, #1e90ff 0%, #87ceeb 55%, #dff0fa 100%)',                     period: 'mañana',   showStars: false, showMoon: false, showSun: true,  cloudColor: 'rgba(255,255,255,0.60)', textLight: false };
    if (t < 14)   return { gradient: 'linear-gradient(to bottom, #1565c0 0%, #42a5f5 50%, #90caf9 100%)',                     period: 'mediodía', showStars: false, showMoon: false, showSun: true,  cloudColor: 'rgba(255,255,255,0.65)', textLight: false };
    if (t < 17)   return { gradient: 'linear-gradient(to bottom, #2979b8 0%, #64b5f6 55%, #b3d9f7 100%)',                     period: 'tarde',    showStars: false, showMoon: false, showSun: true,  cloudColor: 'rgba(255,255,255,0.60)', textLight: false };
    if (t < 19.5) return { gradient: 'linear-gradient(to bottom, #1a2560 0%, #7b3fa0 28%, #e05c2a 58%, #f5a623 100%)',        period: 'atardecer',showStars: false, showMoon: false, showSun: true,  cloudColor: 'rgba(255,160,80,0.38)',  textLight: true  };
    if (t < 21.5) return { gradient: 'linear-gradient(to bottom, #080c24 0%, #1a2055 45%, #2d3a7a 100%)',                     period: 'anochecer',showStars: true,  showMoon: true,  showSun: false, cloudColor: 'rgba(150,165,255,0.15)', textLight: true  };
    return               { gradient: 'linear-gradient(to bottom, #020818 0%, #071428 55%, #0d1f3a 100%)',                     period: 'noche',    showStars: true,  showMoon: true,  showSun: false, cloudColor: 'rgba(180,200,255,0.13)', textLight: true  };
}

/** Sun arc: right-bottom at dawn → top-centre at noon → left-bottom at dusk. */
function getSunPosition(t) {
    const progress = Math.max(0, Math.min(1, (t - 6) / 13.5));
    return {
        x: Math.round(88 - progress * 76),
        y: Math.round(88 - Math.sin(Math.PI * progress) * 76)
    };
}

/** 28 twinkling star divs with randomised CSS timing. */
function generateStars(count) {
    return Array.from({ length: count }, () => {
        const x  = (Math.random() * 96 + 1).toFixed(1);
        const y  = (Math.random() * 82 + 1).toFixed(1);
        const sz = (0.8 + Math.random() * 2.2).toFixed(1);
        const op = (0.35 + Math.random() * 0.65).toFixed(2);
        const d  = (2 + Math.random() * 3).toFixed(1);
        const dl = (Math.random() * 5).toFixed(1);
        return `<div class="sky-star" style="left:${x}%;top:${y}%;width:${sz}px;height:${sz}px;opacity:${op};--twinkle-dur:${d}s;--twinkle-delay:${dl}s;"></div>`;
    }).join('');
}

/** 4-bird flock for daytime; each bird has independent timing. */
function generateBirds() {
    const wing = `<svg viewBox="0 0 20 8" width="15" height="7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M0 4 Q5 0 10 4 Q15 0 20 4"/></svg>`;
    return [
        { top: 17, dur: 19, delay:  0 },
        { top: 23, dur: 23, delay:  8 },
        { top: 15, dur: 17, delay: 14 },
        { top: 20, dur: 21, delay: 27 },
    ].map(b => `<div class="sky-bird" style="top:${b.top}%;animation-duration:${b.dur}s;animation-delay:-${b.delay}s;">${wing}</div>`).join('');
}

/** One slow airplane crossing at high altitude. */
function generateAirplane() {
    return `<div class="sky-plane" style="top:11%;animation-delay:-8s;">✈</div>`;
}

function renderCieloYClimaTool(container) {
    // Clear any running timer from a previous visit to this tool
    if (_skyTimer) { clearInterval(_skyTimer); _skyTimer = null; }

    // Initialise simulated time only once per page load; then let it run
    if (_skySimTime === null) {
        const now = new Date();
        _skySimTime = now.getHours() + now.getMinutes() / 60;
    }

    const PERIOD_COLORS = {
        noche: '#8090c0', amanecer: '#f9a870', mañana: '#1a6ea8',
        mediodía: '#0d5096', tarde: '#1a5f9e', atardecer: '#e07030', anochecer: '#5060a0'
    };
    const DAY_PERIODS = new Set(['amanecer', 'mañana', 'mediodía', 'tarde', 'atardecer']);

    // Full render (called once, and again only when cloud list changes)
    const internalRender = () => {
        const sky    = getSkyConfig(_skySimTime);
        const sunPos = sky.showSun ? getSunPosition(_skySimTime) : { x: 88, y: 92 };
        const clouds = state.persistence.weather || [];
        const tc     = sky.textLight ? 'rgba(255,255,255,0.92)' : 'rgba(20,30,60,0.85)';
        const pc     = PERIOD_COLORS[sky.period] || '#fff';
        const isDay  = DAY_PERIODS.has(sky.period);

        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom:1rem;text-align:center;">
                    <p class="clinical-note">La metáfora del cielo no es literal: úsala para notar eventos internos y traducirlos a decisiones concretas en contexto.</p>
                </div>

                <div id="sky-canvas" style="height:340px;border-radius:var(--radius-lg);position:relative;overflow:hidden;background:${sky.gradient};transition:background 4s ease;box-shadow:0 8px 32px rgba(0,0,0,0.35);">

                    <!-- Stars layer -->
                    <div id="sky-stars" style="position:absolute;inset:0;pointer-events:none;transition:opacity 4s ease;opacity:${sky.showStars ? 1 : 0};">
                        ${generateStars(28)}
                    </div>

                    <!-- Sun (always in DOM; opacity + position transition) -->
                    <div class="sky-sun" style="
                        position:absolute;left:${sunPos.x}%;top:${sunPos.y}%;
                        transform:translate(-50%,-50%);width:54px;height:54px;border-radius:50%;
                        background:radial-gradient(circle, #fff9c4 0%, #ffe066 35%, #ffa500 70%, rgba(255,120,0,0) 100%);
                        box-shadow:0 0 28px 10px rgba(255,200,0,0.5),0 0 60px 25px rgba(255,150,0,0.2);
                        transition:opacity 4s ease,left 5s ease,top 5s ease;
                        opacity:${sky.showSun ? 1 : 0};pointer-events:none;">
                    </div>

                    <!-- Moon (always in DOM) -->
                    <div class="sky-moon" style="
                        position:absolute;right:18%;top:20%;transform:translate(50%,-50%);
                        width:46px;height:46px;border-radius:50%;
                        background:radial-gradient(circle at 38% 38%, #f8f4d8 0%, #d8d09a 55%, #b8b080 100%);
                        box-shadow:0 0 18px 5px rgba(210,220,160,0.32);
                        transition:opacity 4s ease;opacity:${sky.showMoon ? 1 : 0};pointer-events:none;">
                        <div style="position:absolute;top:22%;left:24%;width:9px;height:9px;border-radius:50%;background:rgba(0,0,0,0.09);"></div>
                        <div style="position:absolute;top:54%;left:58%;width:6px;height:6px;border-radius:50%;background:rgba(0,0,0,0.07);"></div>
                        <div style="position:absolute;top:32%;left:60%;width:4px;height:4px;border-radius:50%;background:rgba(0,0,0,0.06);"></div>
                    </div>

                    <!-- Birds + airplane (daytime only) -->
                    <div id="sky-life" style="transition:opacity 4s ease;opacity:${isDay ? 1 : 0};pointer-events:none;">
                        ${generateBirds()}
                        ${generateAirplane()}
                    </div>

                    <!-- Thought clouds -->
                    <div id="clouds-container">
                        ${clouds.map((item, i) => `
                            <div class="sky-cloud" data-index="${i}"
                                 style="position:absolute;left:${item.x}%;top:${item.y}%;cursor:pointer;">
                                <div class="sky-cloud-inner" style="
                                    background:${sky.cloudColor};
                                    backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
                                    border:1px solid rgba(255,255,255,0.28);border-radius:18px;
                                    padding:0.45rem 0.85rem;font-size:0.8rem;font-weight:500;
                                    color:${tc};box-shadow:0 4px 14px rgba(0,0,0,0.12);
                                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:128px;">
                                    ${item.text}
                                </div>
                                <button class="sky-cloud-del" title="Eliminar" aria-label="Eliminar nube">×</button>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Period label -->
                    <div class="sky-period-label" style="position:absolute;bottom:10px;right:14px;font-size:0.7rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${pc};opacity:0.85;transition:color 4s ease;pointer-events:none;">${sky.period}</div>
                </div>

                <div style="margin-top:1.25rem;display:flex;gap:0.5rem;align-items:center;">
                    <input type="text" id="weather-input" class="input-field" placeholder="Escribe un pensamiento o nube…" style="flex:1;">
                    <button class="btn-ghost" id="btn-add-cloud" style="min-height:44px;padding:0 1rem;font-size:0.9rem;flex-shrink:0;" aria-label="Agregar nube">+</button>
                </div>
                ${clouds.length > 0 ? '<p style="font-size:0.73rem;color:var(--color-text-secondary);margin-top:0.4rem;text-align:center;">Pulsa × en una nube para eliminarla</p>' : ''}

                <div class="glass" style="margin-top:1.25rem;padding:1.25rem;border-radius:var(--radius-md);">
                    <h4 style="margin-bottom:0.75rem;font-size:0.9rem;opacity:0.8;">Aterrizaje clínico rápido</h4>
                    <div style="display:grid;gap:0.5rem;">
                        <input type="text" id="cielo-contexto"     class="input-field" placeholder="¿Dónde aparece esto en tu día a día?"    value="${state.persistence.grounding?.cielo?.contexto     || ''}">
                        <input type="text" id="cielo-aprendizaje"  class="input-field" placeholder="¿Qué cambió al observar sin literalizar?" value="${state.persistence.grounding?.cielo?.aprendizaje || ''}">
                        <input type="text" id="cielo-accion"       class="input-field" placeholder="Siguiente acción breve alineada"          value="${state.persistence.grounding?.cielo?.accion       || ''}">
                    </div>
                </div>
            </div>
        `;

        // Slow, organic per-cloud drift (each unique speed + direction)
        clouds.forEach((_, i) => {
            const el = document.querySelector(`.sky-cloud[data-index="${i}"]`);
            if (el && typeof anime !== 'undefined') {
                anime({
                    targets: el,
                    translateX: [0, (Math.random() - 0.5) * 22],
                    translateY: [0, (Math.random() - 0.5) * 10],
                    duration: 16000 + Math.random() * 12000,
                    direction: 'alternate',
                    loop: true,
                    easing: 'easeInOutSine'
                });
            }
        });

        // Sun glow pulse via Anime.js
        if (sky.showSun && typeof anime !== 'undefined') {
            anime({
                targets: '.sky-sun',
                boxShadow: [
                    '0 0 28px 10px rgba(255,200,0,0.5), 0 0 60px 25px rgba(255,150,0,0.2)',
                    '0 0 42px 16px rgba(255,220,0,0.7), 0 0 85px 40px rgba(255,170,0,0.35)'
                ],
                duration: 4000, direction: 'alternate', loop: true, easing: 'easeInOutSine'
            });
        }

        // Delete cloud – bound to the × button only
        document.querySelectorAll('.sky-cloud-del').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const idx = parseInt(btn.closest('.sky-cloud').dataset.index);
                state.persistence.weather.splice(idx, 1);
                saveState();
                internalRender();
            });
        });

        // Grounding inputs
        ['contexto', 'aprendizaje', 'accion'].forEach(key => {
            document.getElementById(`cielo-${key}`)?.addEventListener('input', e => {
                state.persistence.grounding ??= { hojas: { contexto: '', aprendizaje: '', accion: '' }, cielo: { contexto: '', aprendizaje: '', accion: '' } };
                state.persistence.grounding.cielo[key] = e.target.value;
                saveState();
            });
        });

        // Add cloud
        const addCloud = () => {
            const input = document.getElementById('weather-input');
            const text  = input?.value.trim();
            if (text) {
                state.persistence.weather.push({ text, x: 8 + Math.random() * 72, y: 6 + Math.random() * 68 });
                if (input) input.value = '';
                saveState();
                internalRender();
            }
        };
        document.getElementById('weather-input').addEventListener('keypress', e => { if (e.key === 'Enter') addCloud(); });
        document.getElementById('btn-add-cloud').addEventListener('click', addCloud);
    };

    // Sky-only update: updates gradient, celestial elements and cloud tints
    // without touching the clouds-container (preserves Anime.js animations).
    const updateSkyVisuals = () => {
        const canvas = document.getElementById('sky-canvas');
        if (!canvas) { clearInterval(_skyTimer); _skyTimer = null; return; }

        const sky    = getSkyConfig(_skySimTime);
        const sunPos = sky.showSun ? getSunPosition(_skySimTime) : null;
        const isDay  = DAY_PERIODS.has(sky.period);
        const tc     = sky.textLight ? 'rgba(255,255,255,0.92)' : 'rgba(20,30,60,0.85)';
        const pc     = PERIOD_COLORS[sky.period] || '#fff';

        canvas.style.background = sky.gradient;

        const starsEl = document.getElementById('sky-stars');
        if (starsEl) starsEl.style.opacity = sky.showStars ? '1' : '0';

        const sunEl = canvas.querySelector('.sky-sun');
        if (sunEl) {
            sunEl.style.opacity = sky.showSun ? '1' : '0';
            if (sky.showSun && sunPos) {
                sunEl.style.left = sunPos.x + '%';
                sunEl.style.top  = sunPos.y + '%';
            }
        }

        const moonEl = canvas.querySelector('.sky-moon');
        if (moonEl) moonEl.style.opacity = sky.showMoon ? '1' : '0';

        const lifeEl = document.getElementById('sky-life');
        if (lifeEl) lifeEl.style.opacity = isDay ? '1' : '0';

        const periodEl = canvas.querySelector('.sky-period-label');
        if (periodEl) { periodEl.textContent = sky.period; periodEl.style.color = pc; }

        canvas.querySelectorAll('.sky-cloud-inner').forEach(el => {
            el.style.background = sky.cloudColor;
            el.style.color = tc;
        });
    };

    internalRender();

    // Advance 20 simulated minutes every 6 real seconds → full day cycle ≈ 7 min
    _skyTimer = setInterval(() => {
        _skySimTime = (_skySimTime + 0.333) % 24;
        updateSkyVisuals();
    }, 6000);
}
