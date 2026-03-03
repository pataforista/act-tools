/**
 * ACT In-Session - Abrirse Module (Defusion / Acceptance)
 */

import { state, saveState } from '../core/state.js';
import { radioAudio } from '../core/audio.js';
import { renderModuleHeader, attachHeaderEvents } from '../ui/utils.js';
import { animateDefusion } from '../core/animations.js';

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

function renderVisualizadorPensamientosTool(container) {
    let selectedThoughtIndex = null;
    let selectedColor = '#ffffff';
    let selectedSize = '0.9rem';

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <!-- UI for thought visualization (as in original app.js) -->
                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">Visualizador de Pensamientos</h3>
                    <p style="font-size: 0.8rem; color: var(--color-text-secondary);">Externaliza el pensamiento como objeto observable. Cambiar su forma no lo elimina — crea distancia para notar que eres quien lo observa, no el pensamiento mismo.</p>
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
                </div>

                <div id="thoughts-list" style="height: 400px; padding: 1.5rem; border: 2px dashed var(--glass-border); border-radius: var(--radius-lg); position: relative; background: rgba(0,0,0,0.1); overflow: hidden; perspective: 1000px;">
                    ${state.persistence.thoughts.length === 0 ? '<p style="color: var(--color-text-secondary); font-size: 0.8rem; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">Externaliza tus pensamientos aquí.</p>' : ''}
                    ${state.persistence.thoughts.map((t, i) => {
            const distortClass = t.mode ? `distort-${t.mode}` : '';
            const rotationStyle = t.rotateX ? `perspective(500px) rotateX(${t.rotateX}deg) rotateY(${t.rotateY || 0}deg)` : '';
            const spacingStyle = t.spacing ? `letter-spacing: ${t.spacing}px;` : '';

            return `
                        <div class="thought-item glass animate-scale-in ${selectedThoughtIndex === i ? 'selected' : ''} ${distortClass}" 
                             data-index="${i}" 
                             style="position: absolute; left: ${t.x ?? (20 + (i % 3) * 30)}%; top: ${t.y ?? (20 + Math.floor(i / 3) * 20)}%; 
                                    padding: 0.75rem 1.25rem; border-radius: 20px; font-size: ${t.size || '0.9rem'}; color: ${t.color || 'white'}; 
                                    border: 2px solid ${selectedThoughtIndex === i ? 'var(--color-primary)' : (t.color || 'var(--glass-border)') + '22'}; 
                                    opacity: ${t.opacity ?? 1}; filter: blur(${t.blur ?? 0}px); cursor: move; user-select: none; 
                                    z-index: ${selectedThoughtIndex === i ? 100 : 10}; transition: border 0.3s, box-shadow 0.3s, transform 0.3s;
                                    transform: ${rotationStyle}; ${spacingStyle}">
                            ${t.text || t}
                        </div>
                    `;
        }).join('')}
                </div>

                <div id="property-panel" class="glass" style="margin-top: 1rem; padding: 1.25rem; border-radius: var(--radius-md); display: ${selectedThoughtIndex !== null ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: 1rem; animation: slideUp 0.3s ease;">
                    <div style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                        <h4 style="font-size: 0.85rem; font-weight: bold; color: var(--color-primary);">Propiedades del Pensamiento</h4>
                        <button class="btn-ghost" id="btn-delete-thought" style="color: #ef4444; font-size: 0.75rem;">Eliminar ×</button>
                    </div>
                    
                    <div class="property-group">
                        <label>Distancia del observador</label>
                        <input type="range" id="prop-blur" min="0" max="8" step="0.5" value="${state.persistence.thoughts[selectedThoughtIndex]?.blur || 0}" class="slider-act">
                    </div>
                    <div class="property-group">
                        <label>Peso en la mente</label>
                        <input type="range" id="prop-opacity" min="0.1" max="1" step="0.1" value="${state.persistence.thoughts[selectedThoughtIndex]?.opacity || 1}" class="slider-act">
                    </div>
                    <div class="property-group">
                        <label>Carga verbal (stretching)</label>
                        <input type="range" id="prop-spacing" min="0" max="20" step="1" value="${state.persistence.thoughts[selectedThoughtIndex]?.spacing || 0}" class="slider-act">
                    </div>
                    <div class="property-group">
                        <label>Perspectiva del observador</label>
                        <input type="range" id="prop-rotateX" min="-60" max="60" step="1" value="${state.persistence.thoughts[selectedThoughtIndex]?.rotateX || 0}" class="slider-act">
                    </div>
                    
                    <div style="grid-column: 1 / -1; display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                        ${['none', 'glitch', 'wavy', 'mirror'].map(m => `
                            <button class="btn-toggle flex-1 ${state.persistence.thoughts[selectedThoughtIndex]?.mode === m ? 'active' : ''}" data-mode="${m}" style="text-transform: capitalize; font-size: 0.7rem;">
                                ${m === 'none' ? 'Normal' : m}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

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
        input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addThought(); });

        document.getElementById('btn-delete-thought')?.addEventListener('click', () => {
            state.persistence.thoughts.splice(selectedThoughtIndex, 1);
            selectedThoughtIndex = null;
            saveState();
            internalRender();
        });

        document.getElementById('prop-blur')?.addEventListener('input', (e) => {
            state.persistence.thoughts[selectedThoughtIndex].blur = e.target.value;
            saveState();
            internalRender();
        });
        document.getElementById('prop-opacity')?.addEventListener('input', (e) => {
            state.persistence.thoughts[selectedThoughtIndex].opacity = e.target.value;
            saveState();
            internalRender();
        });
        document.getElementById('prop-spacing')?.addEventListener('input', (e) => {
            state.persistence.thoughts[selectedThoughtIndex].spacing = e.target.value;
            saveState();
            internalRender();
        });
        document.getElementById('prop-rotateX')?.addEventListener('input', (e) => {
            state.persistence.thoughts[selectedThoughtIndex].rotateX = e.target.value;
            state.persistence.thoughts[selectedThoughtIndex].rotateY = e.target.value / 2; // slight Y tilt for depth
            saveState();
            internalRender();
        });
        document.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.persistence.thoughts[selectedThoughtIndex].mode = btn.dataset.mode === 'none' ? null : btn.dataset.mode;
                saveState();
                internalRender();
            });
        });

        // Add Defusion Animation
        animateDefusion('.thought-item');

        document.querySelectorAll('.color-swatch').forEach(sw => {
            sw.addEventListener('click', () => { selectedColor = sw.dataset.color; internalRender(); });
        });
        document.querySelectorAll('.size-picker .btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => { selectedSize = btn.dataset.size; internalRender(); });
        });
    };

    internalRender();
}

