/**
 * ACT In-Session - Presente Module (Mindfulness / Grounding)
 */

import { state, saveState } from '../core/state.js';
import { renderModuleHeader, attachHeaderEvents, renderGuideBadge, attachGuideBadgeEvents, attachEdgeFade, groundingField, showToast } from '../ui/utils.js';
import { escapeHTML as esc } from '../core/security.js';

export function renderPresenteModule(container, module, { renderHome, initialTool } = {}) {
    const tools = [
        { id: 'stop', title: 'STOP', icon: 'octagon' },
        { id: 'sentidos', title: '5 Sentidos', icon: 'hand' },
        { id: 'cielo', title: 'Cielo y Clima', icon: 'cloud' }
    ];

    let activeToolId = tools.some(t => t.id === initialTool) ? initialTool : 'stop';

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
        attachEdgeFade(container.querySelector('.tool-selector'));

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
    // STOP is experiential, not a set of cards to read: each letter is *done*.
    // Notes here are ephemeral (in-session only) to avoid turning grounding into self-monitoring.
    const steps = [
        {
            id: 'S',
            title: 'S · Detente',
            body: `
                <p class="clinical-note" style="max-width: 260px; margin: 0 auto;">Suelta lo que estabas haciendo. Por un momento no hay nada que resolver.</p>
                <button class="btn-primary" id="stop-advance" style="margin-top: 2rem;">Estoy en pausa</button>
            `
        },
        {
            id: 'T',
            title: 'T · Respira',
            body: `
                <div class="breathing-circle-container" style="position: relative; width: 180px; height: 180px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                    <div id="stop-breath-circle" style="width: 70px; height: 70px; background: var(--color-primary); border-radius: 50%; box-shadow: 0 0 40px var(--color-primary); opacity: 0.8;"></div>
                    <span id="stop-breath-label" style="position: absolute; font-size: 0.85rem; color: white; font-weight: 600;">Inhala</span>
                </div>
                <p class="clinical-note" style="margin-top: 1.5rem; max-width: 260px; margin-left: auto; margin-right: auto;">Sigue el círculo. No cambies la respiración: solo nótala.</p>
                <button class="btn-primary" id="stop-advance" style="margin-top: 1.5rem;">Continuar</button>
            `
        },
        {
            id: 'O',
            title: 'O · Observa',
            body: `
                <p class="clinical-note" style="max-width: 260px; margin: 0 auto 1.25rem;">¿Qué hay aquí ahora? Nómbralo, sin arreglarlo.</p>
                <div style="display: grid; gap: 0.75rem; max-width: 340px; margin: 0 auto;">
                    <input type="text" id="stop-body" class="input-field" placeholder="En el cuerpo noto...">
                    <input type="text" id="stop-mind" class="input-field" placeholder="En la mente aparece...">
                </div>
                <button class="btn-primary" id="stop-advance" style="margin-top: 1.5rem;">Continuar</button>
            `
        },
        {
            id: 'P',
            title: 'P · Procede',
            body: `
                <p class="clinical-note" style="max-width: 260px; margin: 0 auto 1.25rem;">Con esto presente, ¿hacia dónde eliges dar el siguiente paso?</p>
                <input type="text" id="stop-proceed" class="input-field" placeholder="Elijo seguir hacia..." style="max-width: 340px; margin: 0 auto; display: block;">
                <button class="btn-primary" id="stop-advance" style="margin-top: 1.5rem;">Terminar</button>
            `
        }
    ];

    let current = 0;
    let breathAnim = null;
    const notes = { body: '', mind: '', proceed: '' };

    const stopBreath = () => { if (breathAnim) { breathAnim.pause(); breathAnim = null; } };

    const startBreathing = () => {
        const circle = document.getElementById('stop-breath-circle');
        const label = document.getElementById('stop-breath-label');
        if (!circle) return;

        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            // No pulsing circle, but the Inhala/Exhala pacing itself still matters here.
            let reversed = false;
            if (label) label.innerText = 'Inhala';
            const intervalId = setInterval(() => {
                reversed = !reversed;
                if (label) label.innerText = reversed ? 'Exhala' : 'Inhala';
            }, 5000);
            breathAnim = { pause: () => clearInterval(intervalId) };
            return;
        }

        breathAnim = anime({
            targets: circle,
            scale: [0.7, 1.5],
            duration: 5000,
            easing: 'easeInOutSine',
            direction: 'alternate',
            loop: true,
            update: (a) => { if (label) label.innerText = a.reversed ? 'Exhala' : 'Inhala'; }
        });
    };

    const internalRender = () => {
        stopBreath();
        const s = steps[current];
        container.innerHTML = `
            <div class="tool-content" style="text-align: center;">
                <div style="display: flex; justify-content: center; gap: 0.4rem; margin-bottom: 1.5rem;">
                    ${steps.map((st, i) => `<span style="width: 26px; height: 4px; border-radius: 2px; background: ${i <= current ? 'var(--color-primary)' : 'var(--glass-border)'};"></span>`).join('')}
                </div>
                <div class="glass" style="padding: 2rem 1.5rem; border-radius: var(--radius-lg);">
                    <h3 style="color: var(--color-primary); font-size: 1.1rem; margin-bottom: 1.25rem;">${s.title}</h3>
                    ${s.body}
                </div>
                ${current > 0 ? `<button class="btn-ghost" id="stop-back" style="margin-top: 1rem;">Anterior</button>` : ''}
            </div>
        `;

        const bodyEl = document.getElementById('stop-body');
        if (bodyEl) { bodyEl.value = notes.body; bodyEl.addEventListener('input', e => notes.body = e.target.value); }
        const mindEl = document.getElementById('stop-mind');
        if (mindEl) { mindEl.value = notes.mind; mindEl.addEventListener('input', e => notes.mind = e.target.value); }
        const procEl = document.getElementById('stop-proceed');
        if (procEl) { procEl.value = notes.proceed; procEl.addEventListener('input', e => notes.proceed = e.target.value); }

        if (s.id === 'T') startBreathing();

        document.getElementById('stop-advance')?.addEventListener('click', () => {
            if (current === steps.length - 1) {
                current = 0;
                notes.body = notes.mind = notes.proceed = '';
            } else {
                current++;
            }
            internalRender();
        });
        document.getElementById('stop-back')?.addEventListener('click', () => {
            if (current > 0) current--;
            internalRender();
        });
    };
    internalRender();
}

