/**
 * ACT In-Session - Abrirse Module (Defusion / Acceptance)
 */

import { state, saveState } from '../core/state.js';
import { radioAudio } from '../core/audio.js';
import { renderModuleHeader, attachHeaderEvents, renderGuideBadge, attachGuideBadgeEvents, attachEdgeFade, groundingField, showToast } from '../ui/utils.js';
import { animateDefusion } from '../core/animations.js';
import { escapeHTML as esc } from '../core/security.js';

export function renderAbrirseModule(container, module, { renderHome }) {
    let activeToolId = 'visualizador';

    const tools = [
        { id: 'visualizador', title: 'Visualizador', icon: 'brain' },
        { id: 'hojas', title: 'Hojas en Agua', icon: 'droplet' },
        { id: 'radio', title: 'Radio', icon: 'radio' },
        { id: 'lucha', title: 'Lucha', icon: 'zap' }
    ];

    const render = () => {
        container.innerHTML = `
            <div class="module-view animate-slide-up">
                ${renderModuleHeader(module)}

                <div class="tool-selector glass-card" style="display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    ${tools.map(t => `
                        <button class="btn-tool ${activeToolId === t.id ? 'active' : ''}" data-id="${t.id}" style="display: flex; align-items: center; gap: 0.5rem; flex: 0 0 auto; font-size: 0.85rem; padding: 0.5rem 1rem; border-radius: var(--radius-sm); white-space: nowrap;">
                            <i data-lucide="${t.icon}" style="width: 1rem; height: 1rem;"></i>
                            <span>${t.title.split(' ')[0]}</span>
                        </button>
                    `).join('')}
                </div>

                <div id="tool-container"></div>
            </div>
        `;

        attachHeaderEvents(renderHome, saveState);
        attachEdgeFade(container.querySelector('.tool-selector'));

        // Cleanup audio on exit
        const cleanup = () => radioAudio.stop();
        document.getElementById('btn-back')?.addEventListener('click', cleanup);
        document.getElementById('btn-close-module')?.addEventListener('click', cleanup);

        document.querySelectorAll('.btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                cleanup();
                activeToolId = btn.getAttribute('data-id');
                render();
            });
        });

        const toolContainer = document.getElementById('tool-container');
        if (activeToolId === 'visualizador') {
            renderVisualizadorPensamientosTool(toolContainer);
        } else if (activeToolId === 'hojas') {
            renderHojasAguaTool(toolContainer);
        } else if (activeToolId === 'radio') {
            renderRadioDoomGloomTool(toolContainer);
        } else if (activeToolId === 'lucha') {
            renderInterruptorLuchaTool(toolContainer);
        }
    };

    render();
}

// ─────────────────────────────────────────────────────────────────────────────
// VISUALIZADOR DE PENSAMIENTOS
// ─────────────────────────────────────────────────────────────────────────────

