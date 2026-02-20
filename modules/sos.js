/**
 * ACT In-Session - SOS Module (Crisis Interaction)
 */

import { render5SentidosTool } from './presente.js';
import { animateBreathing } from '../core/animations.js';

export function renderSOSModule(container, { navigateToHome }) {
    let activeTool = 'breathing';
    let animation = null;
    const tools = [
        { id: 'breathing', title: 'Respiración', icon: '🫁' },
        { id: '54321', title: '5-4-3-2-1', icon: '🖐️' }
    ];

    const render = () => {
        container.innerHTML = `
            <div class="module-view animate-scale-in">
                <header class="tool-header" style="border-bottom: 2px solid var(--hex-sos); padding-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 1.5rem;">🆘</span>
                        <h2 style="font-size: 1.2rem; color: var(--hex-sos);">Módulo SOS</h2>
                    </div>
                    <button class="btn-ghost" id="btn-close-sos">Cerrar</button>
                </header>

                <nav class="tool-selector glass-card" style="display: flex; gap: 0.5rem; padding: 0.5rem; margin-top: 1rem; margin-bottom: 1.5rem;">
                    ${tools.map(t => `
                        <button class="btn-tool ${activeTool | 'active' === t.id ? 'active' : ''}" data-id="${t.id}" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex: 1; font-size: 0.85rem; padding: 0.5rem; border-radius: var(--radius-sm);">
                            <i data-lucide="${t.icon}" style="width: 1rem; height: 1rem;"></i>
                            <span>${t.title}</span>
                        </button>
                    `).join('')}
                </nav>

                <div id="sos-tool-container"></div>
            </div>
        `;

        document.getElementById('btn-close-sos').addEventListener('click', () => {
            if (animation) animation.pause();
            navigateToHome();
        });
        document.querySelectorAll('.btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                if (animation) animation.pause();
                activeTool = btn.dataset.id;
                render();
            });
        });

        const toolContainer = document.getElementById('sos-tool-container');
        if (activeTool === 'breathing') {
            let pattern = 'box'; // 'box', 'calm', 'relax'
            const patterns = {
                box: { label: 'Cuadrada (4-4-4-4)', text: 'Inhala, mantén, exhala, mantén.', times: [4000, 4000, 4000, 4000] },
                calm: { label: 'Calma (4-7-8)', text: 'Inhala (4), Mantén (7), Exhala (8).', times: [4000, 7000, 8000, 0] },
                relax: { label: 'Relajante (4-6)', text: 'Inhala (4), Exhala (6).', times: [4000, 0, 6000, 0] }
            };

            const renderBreathing = () => {
                const p = patterns[pattern];
                toolContainer.innerHTML = `
                    <div class="tool-content" style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 2rem;">
                        <div style="margin-bottom: 0.5rem;">
                            <h3 style="color: var(--hex-sos); font-size: 1.1rem; margin-bottom: 0.25rem;">${p.label}</h3>
                            <p class="clinical-note" id="breathing-text">${p.text}</p>
                        </div>

                        <div class="breathing-circle-container" style="position: relative; width: 200px; height: 200px; display: flex; align-items: center; justify-content: center;">
                            <div class="switch-aura active" style="inset: -40px; background: radial-gradient(circle, var(--hex-sos) 0%, transparent 70%); opacity: 0.2;"></div>
                            <div class="breathing-circle" id="sos-breathing-circle" style="width: 80px; height: 80px; background: var(--hex-sos); border-radius: 50%; box-shadow: 0 0 50px var(--hex-sos); opacity: 0.8; transition: all 1s ease;"></div>
                        </div>

                        <div class="pattern-selector" style="display: flex; gap: 0.5rem; width: 100%;">
                            ${Object.entries(patterns).map(([id, pat]) => `
                                <button class="btn-toggle flex-1 ${pattern === id ? 'active' : ''}" data-pattern="${id}" style="font-size: 0.7rem;">
                                    ${pat.label.split(' ')[0]}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;

                if (animation) animation.pause();

                // Advanced breathing logic with anime.js
                const animateStep = () => {
                    const steps = patterns[pattern].times;
                    const tl = anime.timeline({
                        loop: true,
                        update: (anim) => {
                            const progress = anim.progress;
                            const circle = document.getElementById('sos-breathing-circle');
                            if (!circle) return;

                            // Simple phase indicator logic could go here
                        }
                    });

                    // Inhale
                    tl.add({
                        targets: '#sos-breathing-circle',
                        scale: [0.6, 1.4],
                        duration: steps[0],
                        easing: 'easeInOutSine'
                    });

                    // Hold (if applicable)
                    if (steps[1] > 0) {
                        tl.add({
                            targets: '#sos-breathing-circle',
                            scale: 1.4,
                            duration: steps[1],
                            easing: 'linear'
                        });
                    }

                    // Exhale
                    tl.add({
                        targets: '#sos-breathing-circle',
                        scale: [1.4, 0.6],
                        duration: steps[2],
                        easing: 'easeInOutSine'
                    });

                    // Hold (if applicable)
                    if (steps[3] > 0) {
                        tl.add({
                            targets: '#sos-breathing-circle',
                            scale: 0.6,
                            duration: steps[3],
                            easing: 'linear'
                        });
                    }
                    animation = tl;
                };
                animateStep();

                toolContainer.querySelectorAll('[data-pattern]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        pattern = btn.dataset.pattern;
                        renderBreathing();
                    });
                });
            };
            renderBreathing();
        } else {
            render5SentidosTool(toolContainer);
        }
    };
    render();
}