function renderHojasAguaTool(container) {
    let leaves = [];
    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom: 1rem; text-align: center;">
                    <p class="clinical-note">Usa la metáfora para observar el pensamiento sin discutir con él y luego aterrízalo a una acción concreta.</p>
                </div>
                <div class="stream-canvas glass" style="height: 350px; border-radius: var(--radius-lg); position: relative; overflow: hidden; background: linear-gradient(to right, #0ea5e955, #38bdf855); border: 2px solid #38bdf844;">
                    <div id="stream-flow" style="position: absolute; inset: 0; background: repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 80px); animation: moveStream 20s linear infinite;"></div>
                    <div id="leaves-container">
                        ${leaves.map((l, i) => `
                            <div class="leaf-item" style="position: absolute; left: -100px; top: ${l.y}%; padding: 0.5rem 1rem; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b98144; border-radius: 12px; color: #10b981; font-weight: bold; backdrop-filter: blur(4px);">
                                🍃 ${l.text}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div style="margin-top: 1.5rem;">
                    <input type="text" id="leaf-input" class="input-field" placeholder="¿Qué pensamiento pones en la hoja?">
                </div>

                <div class="glass" style="margin-top: 1rem; padding: 1rem; border-radius: var(--radius-md);">
                    <h4 style="margin-bottom: 0.5rem;">Aterrizaje clínico rápido</h4>
                    <div style="display: grid; gap: 0.5rem;">
                        <input type="text" id="hojas-contexto" class="input-field" placeholder="¿En qué situación real apareció esto?" value="${state.persistence.grounding?.hojas?.contexto || ''}">
                        <input type="text" id="hojas-aprendizaje" class="input-field" placeholder="¿Qué notaste al soltar la literalidad?" value="${state.persistence.grounding?.hojas?.aprendizaje || ''}">
                        <input type="text" id="hojas-accion" class="input-field" placeholder="Próximo paso pequeño y observable" value="${state.persistence.grounding?.hojas?.accion || ''}">
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
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                const text = input.value.trim();
                const newLeaf = { text, y: 15 + Math.random() * 70 };
                leaves.push(newLeaf);
                input.value = '';

                // We don't re-render everything to keep current leaf animations
                const leafEl = document.createElement('div');
                leafEl.className = 'leaf-item';
                leafEl.style.cssText = `position: absolute; left: -150px; top: ${newLeaf.y}%; padding: 0.5rem 1rem; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b98144; border-radius: 12px; color: #10b981; font-weight: bold; backdrop-filter: blur(4px); white-space: nowrap;`;
                leafEl.innerHTML = `🍃 ${text}`;
                document.getElementById('leaves-container').appendChild(leafEl);

                anime({
                    targets: leafEl,
                    translateX: ['0vw', '120vw'],
                    rotate: () => anime.random(-15, 15),
                    duration: 15000,
                    easing: 'linear',
                    complete: () => leafEl.remove()
                });
            }
        });
    };
    internalRender();
}

