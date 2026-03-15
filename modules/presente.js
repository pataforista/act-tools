/**
 * ACT In-Session - Presente Module (Mindfulness / Grounding)
 */

import { state, saveState } from '../core/state.js';
import { renderModuleHeader, attachHeaderEvents, renderGuideBadge, attachGuideBadgeEvents } from '../ui/utils.js';

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

export function render5SentidosTool(container) {
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
                            <div class="cloud-item glass animate-float" style="position: absolute; left: ${item.x}%; top: ${item.y}%; padding: 0.5rem 1rem; border-radius: 20px; background: rgba(255,255,255,0.1); backdrop-filter: blur(4px); font-size: 0.9rem;">
                                ${item.text}
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
                    <h4 style="margin-bottom: 0.75rem; font-size: 0.85rem;">Aterrizaje clínico</h4>
                    <div style="display: grid; gap: 0.5rem;">
                        <input type="text" id="cielo-contexto" class="input-field" placeholder="¿Dónde aparece esto en tu vida cotidiana?" value="${state.persistence.grounding?.cielo?.contexto || ''}">
                        <input type="text" id="cielo-aprendizaje" class="input-field" placeholder="¿Qué notaste al observar desde afuera?" value="${state.persistence.grounding?.cielo?.aprendizaje || ''}">
                        <input type="text" id="cielo-accion" class="input-field" placeholder="Aunque esté el clima, ¿qué elegís hacer?" value="${state.persistence.grounding?.cielo?.accion || ''}">
                    </div>
                </div>
            </div>
        `;

        attachGuideBadgeEvents();

        // Slower cloud animation for mobile/clinical use
        anime({
            targets: '.cloud-item',
            translateX: () => [0, anime.random(-20, 20)],
            translateY: () => [0, anime.random(-10, 10)],
            duration: 10000,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine'
        });

        ['contexto', 'aprendizaje', 'accion'].forEach((key) => {
            const el = document.getElementById(`cielo-${key}`);
            el?.addEventListener('input', (e) => {
                state.persistence.grounding ??= { hojas: { contexto: '', aprendizaje: '', accion: '' }, cielo: { contexto: '', aprendizaje: '', accion: '' } };
                state.persistence.grounding.cielo[key] = e.target.value;
                saveState();
            });
        });

        document.getElementById('weather-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const text = e.target.value.trim();
                if (text) {
                    state.persistence.weather.push({ text, x: 20 + Math.random() * 60, y: 10 + Math.random() * 60 });
                    saveState();
                    internalRender();
                }
            }
        });
    };
    internalRender();
}