export function render5SentidosTool(container) {
    // Experiential grounding: the patient actively *names* what they perceive
    // (anchoring by doing) instead of reading a count. Answers are ephemeral —
    // this is in-the-moment anchoring, used in session and in crisis (SOS).
    const senses = [
        { count: 5, item: 'cosas que puedes ver', verb: 'Nombra', color: '#f59e0b' },
        { count: 4, item: 'cosas que puedes tocar', verb: 'Nombra', color: '#10b981' },
        { count: 3, item: 'sonidos que puedes oír', verb: 'Nombra', color: '#3b82f6' },
        { count: 2, item: 'olores que puedes notar', verb: 'Nombra', color: '#8b5cf6' },
        { count: 1, item: 'sabor o sensación en la boca', verb: 'Nota', color: '#ef4444' }
    ];
    let currentSense = 0;
    const answers = senses.map(() => []);
    let finished = false;

    const internalRender = () => {
        if (finished) {
            container.innerHTML = `
                <div class="tool-content animate-scale-in" style="text-align: center; padding: 3rem 1rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🌱</div>
                    <h3 style="color: var(--color-primary); font-size: 1.5rem; margin-bottom: 1rem;">Ejercicio Completado</h3>
                    <p style="color: var(--color-text-secondary); font-size: 1rem; margin-bottom: 2.5rem; max-width: 300px; margin-left: auto; margin-right: auto;">Notá cómo se siente estar aquí y ahora. El pasado es memoria, el futuro es imaginación.</p>
                    <button class="btn-primary" id="btn-restart-5">Repetir ejercicio</button>
                </div>
            `;
            document.getElementById('btn-restart-5').addEventListener('click', () => {
                finished = false;
                currentSense = 0;
                for (let i = 0; i < answers.length; i++) answers[i] = [];
                internalRender();
            });
            return;
        }

        const s = senses[currentSense];
        const named = answers[currentSense];
        const remaining = Math.max(0, s.count - named.length);
        const done = remaining === 0;
        const isLast = currentSense === senses.length - 1;

        container.innerHTML = `
            <div class="tool-content" style="text-align: center;">
                <div class="sense-display glass" style="padding: 2rem 1.5rem; border-radius: var(--radius-lg); border: 2px solid ${s.color};">
                    <div style="font-size: 3rem; color: ${s.color}; line-height: 1;">${remaining}</div>
                    <div style="font-size: 1.05rem; margin-top: 0.35rem;">${s.verb} ${s.count} ${s.item}</div>
                    <p style="font-size: 0.72rem; color: var(--color-text-secondary); margin-top: 0.4rem;">${done ? 'Listo. Notá que estás aquí.' : `Faltan ${remaining}`}</p>

                    <div style="display: flex; gap: 0.5rem; margin-top: 1.25rem;">
                        <input type="text" id="sense-input" class="input-field" placeholder="Escribe lo que notás..." style="flex: 1; border-color: ${s.color}55;" ${done ? 'disabled' : ''}>
                        <button class="btn-primary" id="btn-add-sense" style="background: ${s.color};" ${done ? 'disabled' : ''}>+</button>
                    </div>

                    <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: center; margin-top: 1rem;">
                        ${named.map((t, i) => `
                            <span class="sense-chip" style="display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.3rem 0.6rem; border-radius: 16px; background: ${s.color}1f; border: 1px solid ${s.color}55; font-size: 0.78rem;">
                                ${esc(t)}<button class="btn-del-sense" data-idx="${i}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.85rem; line-height: 1; padding: 0;">×</button>
                            </span>
                        `).join('')}
                    </div>
                </div>
                <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 1rem;">
                    <button class="btn-ghost" id="btn-prev-5" ${currentSense === 0 ? 'disabled' : ''}>Anterior</button>
                    <button class="btn-primary" id="btn-next-5">${isLast ? 'Finalizar' : 'Siguiente'}</button>
                </div>
            </div>
        `;

        const input = document.getElementById('sense-input');
        input?.focus();

        const addItem = () => {
            const v = input.value.trim();
            if (!v) return;
            named.push(v);
            internalRender();
        };
        document.getElementById('btn-add-sense')?.addEventListener('click', addItem);
        input?.addEventListener('keydown', e => { if (e.key === 'Enter') addItem(); });

        container.querySelectorAll('.btn-del-sense').forEach(btn => {
            btn.addEventListener('click', () => { named.splice(parseInt(btn.dataset.idx), 1); internalRender(); });
        });

        document.getElementById('btn-next-5').addEventListener('click', () => {
            if (isLast) {
                finished = true;
            } else {
                currentSense = (currentSense + 1) % senses.length;
            }
            internalRender();
        });
        document.getElementById('btn-prev-5')?.addEventListener('click', () => {
            if (currentSense > 0) currentSense--;
            internalRender();
        });
    };
    internalRender();
}