function renderVisualizadorPensamientosTool(container) {
    let selectedThoughtIndex = null;
    let selectedColor = '#ffffff';
    let selectedSize = '0.9rem';
    let selectedFont = "'Outfit', sans-serif";
    const availableFonts = [
        { id: "'Outfit', sans-serif", label: 'Outfit' },
        { id: "'Poppins', sans-serif", label: 'Poppins' },
        { id: "'Nunito', sans-serif", label: 'Nunito' },
        { id: "'Fira Sans', sans-serif", label: 'Fira Sans' },
        { id: "'Caveat', cursive", label: 'Caveat' },
        { id: "'Permanent Marker', cursive", label: 'Marker' },
        { id: "'Courier New', monospace", label: 'Mono' }
    ];

    const guide = renderGuideBadge({
        trigger: 'Rumiación activa o fusión con una narrativa ("soy un fracaso", "nada mejora"). El paciente habla desde sus pensamientos, no sobre ellos.',
        intro: 'Vamos a sacar esos pensamientos de tu cabeza y a verlos desde afuera, como objetos. No para eliminarlos, sino para observarlos.',
        questions: [
            '¿Qué notás al verlo escrito ahí afuera?',
            '¿El pensamiento dice algo sobre vos o simplemente ocurre?',
            '¿Podés observarlo sin que te lleve a hacer algo?'
        ],
        abort: 'El paciente empieza a usar la herramienta para "sacar" pensamientos o reporta que se siente peor. Detener y hablar directamente.'
    });

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                ${guide}

                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">Visualizador de Pensamientos</h3>
                    <p style="font-size: 0.8rem; color: var(--color-text-secondary);">Externaliza el pensamiento. No es para eliminarlo: es para verlo desde afuera.</p>
                </div>

                <div class="style-config glass" style="padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="color-picker" style="display: flex; gap: 0.5rem;">
                            ${['#ffffff', '#ef4444', '#3b82f6', '#f59e0b', '#10b981'].map(c => `
                                <div class="color-swatch ${selectedColor === c ? 'active' : ''}" data-color="${c}" style="width: 24px; height: 24px; border-radius: 50%; background: ${c}; cursor: pointer; border: 2px solid ${selectedColor === c ? 'white' : 'transparent'};"></div>
                            `).join('')}
                        </div>
                        <div class="size-picker" style="display: flex; gap: 0.25rem;">
                            ${['0.7rem', '0.9rem', '1.2rem'].map(s => `
                                <button class="btn-toggle ${selectedSize === s ? 'active' : ''}" data-size="${s}" style="font-size: 0.7rem; padding: 0.3rem 0.6rem; min-height: auto;">
                                    ${s === '0.7rem' ? 'P' : s === '0.9rem' ? 'M' : 'G'}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div id="thought-input-container" style="display: flex; gap: 0.5rem;">
                        <input type="text" id="thought-input" class="input-field" placeholder="Tengo el pensamiento de que..." style="flex: 1; font-size: 0.9rem; border-color: ${selectedColor}44;">
                        <button id="btn-add-thought" class="btn-primary" style="background: ${selectedColor};">+</button>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem;">
                        ${availableFonts.map(font => `
                            <button class="btn-toggle ${selectedFont === font.id ? 'active' : ''}" data-font="${font.id.replace(/"/g, '&quot;')}" style="font-size: 0.72rem; min-height: auto; padding: 0.35rem 0.5rem; font-family: ${font.id};">
                                ${font.label}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div id="thoughts-list" style="height: 400px; padding: 1.5rem; border: 2px dashed var(--glass-border); border-radius: var(--radius-lg); position: relative; background: rgba(0,0,0,0.1); overflow: hidden; perspective: 1000px;">
                    ${state.persistence.thoughts.length === 0 ? '<p style="color: var(--color-text-secondary); font-size: 0.8rem; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">Externaliza tus pensamientos aquí.</p>' : ''}
                    ${state.persistence.thoughts.map((t, i) => {
            const distortClass = t.mode ? `distort-${t.mode}` : '';
            const rotationStyle = t.rotateX ? `perspective(500px) rotateX(${t.rotateX}deg) rotateY(${t.rotateY || 0}deg)` : '';
            const spacingStyle = t.spacing ? `letter-spacing: ${t.spacing}px;` : '';
            const fontStyle = t.fontFamily ? `font-family: ${t.fontFamily};` : '';
            return `
                        <div class="thought-item glass animate-scale-in ${selectedThoughtIndex === i ? 'selected' : ''} ${distortClass}" 
                             data-index="${i}" 
                             style="position: absolute; left: ${t.x ?? (20 + (i % 3) * 30)}%; top: ${t.y ?? (20 + Math.floor(i / 3) * 20)}%; 
                                    padding: 0.75rem 1.25rem; border-radius: 20px; font-size: ${t.size || '0.9rem'}; color: ${t.color || 'white'}; 
                                    border: 2px solid ${selectedThoughtIndex === i ? 'var(--color-primary)' : (t.color || 'var(--glass-border)') + '22'}; 
                                    opacity: ${t.opacity ?? 1}; filter: blur(${t.blur ?? 0}px); cursor: pointer; user-select: none; 
                                    z-index: ${selectedThoughtIndex === i ? 100 : 10}; transition: border 0.3s, box-shadow 0.3s, transform 0.3s;
                                    transform: ${rotationStyle}; ${spacingStyle} ${fontStyle}">
                            ${esc(t.text || t)}
                        </div>
                    `;
        }).join('')}
                </div>

                <div class="glass" style="margin-top: 1rem; padding: 1rem; border-radius: var(--radius-md);">
                    <h4 style="margin-bottom: 0.25rem; font-size: 0.85rem;">Aterrizaje clínico</h4>
                    <p style="font-size: 0.7rem; color: var(--color-text-secondary); margin-bottom: 0.75rem;">Tres pasos para cerrar el ejercicio: dónde apareció, qué cambió, qué acción sigue.</p>
                    <div class="grounding-fields" style="display: grid; gap: 0.5rem;">
                        ${groundingField('visualizador-contexto', '¿Dónde te enganchaste con este pensamiento hoy?', esc(state.persistence.grounding?.visualizador?.contexto || ''))}
                        ${groundingField('visualizador-aprendizaje', '¿Qué cambió al verlo como pensamiento y no como hecho?', esc(state.persistence.grounding?.visualizador?.aprendizaje || ''))}
                        ${groundingField('visualizador-accion', 'Con este pensamiento presente, ¿qué acción útil podés hacer?', esc(state.persistence.grounding?.visualizador?.accion || ''))}
                    </div>
                </div>

                <div id="property-panel" class="glass" style="margin-top: 1rem; padding: 1.25rem; border-radius: var(--radius-md); display: ${selectedThoughtIndex !== null ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: 1rem; animation: slideUp 0.3s ease;">
                    <div style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                        <h4 style="font-size: 0.85rem; font-weight: bold; color: var(--color-primary);">Propiedades del Pensamiento</h4>
                        <button class="btn-ghost" id="btn-delete-thought" style="color: #ef4444; font-size: 0.75rem;">Eliminar ×</button>
                    </div>
                    
                    <div class="property-group">
                        <label>Distancia del pensamiento</label>
                        <input type="range" id="prop-blur" min="0" max="3" step="0.5" value="${state.persistence.thoughts[selectedThoughtIndex]?.blur || 0}" class="slider-act">
                    </div>
                    <div class="property-group">
                        <label>Peso percibido</label>
                        <input type="range" id="prop-opacity" min="0.45" max="1" step="0.05" value="${state.persistence.thoughts[selectedThoughtIndex]?.opacity || 1}" class="slider-act">
                    </div>
                    <div class="property-group">
                        <label>Espaciado (Stretching)</label>
                        <input type="range" id="prop-spacing" min="0" max="20" step="1" value="${state.persistence.thoughts[selectedThoughtIndex]?.spacing || 0}" class="slider-act">
                    </div>
                    <div class="property-group">
                        <label>Ángulo de observación</label>
                        <input type="range" id="prop-rotateX" min="-60" max="60" step="1" value="${state.persistence.thoughts[selectedThoughtIndex]?.rotateX || 0}" class="slider-act">
                    </div>
                    
                    <div style="grid-column: 1 / -1; display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                        ${['none', 'glitch', 'wavy', 'mirror'].map(m => `
                            <button class="btn-toggle flex-1 ${state.persistence.thoughts[selectedThoughtIndex]?.mode === m ? 'active' : ''}" data-mode="${m}" style="text-transform: capitalize; font-size: 0.7rem;">
                                ${m === 'none' ? 'Normal' : m}
                            </button>
                        `).join('')}
                    </div>

                    <div style="grid-column: 1 / -1; margin-top: 0.5rem; padding: 0.75rem; background: rgba(var(--color-primary-rgb, 99,102,241),0.08); border-radius: var(--radius-sm);">
                        <p style="font-size: 0.75rem; color: var(--color-text-secondary); font-style: italic;">
                            💭 ¿Notás que el pensamiento dice algo sobre vos, o simplemente ocurre?
                        </p>
                    </div>
                </div>
            </div>
        `;

        attachGuideBadgeEvents();
        document.getElementById('thought-input')?.focus();

        ['contexto', 'aprendizaje', 'accion'].forEach((key) => {
            const el = document.getElementById(`visualizador-${key}`);
            el?.addEventListener('input', (e) => {
                state.persistence.grounding ??= {
                    hojas: { contexto: '', aprendizaje: '', accion: '' },
                    cielo: { contexto: '', aprendizaje: '', accion: '' },
                    visualizador: { contexto: '', aprendizaje: '', accion: '' },
                    radio: { contexto: '', aprendizaje: '', accion: '' },
                    lucha: { contexto: '', aprendizaje: '', accion: '' }
                };
                state.persistence.grounding.visualizador ??= { contexto: '', aprendizaje: '', accion: '' };
                state.persistence.grounding.visualizador[key] = e.target.value;
                saveState();
            });
        });

        const board = document.getElementById('thoughts-list');
        board.addEventListener('click', (e) => {
            if (e.target === board) {
                selectedThoughtIndex = null;
                internalRender();
            }
        });

        document.querySelectorAll('.thought-item').forEach(el => {
            el.addEventListener('mousedown', (e) => {
                selectedThoughtIndex = parseInt(el.dataset.index);
                internalRender();
            });
        });

        const input = document.getElementById('thought-input');
        const btnAdd = document.getElementById('btn-add-thought');

        const addThought = () => {
            const val = input.value.trim();
            if (val) {
                state.persistence.thoughts.push({
                    text: val,
                    color: selectedColor,
                    size: selectedSize,
                    fontFamily: selectedFont,
                    blur: 0,
                    opacity: 1,
                    x: 10 + Math.random() * 60,
                    y: 10 + Math.random() * 60
                });
                saveState();
                internalRender();
            }
        };

        btnAdd?.addEventListener('click', addThought);
        input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') addThought(); });

        document.getElementById('btn-delete-thought')?.addEventListener('click', () => {
            const idx = selectedThoughtIndex;
            const [removed] = state.persistence.thoughts.splice(idx, 1);
            selectedThoughtIndex = null;
            saveState();
            internalRender();
            showToast('Pensamiento eliminado', {
                actionLabel: 'Deshacer',
                onAction: () => {
                    state.persistence.thoughts.splice(idx, 0, removed);
                    saveState();
                    internalRender();
                }
            });
        });

        document.getElementById('prop-blur')?.addEventListener('input', (e) => {
            const blur = parseFloat(e.target.value);
            state.persistence.thoughts[selectedThoughtIndex].blur = blur;
            saveState();
            const el = document.querySelector(`.thought-item[data-index="${selectedThoughtIndex}"]`);
            if (el) el.style.filter = `blur(${blur}px)`;
        });
        document.getElementById('prop-opacity')?.addEventListener('input', (e) => {
            const opacity = parseFloat(e.target.value);
            state.persistence.thoughts[selectedThoughtIndex].opacity = opacity;
            saveState();
            const el = document.querySelector(`.thought-item[data-index="${selectedThoughtIndex}"]`);
            if (el) el.style.opacity = opacity;
        });
        document.getElementById('prop-spacing')?.addEventListener('input', (e) => {
            const spacing = parseFloat(e.target.value);
            state.persistence.thoughts[selectedThoughtIndex].spacing = spacing;
            saveState();
            const el = document.querySelector(`.thought-item[data-index="${selectedThoughtIndex}"]`);
            if (el) el.style.letterSpacing = `${spacing}px`;
        });
        document.getElementById('prop-rotateX')?.addEventListener('input', (e) => {
            const rx = parseFloat(e.target.value);
            const ry = rx / 2;
            state.persistence.thoughts[selectedThoughtIndex].rotateX = rx;
            state.persistence.thoughts[selectedThoughtIndex].rotateY = ry;
            saveState();
            const el = document.querySelector(`.thought-item[data-index="${selectedThoughtIndex}"]`);
            if (el) el.style.transform = `perspective(500px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
        document.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.persistence.thoughts[selectedThoughtIndex].mode = btn.dataset.mode === 'none' ? null : btn.dataset.mode;
                saveState();
                internalRender();
            });
        });

        animateDefusion('.thought-item');

        document.querySelectorAll('.color-swatch').forEach(sw => {
            sw.addEventListener('click', () => { selectedColor = sw.dataset.color; internalRender(); });
        });
        document.querySelectorAll('.size-picker .btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => { selectedSize = btn.dataset.size; internalRender(); });
        });
        document.querySelectorAll('[data-font]').forEach(btn => {
            btn.addEventListener('click', () => { selectedFont = btn.dataset.font; internalRender(); });
        });
    };

    internalRender();
}

// ─────────────────────────────────────────────────────────────────────────────
// HOJAS EN AGUA
// ─────────────────────────────────────────────────────────────────────────────

// Each leaf gets its own emoji/color, crossing speed, bob rhythm and starting
// tilt — a stream where every leaf moved identically read as mechanical
// instead of like water. Two independent anime() calls per leaf (one for the
// horizontal drift, one for vertical bob + rotation) let each rhythm run on
// its own timer without the leaves ever falling into visible sync.
const LEAF_VARIANTS = [
    { emoji: '🍃', color: '#10b981' },
    { emoji: '🍂', color: '#f59e0b' },
    { emoji: '🍁', color: '#ef4444' },
    { emoji: '🌿', color: '#22c55e' }
];
const MAX_LEAVES_ON_SCREEN = 12; // caps DOM growth over a long session

function renderHojasAguaTool(container) {
    const guide = renderGuideBadge({
        trigger: 'El paciente se queda atrapado en un pensamiento repetitivo o discute con él. Útil cuando hay fusión activa y el paciente "cree" el pensamiento.',
        intro: 'Imagina que estás sentado junto a un arroyo. Cada vez que aparezca un pensamiento, lo ponemos en una hoja y lo dejamos flotar. No para que desaparezca, sino para verlo pasar.',
        questions: [
            '¿Qué notás al dejar que el pensamiento pase en lugar de agarrarlo?',
            '¿El pensamiento desapareció o simplemente siguió de largo?',
            '¿Qué pasó cuando intentaste empujarlo o retenerlo?'
        ],
        abort: 'El paciente empieza a agregar pensamientos repetidamente buscando que "desaparezcan". Señal de control encubierto: pausar y explorar verbalmente.'
    });

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                ${guide}

                <div class="stream-canvas glass" style="height: 300px; border-radius: var(--radius-lg); position: relative; overflow: hidden; background: linear-gradient(to right, #0ea5e955, #38bdf855); border: 2px solid #38bdf844;">
                    <div id="stream-flow" style="position: absolute; inset: 0; background: repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 80px); animation: moveStream 20s linear infinite;"></div>
                    <div id="leaves-container"></div>
                    <div style="position: absolute; bottom: 0.75rem; left: 0; right: 0; text-align: center;">
                        <p style="font-size: 0.7rem; color: rgba(255,255,255,0.5);">Los pensamientos pasan. Vos seguís aquí.</p>
                    </div>
                </div>

                <div style="margin-top: 1.25rem;">
                    <input type="text" id="leaf-input" class="input-field" placeholder="¿Qué pensamiento pones en la hoja? (Enter para lanzar)">
                </div>

                <div class="glass" style="margin-top: 1rem; padding: 1rem; border-radius: var(--radius-md);">
                    <h4 style="margin-bottom: 0.25rem; font-size: 0.85rem;">Aterrizaje clínico</h4>
                    <p style="font-size: 0.7rem; color: var(--color-text-secondary); margin-bottom: 0.75rem;">Tres pasos para cerrar el ejercicio: dónde apareció, qué cambió, qué acción sigue.</p>
                    <div class="grounding-fields" style="display: grid; gap: 0.5rem;">
                        ${groundingField('hojas-contexto', '¿En qué situación apareció este pensamiento?', esc(state.persistence.grounding?.hojas?.contexto || ''))}
                        ${groundingField('hojas-aprendizaje', '¿Qué notaste al observarlo en lugar de discutir con él?', esc(state.persistence.grounding?.hojas?.aprendizaje || ''))}
                        ${groundingField('hojas-accion', 'Aunque ese pensamiento esté ahí, ¿qué podés hacer?', esc(state.persistence.grounding?.hojas?.accion || ''))}
                    </div>
                </div>
            </div>
            <style>
                @keyframes moveStream {
                    from { background-position: 0 0; }
                    to { background-position: 113px 0; }
                }
            </style>
        `;

        attachGuideBadgeEvents();

        const input = document.getElementById('leaf-input');
        input.focus();

        ['contexto', 'aprendizaje', 'accion'].forEach((key) => {
            const el = document.getElementById(`hojas-${key}`);
            el?.addEventListener('input', (e) => {
                state.persistence.grounding ??= { hojas: { contexto: '', aprendizaje: '', accion: '' }, cielo: { contexto: '', aprendizaje: '', accion: '' } };
                state.persistence.grounding.hojas[key] = e.target.value;
                saveState();
            });
        });

        const leavesContainer = document.getElementById('leaves-container');
        const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        function launchLeaf(text) {
            while (leavesContainer.children.length >= MAX_LEAVES_ON_SCREEN) {
                leavesContainer.firstElementChild?.remove();
            }

            const variant = LEAF_VARIANTS[Math.floor(Math.random() * LEAF_VARIANTS.length)];
            const y = 12 + Math.random() * 72;
            const scale = 0.85 + Math.random() * 0.3;
            const startRotate = Math.random() * 360;

            const leafEl = document.createElement('div');
            leafEl.className = 'leaf-item';
            leafEl.style.cssText = `position: absolute; left: -150px; top: ${y}%; padding: 0.5rem 1rem; background: ${variant.color}22; border: 1px solid ${variant.color}55; border-radius: 12px; color: ${variant.color}; font-weight: bold; backdrop-filter: blur(4px); white-space: nowrap; transform: scale(${scale});`;
            leafEl.innerHTML = `${variant.emoji} ${esc(text)}`;
            leavesContainer.appendChild(leafEl);

            if (reducedMotion) return; // leaf stays put, out of respect for the user's motion setting

            // Crossing speed varies leaf to leaf so they never travel in a pack.
            const crossDuration = 11000 + Math.random() * 9000;
            anime({
                targets: leafEl,
                translateX: ['0vw', '120vw'],
                duration: crossDuration,
                easing: 'linear',
                loop: true
            });

            // Independent bob + gentle twist, its own rhythm layered on top of
            // the crossing above — this is what makes the water read as water.
            const bobAmplitude = 6 + Math.random() * 14;
            const bobDuration = 1400 + Math.random() * 1600;
            anime({
                targets: leafEl,
                translateY: [`-${bobAmplitude}px`, `${bobAmplitude}px`],
                rotate: [`${startRotate - 12}deg`, `${startRotate + 12}deg`],
                duration: bobDuration,
                easing: 'easeInOutSine',
                direction: 'alternate',
                loop: true
            });
        }

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                launchLeaf(input.value.trim());
                input.value = '';
            }
        });
    };

    internalRender();
}