function renderRadioDoomGloomTool(container) {
    let broadcast = '';
    let volume = 80;
    let tuning = 50;

    const stations = [
        { id: 'critic', label: '94.2 FM - El Crítico Interno', color: '#ef4444' },
        { id: 'future', label: '102.5 FM - Radio Catástrofe', color: '#f59e0b' },
        { id: 'past', label: '88.1 FM - Melancolía & Culpa', color: '#3b82f6' }
    ];

    const internalRender = () => {
        const currentStation = stations[Math.floor((tuning / 101) * stations.length)];
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom: 1rem; text-align: center;">
                    <p class="clinical-note">La voz interior como señal de radio: no es la realidad, es ruido de fondo. Escucharla no es creerla — el volumen y la sintonía son propiedades de la señal, no de la persona.</p>
                </div>
                <div class="radio-interface glass" style="padding: 1.5rem; border-radius: var(--radius-lg); border: 2px solid ${currentStation.color}88; background: rgba(0,0,0,0.2);">
                    <div class="radio-screen" style="background: #050a05; padding: 1.5rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-family: 'Courier New', monospace; color: ${currentStation.color}; min-height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                        <div class="noise-overlay" style="opacity: ${(100 - volume) / 200 + 0.05};"></div>
                        <div style="font-size: 0.6rem; margin-bottom: 0.5rem; opacity: 0.7; letter-spacing: 2px;">${currentStation.label}</div>
                        <div id="broadcast-text" style="font-size: 1.1rem; text-align: center; font-weight: bold; transition: all 0.2s ease; filter: blur(${(100 - volume) / 20}px); opacity: ${volume / 100};">
                            ${broadcast ? `"${broadcast}"` : 'BUSCANDO SEÑAL...'}
                        </div>
                    </div>

                    <div class="radio-controls" style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <input type="text" id="radio-input" class="input-field center" value="${broadcast}" placeholder="¿Qué dice la voz ahora?" style="background: rgba(255,255,255,0.05); border-color: ${currentStation.color}44;">
                        <input type="range" id="radio-volume" min="0" max="100" value="${volume}" class="slider-act">
                        <input type="range" id="radio-tuning" min="0" max="100" value="${tuning}" class="slider-act">
                    </div>
                </div>

                <div class="glass" style="margin-top: 1.25rem; padding: 1rem; border-radius: var(--radius-md);">
                    <h4 style="margin-bottom: 0.5rem;">Aterrizaje clínico rápido</h4>
                    <div style="display: grid; gap: 0.5rem;">
                        <input type="text" id="radio-observado" class="input-field" placeholder="¿Qué notaste al escuchar la voz desde distancia?" value="${state.persistence.grounding?.radio?.observado || ''}">
                        <input type="text" id="radio-valor" class="input-field" placeholder="¿Qué importa para ti más allá de esa voz?" value="${state.persistence.grounding?.radio?.valor || ''}">
                        <input type="text" id="radio-accion" class="input-field" placeholder="Próxima acción alineada con ese valor" value="${state.persistence.grounding?.radio?.accion || ''}">
                    </div>
                </div>
            </div>
        `;

        document.getElementById('radio-input').addEventListener('input', (e) => {
            broadcast = e.target.value;
            const text = document.getElementById('broadcast-text');
            text.innerText = broadcast ? `"${broadcast}"` : 'BUSCANDO SEÑAL...';
        });

        document.getElementById('radio-volume').addEventListener('input', (e) => {
            volume = e.target.value;
            radioAudio.setVolume((100 - volume) / 100);
            internalRender();
        });

        document.getElementById('radio-tuning').addEventListener('input', (e) => {
            tuning = e.target.value;
            radioAudio.init();
            internalRender();
        });

        ['observado', 'valor', 'accion'].forEach((key) => {
            const el = document.getElementById(`radio-${key}`);
            el?.addEventListener('input', (e) => {
                state.persistence.grounding ??= {};
                state.persistence.grounding.radio ??= { observado: '', valor: '', accion: '' };
                state.persistence.grounding.radio[key] = e.target.value;
                saveState();
            });
        });
    };

    internalRender();
}

function renderInterruptorLuchaTool(container) {
    let isStruggling = true;
    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom: 1rem; text-align: center;">
                    <p class="clinical-note">El interruptor no elimina el malestar — ilustra el coste de la lucha y el espacio que aparece al soltar el control. No es resignación: es apertura para actuar desde los valores.</p>
                </div>
                <div class="switch-container glass" style="padding: 2.5rem; border-radius: var(--radius-lg); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 2rem; position: relative; overflow: hidden;">
                    <div class="switch-aura ${!isStruggling ? 'active' : ''}"></div>
                    <div id="struggle-toggle" style="width: 70px; height: 120px; background: #1e293b; border-radius: 35px; padding: 5px; cursor: pointer; position: relative; border: 3px solid ${isStruggling ? '#ef4444' : '#3b82f6'}; transition: 0.3s; z-index: 2;">
                        <div style="width: 60px; height: 60px; background: white; border-radius: 50%; position: absolute; left: 2px; transition: 0.4s; top: ${isStruggling ? '5px' : '55px'}; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                            ${isStruggling ? '⚡' : '🌊'}
                        </div>
                    </div>
                    <div style="z-index: 2;">
                        <h4 style="color: ${isStruggling ? '#ef4444' : '#3b82f6'}; margin-bottom: 0.5rem;">${isStruggling ? 'LUCHA (ON)' : 'DISPOSICIÓN (OFF)'}</h4>
                        <p class="clinical-note" style="max-width: 200px;">${isStruggling ? 'Estás peleando con tu experiencia. Es agotador.' : 'Has soltado los guantes. Hay espacio para sentir.'}</p>
                    </div>
                </div>

                <div class="glass" style="margin-top: 1.25rem; padding: 1rem; border-radius: var(--radius-md);">
                    <h4 style="margin-bottom: 0.5rem;">Aterrizaje clínico rápido</h4>
                    <div style="display: grid; gap: 0.5rem;">
                        <input type="text" id="lucha-apertura" class="input-field" placeholder="¿Qué aparece cuando soltás los guantes?" value="${state.persistence.grounding?.lucha?.apertura || ''}">
                        <input type="text" id="lucha-hacia" class="input-field" placeholder="¿Hacia qué te dirigís con ese espacio?" value="${state.persistence.grounding?.lucha?.hacia || ''}">
                        <input type="text" id="lucha-paso" class="input-field" placeholder="Un paso concreto y observable" value="${state.persistence.grounding?.lucha?.paso || ''}">
                    </div>
                </div>
            </div>
        `;
        document.getElementById('struggle-toggle').addEventListener('click', () => { isStruggling = !isStruggling; internalRender(); });

        ['apertura', 'hacia', 'paso'].forEach((key) => {
            const el = document.getElementById(`lucha-${key}`);
            el?.addEventListener('input', (e) => {
                state.persistence.grounding ??= {};
                state.persistence.grounding.lucha ??= { apertura: '', hacia: '', paso: '' };
                state.persistence.grounding.lucha[key] = e.target.value;
                saveState();
            });
        });
    };
    internalRender();
}