function renderCieloYClimaTool(container) {
    // Automatic day/night based on system hour
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 19;

    // Smooth color mapping
    const skyColors = {
        day: 'linear-gradient(to bottom, #4facfe 0%, #00f2fe 100%)',
        night: 'linear-gradient(to bottom, #0f172a 0%, #1e293b 100%)'
    };

    const guide = renderGuideBadge({
        trigger: 'Confusión identitaria o fusión con estados emocionales intensos ("soy mi ansiedad", "soy así"). Útil para trabajar Yo Observador.',
        intro: 'Imagina que sos el cielo. Los pensamientos y emociones son el clima: pueden ser tormentas o días soleados. El cielo no cambia aunque haya tormenta. ¿Podés notar quién está observando todo esto?',
        questions: [
            '¿Quién está notando estas nubes?',
            '¿El cielo cambió, o solo cambió el clima?',
            '¿Podés ser el cielo que contiene la tormenta sin ser la tormenta?'
        ],
        abort: 'El paciente usa la metáfora para disociarse o evitar sentir. Si nota que "se va" en lugar de observar, detener y volver a anclar en sensaciones del cuerpo.'
    });

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                ${guide}

                <div class="sky-canvas glass" style="height: 280px; border-radius: var(--radius-lg); position: relative; overflow: hidden; background: ${isNight ? skyColors.night : skyColors.day}; transition: background 2s ease;">
                    ${isNight ? '<div class="stars" style="position: absolute; inset: 0; background: radial-gradient(white, transparent 2%) 0 0/50px 50px; opacity: 0.3;"></div>' : ''}
                    <div id="clouds-container">
                        ${state.persistence.weather.map((item, i) => `
                            <div class="cloud-item glass animate-float" style="position: absolute; left: ${item.x}%; top: ${item.y}%; padding: 0.5rem 1rem; border-radius: 20px; background: rgba(255,255,255,0.1); backdrop-filter: blur(4px); font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem; max-width: 65vw;">
                                <span>${esc(item.text)}</span>
                                <button class="item-remove-btn btn-del-weather" data-idx="${i}" aria-label="Quitar" style="color: rgba(255,255,255,0.75);">×</button>
                            </div>
                        `).join('')}
                    </div>
                    <div style="position: absolute; bottom: 0.75rem; left: 0; right: 0; text-align: center;">
                        <p style="font-size: 0.7rem; color: rgba(255,255,255,0.55);">Vos sos el cielo. Esto es el clima.</p>
                    </div>
                </div>

                <div style="margin-top: 1.25rem;">
                    <input type="text" id="weather-input" class="input-field" placeholder="Escribe un pensamiento o emoción (Enter para agregar)">
                </div>

                <div class="glass" style="margin-top: 1rem; padding: 1rem; border-radius: var(--radius-md);">
                    <h4 style="margin-bottom: 0.25rem; font-size: 0.85rem;">Aterrizaje clínico</h4>
                    <p style="font-size: 0.7rem; color: var(--color-text-secondary); margin-bottom: 0.75rem;">Tres pasos para cerrar el ejercicio: dónde apareció, qué cambió, qué acción sigue.</p>
                    <div class="grounding-fields" style="display: grid; gap: 0.5rem;">
                        ${groundingField('cielo-contexto', '¿Dónde aparece esto en tu vida cotidiana?', esc(state.persistence.grounding?.cielo?.contexto || ''))}
                        ${groundingField('cielo-aprendizaje', '¿Qué notaste al observar desde afuera?', esc(state.persistence.grounding?.cielo?.aprendizaje || ''))}
                        ${groundingField('cielo-accion', 'Aunque esté el clima, ¿qué elegís hacer?', esc(state.persistence.grounding?.cielo?.accion || ''))}
                    </div>
                </div>
            </div>
        `;

        attachGuideBadgeEvents();
        document.getElementById('weather-input')?.focus();

        // Slower cloud animation for mobile/clinical use
        if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            anime({
                targets: '.cloud-item',
                translateX: () => [0, anime.random(-20, 20)],
                translateY: () => [0, anime.random(-10, 10)],
                duration: 10000,
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutSine'
            });
        }

        ['contexto', 'aprendizaje', 'accion'].forEach((key) => {
            const el = document.getElementById(`cielo-${key}`);
            el?.addEventListener('input', (e) => {
                state.persistence.grounding ??= { hojas: { contexto: '', aprendizaje: '', accion: '' }, cielo: { contexto: '', aprendizaje: '', accion: '' } };
                state.persistence.grounding.cielo[key] = e.target.value;
                saveState();
            });
        });

        document.getElementById('weather-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const text = e.target.value.trim();
                if (text) {
                    state.persistence.weather.push({ text, x: 20 + Math.random() * 60, y: 10 + Math.random() * 60 });
                    saveState();
                    internalRender();
                }
            }
        });

        container.querySelectorAll('.btn-del-weather').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                const [removed] = state.persistence.weather.splice(idx, 1);
                saveState();
                internalRender();
                showToast('Quitado del cielo', {
                    actionLabel: 'Deshacer',
                    onAction: () => {
                        state.persistence.weather.splice(idx, 0, removed);
                        saveState();
                        internalRender();
                    }
                });
            });
        });
    };
    internalRender();
}
