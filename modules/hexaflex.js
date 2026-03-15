/**
 * ACT In-Session - Hexaflex Module
 */

import { state } from '../core/state.js';
import { animateHexaflexEntrance } from '../core/animations.js';

export function renderHexaflexModule(container, { modules, loadModule, renderHome, togglePause }) {
    const points = [
        { id: 'abrirse', title: 'Abrirse', icon: 'lock-open', color: 'var(--hex-abrirse)', angle: -90, pillar: 'open' },
        { id: 'presente', title: 'Presente', icon: 'wind', color: 'var(--hex-presente)', angle: -30, pillar: 'centered' },
        { id: 'yo', title: 'Yo', icon: 'eye', color: 'var(--hex-yo)', angle: 30, pillar: 'centered' },
        { id: 'importa', title: 'Valores', icon: 'target', color: 'var(--hex-valores)', angle: 90, pillar: 'engaged' },
        { id: 'accion', title: 'Acción', icon: 'check-circle', color: 'var(--hex-accion)', angle: 150, pillar: 'engaged' },
        { id: 'analisis', title: 'Análisis', icon: 'search', color: 'var(--hex-analisis)', angle: 210, pillar: 'open' },
        { id: 'resumen', title: 'Resumen', icon: 'clipboard', color: 'var(--color-primary)', isSpecial: true }
    ];

    const processPoints = points.filter(p => !p.isSpecial);
    const centerX = 200, centerY = 200, radius = 135;
    const getCoords = (angle, r) => ({
        x: centerX + r * Math.cos((angle * Math.PI) / 180),
        y: centerY + r * Math.sin((angle * Math.PI) / 180)
    });

    const pillars = {
        open: { label: 'Abierto', color: 'var(--hex-abrirse)', points: ['abrirse', 'analisis'] },
        centered: { label: 'Centrado', color: 'var(--hex-presente)', points: ['presente', 'yo'] },
        engaged: { label: 'Comprometido', color: 'var(--hex-valores)', points: ['importa', 'accion'] }
    };

    container.innerHTML = `
        <div class="module-view" role="main" aria-labelledby="main-heading">
            <header>
                <div class="brand">ACT In-Session</div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-ghost" id="btn-pause" aria-label="Pausar sesión">⏸</button>
                    <button class="btn-ghost" id="btn-back">Finalizar</button>
                </div>
            </header>

            <section class="glass-card" style="text-align: center; margin-bottom: 2rem;">
                <h2 id="main-heading" style="font-size: 1.5rem; color: var(--color-primary);">Procesos ACT</h2>
                <p class="clinical-note">Propiciando flexibilidad psicológica en el consultante.</p>
            </section>

            <nav class="view-switch" aria-label="Cambiar vista de procesos">
                <button class="btn-toggle ${state.viewMode === 'hexaflex' ? 'active' : ''}" id="toggle-hex">Hexaflex</button>
                <button class="btn-toggle ${state.viewMode === 'triflex' ? 'active' : ''}" id="toggle-tri">Triflex</button>
            </nav>

            <div class="hexaflex-container">
                <svg viewBox="0 0 400 400" class="hexaflex-svg" role="img" aria-label="Diagrama interactivo de procesos ACT">
                    <defs>
                        <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.3" />
                            <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0" />
                        </radialGradient>
                        ${points.map(p => `
                            <linearGradient id="grad-${p.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="${p.color}" stop-opacity="0.8" />
                                <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0.2" />
                            </linearGradient>
                        `).join('')}
                    </defs>

                    ${state.viewMode === 'triflex' ? `
                        ${Object.values(pillars).map(p => {
        const p1 = points.find(pt => pt.id === p.points[0]);
        const p2 = points.find(pt => pt.id === p.points[1]);
        const c1 = getCoords(p1.angle, radius);
        const c2 = getCoords(p2.angle, radius);
        return `
                                <g class="triflex-group">
                                    <path d="M ${centerX} ${centerY} L ${c1.x} ${c1.y} L ${c2.x} ${c2.y} Z" fill="${p.color}" fill-opacity="0.05" />
                                    <line x1="${c1.x}" y1="${c1.y}" x2="${c2.x}" y2="${c2.y}" class="triflex-pillar" stroke="${p.color}" />
                                    <text x="${(c1.x + c2.x) / 2}" y="${(c1.y + c2.y) / 2}" class="hex-label" style="fill: ${p.color}; font-size: 10px; opacity: 0.6;">${p.label}</text>
                                </g>
                            `;
    }).join('')}
                    ` : `
                        <polygon points="${processPoints.map(p => {
        const c = getCoords(p.angle, radius);
        return `${c.x},${c.y}`;
    }).join(' ')}" class="hex-line" style="stroke-dasharray: none; opacity: 0.15;" />
                        
                        ${processPoints.map((p, i) => {
        const target = processPoints[(i + 1) % processPoints.length];
        const start = getCoords(p.angle, radius);
        const end = getCoords(target.angle, radius);
        return `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" class="hex-line-gradient" stroke="url(#grad-${p.id})" />`;
    }).join('')}
                    `}

                    <!-- Core -->
                    <g class="pulse-center">
                        <circle cx="${centerX}" cy="${centerY}" r="60" fill="url(#centerGradient)" />
                        <circle cx="${centerX}" cy="${centerY}" r="42" fill="var(--color-bg)" stroke="var(--color-primary)" stroke-width="2" />
                        <text x="${centerX}" y="${centerY + 5}" text-anchor="middle" fill="var(--color-primary)" style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Flexible</text>
                    </g>

                    ${points.filter(p => !p.isSpecial).map(p => {
        const c = getCoords(p.angle, radius);
        const labelAngle = p.angle;
        const labelDist = radius + 55;
        const labelC = getCoords(labelAngle, labelDist);

        return `
                            <g class="hex-vertex animate-entrance" data-target="${p.id}" role="button" aria-label="Proceso: ${p.title}" tabindex="0" style="color: ${p.color};">
                                <circle cx="${c.x}" cy="${c.y}" r="22" fill="var(--color-bg)" stroke="currentColor" stroke-width="2" />
                                <foreignObject x="${c.x - 12}" y="${c.y - 12}" width="24" height="24">
                                    <div style="color: currentColor; display: flex; align-items: center; justify-content: center;">
                                        <i data-lucide="${p.icon}" style="width: 20px; height: 20px;"></i>
                                    </div>
                                </foreignObject>
                                <text x="${labelC.x}" y="${labelC.y}" class="hex-label" style="fill: ${p.color};">${p.title}</text>
                            </g>
                        `;
    }).join('')}
                </svg>
            </div>

            <div style="display: flex; justify-content: center; margin-top: 1rem;">
                <button class="btn-primary" id="btn-session-summary" style="background: var(--glass-bg); color: var(--color-primary); border: 1px solid var(--color-primary); box-shadow: none;">
                    📋 Ver Resumen de Sesión
                </button>
            </div>
        </div>
    `;

    // Event Listeners
    document.getElementById('toggle-hex')?.addEventListener('click', () => { state.viewMode = 'hexaflex'; renderHexaflexModule(container, { modules, loadModule, renderHome, togglePause }); });
    document.getElementById('toggle-tri')?.addEventListener('click', () => { state.viewMode = 'triflex'; renderHexaflexModule(container, { modules, loadModule, renderHome, togglePause }); });

    document.getElementById('btn-back')?.addEventListener('click', renderHome);
    document.getElementById('btn-pause')?.addEventListener('click', togglePause);
    document.getElementById('btn-session-summary')?.addEventListener('click', () => loadModule('resumen'));

    lucide.createIcons();
    animateHexaflexEntrance('.animate-entrance');

    document.querySelectorAll('.hex-vertex').forEach(vertex => {
        const handleAction = () => {
            const target = vertex.getAttribute('data-target');
            if (target) loadModule(target);
        };
        vertex.addEventListener('click', handleAction);
        vertex.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handleAction(); });
    });
}