// ─────────────────────────────────────────────────────────────────────────────
// RADIO DOOM & GLOOM → DEFUSIÓN LINGÜÍSTICA
// ─────────────────────────────────────────────────────────────────────────────

function renderRadioDoomGloomTool(container) {
    const savedRadioData = state.persistence?.grounding?.radio || {};

    let broadcast = savedRadioData.broadcast || '';
    let volume = 80;
    let tuning = 50;
    let defusedText = savedRadioData.defusedText || '';
    let customColor = savedRadioData.customColor || '#fbbf24';
    let customFontSize = Number(savedRadioData.customFontSize || 16);
    let textShape = savedRadioData.textShape || 'normal';
    let snippets = Array.isArray(savedRadioData.snippets) ? savedRadioData.snippets : [];
    let snippetDraft = '';

    const stations = [
        { id: 'critic', label: '94.2 FM - El Crítico Interno', color: '#ef4444' },
        { id: 'future', label: '102.5 FM - Radio Catástrofe', color: '#f59e0b' },
        { id: 'past', label: '88.1 FM - Melancolía & Culpa', color: '#3b82f6' }
    ];

    const defusionPrefixes = [
        { label: '«Estoy teniendo el pensamiento de que...»', prefix: 'Estoy teniendo el pensamiento de que ' },
        { label: '«Mi mente dice que...»', prefix: 'Mi mente dice que ' },
        { label: '«Gracias, mente»', prefix: 'Gracias, mente. Sé que querés ayudar. ' }
    ];

    const guide = renderGuideBadge({
        trigger: 'Pensamientos catastrofistas o crítica interna muy intensa. El paciente habla sobre sí mismo con juicios absolutos ("soy un fracaso", "todo va a salir mal").',
        intro: 'Vamos a poner ese pensamiento en una emisora de radio. Una voz que transmite, no una verdad. ¿Cuál sería el nombre de esa emisora?',
        questions: [
            '¿Podés escuchar la voz sin creerle del todo?',
            '¿Qué cambia si lo decís como "mi mente dice que..." en lugar de creerlo directamente?',
            '¿Cuánto volumen le estás dando a esa emisora ahora mismo?'
        ],
        abort: 'El paciente se ríe de sus pensamientos de forma defensiva o usa la herramienta para evitar sentirlos. Detener y explorar qué está evitando.'
    });

    const internalRender = () => {
        const currentStation = stations[Math.floor((tuning / 101) * stations.length)];
        const shapeStyleMap = {
            normal: '',
            mayusculas: 'text-transform: uppercase;',
            espaciado: 'letter-spacing: 2px;',
            italica: 'font-style: italic;'
        };

        const persistRadioState = () => {
            state.persistence.grounding ??= {
                hojas: { contexto: '', aprendizaje: '', accion: '' },
                cielo: { contexto: '', aprendizaje: '', accion: '' },
                visualizador: { contexto: '', aprendizaje: '', accion: '' },
                radio: { contexto: '', aprendizaje: '', accion: '' },
                lucha: { contexto: '', aprendizaje: '', accion: '' }
            };
            state.persistence.grounding.radio ??= { contexto: '', aprendizaje: '', accion: '' };

            Object.assign(state.persistence.grounding.radio, {
                broadcast,
                defusedText,
                customColor,
                customFontSize,
                textShape,
                snippets
            });
            saveState();
        };

        container.innerHTML = `
            <div class="tool-content">
                ${guide}

                <div class="radio-interface glass" style="padding: 1.5rem; border-radius: var(--radius-lg); border: 2px solid ${currentStation.color}88; background: rgba(0,0,0,0.2);">
                    <div class="radio-screen" style="background: #050a05; padding: 1.5rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-family: 'Courier New', monospace; color: ${currentStation.color}; min-height: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                        <div class="noise-overlay" style="opacity: ${(100 - volume) / 100 + 0.1};"></div>
                        <div style="font-size: 0.6rem; margin-bottom: 0.5rem; opacity: 0.7; letter-spacing: 2px;">${currentStation.label}</div>
                        <div id="broadcast-text" style="font-size: ${customFontSize}px; text-align: center; font-weight: bold; transition: all 0.2s ease; transform: scale(${0.5 + (volume / 200)}) translateY(${(100 - volume) / 2}px); color: ${customColor}; ${shapeStyleMap[textShape]}">
                            ${broadcast ? `"${esc(broadcast)}"` : 'BUSCANDO SEÑAL...'}
                        </div>
                    </div>

                    <div class="radio-controls" style="display: flex; flex-direction: column; gap: 1rem;">
                        <input type="text" id="radio-input" class="input-field" value="${esc(broadcast)}" placeholder="¿Qué dice la voz ahora mismo?" style="background: rgba(255,255,255,0.05); border-color: ${currentStation.color}44;">

                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <span style="font-size: 0.7rem; color: var(--color-text-secondary); min-width: 60px;">Volumen</span>
                            <input type="range" id="radio-volume" min="0" max="100" value="${volume}" class="slider-act" style="flex: 1;">
                            <span style="font-size: 0.7rem; color: var(--color-text-secondary); min-width: 30px;">${volume}%</span>
                        </div>

                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <span style="font-size: 0.7rem; color: var(--color-text-secondary); min-width: 60px;">Emisora</span>
                            <input type="range" id="radio-tuning" min="0" max="100" value="${tuning}" class="slider-act" style="flex: 1;">
                        </div>
                    </div>
                </div>

                <div class="glass" style="margin-top: 1rem; padding: 1rem; border-radius: var(--radius-md);">
                    <h4 style="font-size: 0.8rem; color: var(--color-primary); margin-bottom: 0.75rem;">Editor de mensaje</h4>
                    <p style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.75rem;">Ajustá el texto para clarificar el ejercicio y guardar frases durante la sesión.</p>
                    <div style="display: grid; gap: 0.75rem;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; align-items: center;">
                            <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; color: var(--color-text-secondary);">
                                Color
                                <input type="color" id="radio-color" value="${customColor}" style="width: 34px; height: 28px; border: none; background: transparent; cursor: pointer;">
                            </label>
                            <label style="display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.72rem; color: var(--color-text-secondary);">
                                Tamaño (${customFontSize}px)
                                <input type="range" id="radio-font-size" min="12" max="32" value="${customFontSize}" class="slider-act">
                            </label>
                            <label style="display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.72rem; color: var(--color-text-secondary);">
                                Forma
                                <select id="radio-shape" class="input-field" style="height: 2rem; font-size: 0.75rem; padding: 0.2rem 0.5rem;">
                                    <option value="normal" ${textShape === 'normal' ? 'selected' : ''}>Normal</option>
                                    <option value="mayusculas" ${textShape === 'mayusculas' ? 'selected' : ''}>MAYÚSCULAS</option>
                                    <option value="espaciado" ${textShape === 'espaciado' ? 'selected' : ''}>Espaciado</option>
                                    <option value="italica" ${textShape === 'italica' ? 'selected' : ''}>Itálica</option>
                                </select>
                            </label>
                        </div>

                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="snippet-input" class="input-field" placeholder="Escribí una frase para reutilizar" value="${esc(snippetDraft)}" style="font-size: 0.8rem;">
                            <button id="btn-add-snippet" class="btn-primary" style="padding: 0.45rem 0.8rem; font-size: 0.75rem;">Agregar</button>
                        </div>

                        <div id="snippet-list" style="display: flex; flex-direction: column; gap: 0.4rem;">
                            ${snippets.length
                ? snippets.map((snippet, index) => `
                                      <div style="display: flex; align-items: center; gap: 0.4rem; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); padding: 0.4rem 0.5rem;">
                                        <button class="btn-use-snippet" data-index="${index}" style="flex: 1; text-align: left; font-size: 0.76rem; color: var(--color-text-secondary); background: transparent; border: none; cursor: pointer;">${esc(snippet)}</button>
                                        <button class="btn-delete-snippet" data-index="${index}" style="font-size: 0.72rem; color: #ef4444; background: transparent; border: 1px solid #ef444466; border-radius: 6px; padding: 0.2rem 0.45rem; cursor: pointer;">Borrar</button>
                                      </div>
                                  `).join('')
                : '<p style="font-size: 0.72rem; color: var(--color-text-secondary); margin: 0;">Todavía no hay frases guardadas.</p>'}
                        </div>
                    </div>
                </div>

                <!-- Defusión lingüística -->
                <div class="glass" style="margin-top: 1rem; padding: 1rem; border-radius: var(--radius-md);">
                    <h4 style="font-size: 0.8rem; color: var(--color-primary); margin-bottom: 0.75rem;">Defusión lingüística</h4>
                    <p style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.75rem;">Reformula el pensamiento con uno de estos prefijos y nota qué cambia:</p>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;" id="defusion-buttons">
                        ${defusionPrefixes.map((d, i) => `
                            <button class="btn-defusion" data-prefix="${d.prefix}" data-idx="${i}"
                                style="text-align: left; padding: 0.6rem 0.85rem; border-radius: var(--radius-sm);
                                       background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border);
                                       color: var(--color-text-secondary); font-size: 0.78rem; cursor: pointer;
                                       transition: all 0.2s; line-height: 1.4;">
                                ${d.label}
                            </button>
                        `).join('')}
                    </div>
                    <div id="defused-result" style="margin-top: 0.75rem; min-height: 2.5rem; padding: 0.75rem; background: rgba(255,255,255,0.04); border-radius: var(--radius-sm); font-size: 0.85rem; font-style: italic; color: var(--color-primary); display: ${defusedText ? 'block' : 'none'};">
                        ${esc(defusedText)}
                    </div>
                </div>

                <div class="glass" style="margin-top: 1rem; padding: 1rem; border-radius: var(--radius-md);">
                    <h4 style="margin-bottom: 0.25rem; font-size: 0.85rem;">Aterrizaje clínico</h4>
                    <p style="font-size: 0.7rem; color: var(--color-text-secondary); margin-bottom: 0.75rem;">Tres pasos para cerrar el ejercicio: dónde apareció, qué cambió, qué acción sigue.</p>
                    <div class="grounding-fields" style="display: grid; gap: 0.5rem;">
                        ${groundingField('radio-contexto', '¿En qué situación apareció esta emisora?', esc(state.persistence.grounding?.radio?.contexto || ''))}
                        ${groundingField('radio-aprendizaje', '¿Qué notaste al escucharla como voz de la mente?', esc(state.persistence.grounding?.radio?.aprendizaje || ''))}
                        ${groundingField('radio-accion', 'Aunque suene fuerte, ¿qué acción elegís sostener?', esc(state.persistence.grounding?.radio?.accion || ''))}
                    </div>
                </div>
            </div>
        `;

        attachGuideBadgeEvents();
        document.getElementById('radio-input')?.focus();

        ['contexto', 'aprendizaje', 'accion'].forEach((key) => {
            const el = document.getElementById(`radio-${key}`);
            el?.addEventListener('input', (e) => {
                state.persistence.grounding ??= {
                    hojas: { contexto: '', aprendizaje: '', accion: '' },
                    cielo: { contexto: '', aprendizaje: '', accion: '' },
                    visualizador: { contexto: '', aprendizaje: '', accion: '' },
                    radio: { contexto: '', aprendizaje: '', accion: '' },
                    lucha: { contexto: '', aprendizaje: '', accion: '' }
                };
                state.persistence.grounding.radio ??= { contexto: '', aprendizaje: '', accion: '' };
                state.persistence.grounding.radio[key] = e.target.value;
                saveState();
            });
        });

        document.getElementById('radio-input').addEventListener('input', (e) => {
            broadcast = e.target.value;
            const text = document.getElementById('broadcast-text');
            text.innerHTML = broadcast ? `"${esc(broadcast)}"` : 'BUSCANDO SEÑAL...';
            persistRadioState();
        });

        document.getElementById('radio-volume').addEventListener('input', (e) => {
            volume = e.target.value;
            radioAudio.setVolume((100 - volume) / 100);
            const overlay = container.querySelector('.noise-overlay');
            if (overlay) overlay.style.opacity = (100 - volume) / 100 + 0.1;
            const broadcastText = document.getElementById('broadcast-text');
            if (broadcastText) {
                const scale = 0.5 + (volume / 200);
                const translateY = (100 - volume) / 2;
                broadcastText.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            }
            const volLabel = e.target.nextElementSibling;
            if (volLabel) volLabel.textContent = `${volume}%`;
        });

        document.getElementById('radio-tuning').addEventListener('input', (e) => {
            tuning = e.target.value;
            radioAudio.init();
            const currentStation = stations[Math.floor((tuning / 101) * stations.length)];
            const interfaceEl = container.querySelector('.radio-interface');
            if (interfaceEl) interfaceEl.style.borderColor = currentStation.color + '88';
            const screenEl = container.querySelector('.radio-screen');
            if (screenEl) screenEl.style.color = currentStation.color;
            const labelEl = container.querySelector('.radio-screen > div:nth-child(2)');
            if (labelEl) labelEl.textContent = currentStation.label;
        });

        document.getElementById('radio-color')?.addEventListener('input', (e) => {
            customColor = e.target.value;
            persistRadioState();
            const text = document.getElementById('broadcast-text');
            if (text) text.style.color = customColor;
        });

        document.getElementById('radio-font-size')?.addEventListener('input', (e) => {
            customFontSize = Number(e.target.value);
            persistRadioState();
            const text = document.getElementById('broadcast-text');
            if (text) text.style.fontSize = `${customFontSize}px`;
            const lbl = e.target.parentElement;
            if (lbl && lbl.childNodes[0]) lbl.childNodes[0].nodeValue = `Tamaño (${customFontSize}px) `;
        });

        document.getElementById('radio-shape')?.addEventListener('change', (e) => {
            textShape = e.target.value;
            persistRadioState();
            internalRender();
        });

        document.getElementById('snippet-input')?.addEventListener('input', (e) => {
            snippetDraft = e.target.value;
        });

        document.getElementById('btn-add-snippet')?.addEventListener('click', () => {
            const cleanedSnippet = (document.getElementById('snippet-input')?.value || '').trim();
            if (!cleanedSnippet) return;
            snippets = [cleanedSnippet, ...snippets.filter((item) => item !== cleanedSnippet)].slice(0, 8);
            snippetDraft = '';
            persistRadioState();
            internalRender();
        });

        document.querySelectorAll('.btn-use-snippet').forEach((btn) => {
            btn.addEventListener('click', () => {
                const index = Number(btn.dataset.index);
                broadcast = snippets[index] || broadcast;
                persistRadioState();
                internalRender();
            });
        });

        document.querySelectorAll('.btn-delete-snippet').forEach((btn) => {
            btn.addEventListener('click', () => {
                const index = Number(btn.dataset.index);
                const [removed] = snippets.splice(index, 1);
                snippets = [...snippets];
                persistRadioState();
                internalRender();
                showToast('Frase borrada', {
                    actionLabel: 'Deshacer',
                    onAction: () => {
                        snippets.splice(index, 0, removed);
                        snippets = [...snippets];
                        persistRadioState();
                        internalRender();
                    }
                });
            });
        });

        document.querySelectorAll('.btn-defusion').forEach(btn => {
            btn.addEventListener('click', () => {
                const prefix = btn.dataset.prefix;
                const base = broadcast.trim() || '...';
                const lower = base.charAt(0).toLowerCase() + base.slice(1);
                defusedText = prefix + lower;

                const result = document.getElementById('defused-result');
                result.style.display = 'block';
                result.innerHTML = esc(defusedText);

                document.querySelectorAll('.btn-defusion').forEach(b => b.style.borderColor = 'var(--glass-border)');
                btn.style.borderColor = 'var(--color-primary)';
                btn.style.color = 'var(--color-primary)';
                persistRadioState();
            });
        });
    };

    internalRender();
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERRUPTOR DE LA LUCHA
// ─────────────────────────────────────────────────────────────────────────────

function renderInterruptorLuchaTool(container) {
    // The struggle switch is a real ACT metaphor, but pressing a button doesn't evoke
    // the *cost* of struggling. While the switch is on LUCHA, a tension bar climbs on its
    // own (mounting cost, pure CSS — no timer to clean up); on release we reflect back how
    // many seconds the struggle was held. The cost becomes something the patient watches.
    let isStruggling = true;
    let struggleStart = Date.now();
    let lastCost = null;

    const guide = renderGuideBadge({
        trigger: 'El paciente describe resistencia activa a sentir, tensión corporal, o verbaliza que "no quiere sentir esto". Útil para hacer visible la lucha que ya está ocurriendo.',
        intro: 'Quiero mostrarte algo. En este momento, ¿estás peleando con lo que estás sintiendo o lo estás dejando estar?',
        questions: [
            '¿Qué pasa en tu cuerpo cuando elegís no pelear?',
            '¿La emoción cambió, o solo cambió tu relación con ella?',
            '¿Cuánta energía está costando mantener esa lucha?'
        ],
        abort: 'El paciente usa el toggle repetidamente buscando alivio o empieza a frustrarse. La herramienta se está convirtiendo en otro mecanismo de control. Pausar.'
    });

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                ${guide}

                <div class="switch-container glass" style="padding: 2rem; border-radius: var(--radius-lg); display: flex; flex-direction: column; align-items: center; gap: 1.5rem; position: relative; overflow: hidden;">
                    <div class="switch-aura ${!isStruggling ? 'active' : ''}"></div>

                    <!-- Fase 1: pregunta antes del toggle -->
                    <div style="text-align: center; z-index: 2;">
                        <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 0.5rem;">En este momento, ¿qué estás haciendo con esta experiencia?</p>
                    </div>

                    <div id="struggle-toggle" style="width: 70px; height: 120px; background: #1e293b; border-radius: 35px; padding: 5px; cursor: pointer; position: relative; border: 3px solid ${isStruggling ? '#ef4444' : '#3b82f6'}; transition: 0.3s; z-index: 2;">
                        <div style="width: 60px; height: 60px; background: white; border-radius: 50%; position: absolute; left: 2px; transition: 0.4s; top: ${isStruggling ? '5px' : '55px'}; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3); ${isStruggling ? 'animation: luchaShake 0.35s ease-in-out infinite;' : ''}">
                            ${isStruggling ? '⚡' : '🌊'}
                        </div>
                    </div>

                    <div style="z-index: 2; text-align: center;">
                        <h4 style="color: ${isStruggling ? '#ef4444' : '#3b82f6'}; margin-bottom: 0.4rem; font-size: 1rem;">
                            ${isStruggling ? 'LUCHA' : 'DISPOSICIÓN'}
                        </h4>
                        <p class="clinical-note" style="max-width: 220px; font-size: 0.8rem;">
                            ${isStruggling
                ? 'Estás peleando con tu experiencia. Mirá lo que cuesta sostenerlo.'
                : 'Has elegido no pelear por un momento. ¿Qué notás ahora?'}
                        </p>
                    </div>

                    ${isStruggling ? `
                    <!-- Coste creciente de la lucha (animación CSS, sin timers) -->
                    <div style="width: 100%; max-width: 240px; z-index: 2;">
                        <div style="height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; background: linear-gradient(90deg, #f59e0b, #ef4444); animation: luchaTension 25s linear forwards;"></div>
                        </div>
                        <p style="font-size: 0.7rem; color: #ef4444; text-align: center; margin-top: 0.35rem;">El coste sube cuanto más peleás.</p>
                    </div>
                    ` : `
                    <!-- Fase 2: invitación a observar después del toggle -->
                    ${lastCost !== null ? `
                    <p style="font-size: 0.78rem; color: #3b82f6; z-index: 2; max-width: 240px; text-align: center;">
                        Sostuviste la lucha ~${lastCost}s. Eso costó energía. ¿La sentís al soltarla?
                    </p>
                    ` : ''}
                    <p style="font-size: 0.78rem; color: var(--color-text-secondary); z-index: 2; max-width: 240px; text-align: center;">
                        ¿Qué notás en tu cuerpo o en la experiencia ahora? Registralo abajo, en el aterrizaje.
                    </p>
                    `}

                    <p style="font-size: 0.7rem; color: var(--color-text-secondary); z-index: 2; font-style: italic; max-width: 220px; text-align: center;">
                        El objetivo no es apagar la lucha, sino notarla.
                    </p>
                </div>

                <div class="glass" style="margin-top: 1rem; padding: 1rem; border-radius: var(--radius-md);">
                    <h4 style="margin-bottom: 0.25rem; font-size: 0.85rem;">Aterrizaje clínico</h4>
                    <p style="font-size: 0.7rem; color: var(--color-text-secondary); margin-bottom: 0.75rem;">Tres pasos para cerrar el ejercicio: dónde apareció, qué cambió, qué acción sigue.</p>
                    <div class="grounding-fields" style="display: grid; gap: 0.5rem;">
                        ${groundingField('lucha-contexto', '¿Cuándo se activa más esta lucha en tu semana?', esc(state.persistence.grounding?.lucha?.contexto || ''))}
                        ${groundingField('lucha-aprendizaje', '¿Qué notaste al dejar de pelear por unos segundos?', esc(state.persistence.grounding?.lucha?.aprendizaje || ''))}
                        ${groundingField('lucha-accion', 'Con esta emoción presente, ¿qué acción valiosa podés sostener?', esc(state.persistence.grounding?.lucha?.accion || ''))}
                    </div>
                </div>
            </div>
            <style>
                @keyframes luchaTension { from { width: 0%; } to { width: 100%; } }
                @keyframes luchaShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-2px); }
                    75% { transform: translateX(2px); }
                }
            </style>
        `;

        attachGuideBadgeEvents();

        document.getElementById('struggle-toggle').addEventListener('click', () => {
            if (isStruggling) {
                lastCost = Math.round((Date.now() - struggleStart) / 1000);
                isStruggling = false;
            } else {
                struggleStart = Date.now();
                lastCost = null;
                isStruggling = true;
            }
            internalRender();
        });

        ['contexto', 'aprendizaje', 'accion'].forEach((key) => {
            const el = document.getElementById(`lucha-${key}`);
            el?.addEventListener('input', (e) => {
                state.persistence.grounding ??= {
                    hojas: { contexto: '', aprendizaje: '', accion: '' },
                    cielo: { contexto: '', aprendizaje: '', accion: '' },
                    visualizador: { contexto: '', aprendizaje: '', accion: '' },
                    radio: { contexto: '', aprendizaje: '', accion: '' },
                    lucha: { contexto: '', aprendizaje: '', accion: '' }
                };
                state.persistence.grounding.lucha ??= { contexto: '', aprendizaje: '', accion: '' };
                state.persistence.grounding.lucha[key] = e.target.value;
                saveState();
            });
        });
    };

    internalRender();
}
