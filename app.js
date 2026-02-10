/**
 * ACT In-Session Instrument v1.0
 * Main Application Logic
 */

const getDefaultSession = () => ({
    date: new Date().toISOString(),
    thoughts: [],
    weather: [],
    diana: [
        { id: 'work', label: 'Trabajo / Educación', x: 0, y: 0 },
        { id: 'relationships', label: 'Relaciones', x: 0, y: 0 },
        { id: 'personal', label: 'Personal / Salud', x: 0, y: 0 },
        { id: 'leisure', label: 'Ocio / Social', x: 0, y: 0 }
    ],
    matrix: { top_left: [], top_right: [], bottom_left: [], bottom_right: [] },
    smart: { S: '', M: '', A: '', R: '', T: '' },
    fear: { F: '', E: '', A: '', R: '' },
    dare: { D: '', A: '', R: '', E: '' },
    dots: { D: '', O: '', T: '', S: '' }
});

const state = {
    currentModule: 'dashboard', // dashboard, idle, active, sos
    activeModuleId: null,
    theme: 'dark',
    viewMode: 'hexaflex',
    currentPatientId: localStorage.getItem('act_current_patient_id') || null,
    patients: JSON.parse(localStorage.getItem('act_patients')) || [],
    persistence: getDefaultSession()
};

// Load last patient's active session if exists
if (state.currentPatientId) {
    const patient = state.patients.find(p => p.id === state.currentPatientId);
    if (patient && patient.currentSession) {
        state.persistence = patient.currentSession;
        state.currentModule = 'idle'; // Direct to home if patient active
    }
}

function saveState() {
    if (!state.currentPatientId) return;

    const patientIndex = state.patients.findIndex(p => p.id === state.currentPatientId);
    if (patientIndex !== -1) {
        state.patients[patientIndex].currentSession = state.persistence;
        localStorage.setItem('act_patients', JSON.stringify(state.patients));
    }
}



const modules = [
    { id: 'hexaflex', title: 'Hexaflex', icon: '🧭', color: '#f59e0b' },
    { id: 'abrirse', title: 'Abrirse', icon: '🔓', color: 'var(--hex-abrirse)' },
    { id: 'presente', title: 'Presente', icon: '🧘', color: 'var(--hex-presente)' },
    { id: 'yo', title: 'Yo Observador', icon: '👁️', color: 'var(--hex-yo)' },
    { id: 'importa', title: 'Valores', icon: '🎯', color: 'var(--hex-valores)' },
    { id: 'accion', title: 'Acción Comprometida', icon: '✅', color: 'var(--hex-accion)' },
    { id: 'analisis', title: 'Análisis Funcional', icon: '🔍', color: 'var(--hex-analisis)' }
];

const mainContent = document.getElementById('main-content');
const themeToggle = document.getElementById('theme-toggle');

/**
 * Initialize the App
 */
function init() {
    if (state.currentModule === 'dashboard' || !state.currentPatientId) {
        renderDashboard();
    } else {
        renderHome();
    }
    setupEventListeners();
    renderSOSButton();
}



function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.currentModule === 'active') {
            togglePause();
        } else if (e.key === 'Escape' && state.currentModule === 'paused') {
            togglePause();
        }
    });
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', state.theme);
}

/**
 * Global State Controls
 */
function togglePause() {
    const overlay = document.getElementById('pause-overlay');
    if (!overlay) {
        createPauseOverlay();
        return togglePause();
    }

    if (state.currentModule === 'active') {
        state.currentModule = 'paused';
        overlay.classList.remove('hidden');
    } else if (state.currentModule === 'paused') {
        state.currentModule = 'active';
        overlay.classList.add('hidden');
    }
}

function createPauseOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'pause-overlay';
    overlay.className = 'hidden';
    overlay.innerHTML = `
        <div class="pause-title">Sesión en Pausa</div>
        <p class="pause-hint">La herramienta ha sido pausada momentáneamente.</p>
        <button class="btn-primary" id="btn-resume">Reanudar</button>
        <button class="btn-ghost" id="btn-exit-global">Finalizar Sesion</button>
        <button class="btn-ghost" id="btn-clear-session" style="color: var(--color-danger); margin-top: 1rem;">Borrar Datos de Sesión</button>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btn-resume').addEventListener('click', togglePause);
    document.getElementById('btn-exit-global').addEventListener('click', () => {
        togglePause();
        renderHome();
    });
    document.getElementById('btn-clear-session').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas borrar todos los datos de la sesión actual?')) {
            localStorage.removeItem('act_session_state');
            location.reload();
        }
    });
}

/**
 * Toast Notification Helper
 */
function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// HELPER: Render Module Header
function renderModuleHeader(module, options = {}) {
    const { showSave = true, backAction = renderHome } = options;

    return `
        <header class="tool-header">
            <div class="title-group">
                <button class="btn-ghost" id="btn-back">←</button>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.5rem;">${module.icon}</span>
                    <h2 style="font-size: 1.2rem; font-weight: 700;">${module.title}</h2>
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                ${showSave ? '<button class="btn-ghost" id="btn-global-save" style="font-size: 0.75rem; color: var(--color-primary);">💾 Guardar Ahora</button>' : ''}
                <button class="btn-ghost" id="btn-close-module">Finalizar</button>
            </div>
        </header>
    `;
}

function attachHeaderEvents(backAction = renderHome) {
    document.getElementById('btn-back').addEventListener('click', backAction);
    document.getElementById('btn-close-module').addEventListener('click', renderHome);

    const saveBtn = document.getElementById('btn-global-save');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveState();
            showToast('✓ Sesión Guardada');
        });
    }
}


/**
 * SOS Global Button
 */
function renderSOSButton() {
    let btn = document.getElementById('btn-sos');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'btn-sos';
        btn.innerHTML = '🆘';
        btn.title = 'Módulo SOS / Crisis';
        document.body.appendChild(btn);
    }
    btn.addEventListener('click', () => {
        renderSOSModule();
    });
}


/**
 * Render Home Screen (Module Selector)
 */
function renderHome() {
    renderHexaflexLanding();
}

/**
 * Load a Clinical Module
 */
function loadModule(id) {
    const module = modules.find(m => m.id === id);
    if (!module) return;

    state.currentModule = id === 'hexaflex' ? 'idle' : 'active';
    state.activeModuleId = id;

    if (id === 'abrirse') {
        renderAbrirseModule(module);
    } else if (id === 'hexaflex') {
        renderHexaflexModule(module);
    } else if (id === 'presente') {
        renderEstarPresenteModule(module);
    } else if (id === 'yo') {
        renderEstarPresenteModule(module); // Shared for now or add specific tool
    } else if (id === 'importa') {
        renderHacerLoQueImportaModule(module);
    } else if (id === 'accion') {
        renderHacerLoQueImportaModule(module); // Shared for now or add specific tool
    } else if (id === 'analisis') {
        renderAnalisisModule(module);
    } else if (id === 'resumen') {
        renderResumenModule();
    } else {
        renderPlaceholderModule(module);
    }
}


/**
 * MODULE: Hexaflex/Triflex (Central Navigator)
 */
function renderHexaflexModule(module, options = {}) {
    const { showControls = true, isLanding = false } = options;

    const points = [
        { id: 'abrirse', title: 'Abrirse', icon: '🔓', color: 'var(--hex-abrirse)', angle: -90, pillar: 'open' },
        { id: 'presente', title: 'Presente', icon: '🧘', color: 'var(--hex-presente)', angle: -30, pillar: 'centered' },
        { id: 'yo', title: 'Yo', icon: '👁️', color: 'var(--hex-yo)', angle: 30, pillar: 'centered' },
        { id: 'importa', title: 'Valores', icon: '🎯', color: 'var(--hex-valores)', angle: 90, pillar: 'engaged' },
        { id: 'accion', title: 'Acción', icon: '✅', color: 'var(--hex-accion)', angle: 150, pillar: 'engaged' },
        { id: 'analisis', title: 'Análisis', icon: '🔍', color: 'var(--hex-analisis)', angle: 210, pillar: 'open' },
        { id: 'resumen', title: 'Resumen', icon: '📋', color: 'var(--color-primary)', isSpecial: true }
    ];


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

    mainContent.innerHTML = `
        <div class="module-view" role="main" aria-labelledby="main-heading">
            <header>
                <div class="brand">ACT In-Session</div>
                ${showControls ? `
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn-ghost" id="btn-pause" aria-label="Pausar sesión">⏸</button>
                        <button class="btn-ghost" id="btn-back">Finalizar</button>
                    </div>
                ` : ''}
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
                    ${state.viewMode === 'triflex' ? `
                        <!-- Triflex Pillars (Visual Grouping) -->
                        ${Object.values(pillars).map(p => {
        const p1 = points.find(pt => pt.id === p.points[0]);
        const p2 = points.find(pt => pt.id === p.points[1]);
        const c1 = getCoords(p1.angle, radius);
        const c2 = getCoords(p2.angle, radius);
        return `
                                <g class="triflex-group">
                                    <line x1="${c1.x}" y1="${c1.y}" x2="${c2.x}" y2="${c2.y}" class="triflex-pillar" stroke="${p.color}" />
                                    <text x="${(c1.x + c2.x) / 2}" y="${(c1.y + c2.y) / 2}" class="hex-label" style="fill: ${p.color}; font-size: 10px; opacity: 0.6;">${p.label}</text>
                                </g>
                            `;
    }).join('')}
                    ` : `
                        <!-- Hexaflex Web -->
                        <polygon points="${points.map(p => {
        const c = getCoords(p.angle, radius);
        return `${c.x},${c.y}`;
    }).join(' ')}" fill="none" class="hex-line" />
                        
                        ${points.map((p, i) => {
        const target = points[(i + 2) % points.length];
        const start = getCoords(p.angle, radius);
        const end = getCoords(target.angle, radius);
        return `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" class="hex-line" opacity="0.3" />`;
    }).join('')}
                    `}

                    <!-- Center Label -->
                    <circle cx="${centerX}" cy="${centerY}" r="45" fill="var(--color-bg)" stroke="var(--color-primary)" stroke-width="2" />
                    <text x="${centerX}" y="${centerY + 5}" text-anchor="middle" fill="var(--color-primary)" style="font-size: 11px; font-weight: 800; text-transform: uppercase;">Flexible</text>

                    <!-- Navigable Vertices -->
                    ${points.filter(p => !p.isSpecial).map(p => {
        const c = getCoords(p.angle, radius);
        const labelAngle = p.angle;
        const labelDist = radius + 55;
        const labelC = getCoords(labelAngle, labelDist);

        return `
                            <g class="hex-vertex" data-target="${p.id}" role="button" aria-label="Proceso: ${p.title}" tabindex="0" style="color: ${p.color};">
                                <circle cx="${c.x}" cy="${c.y}" r="18" fill="var(--color-bg)" stroke="currentColor" stroke-width="2" />
                                <text x="${c.x}" y="${c.y + 7}" text-anchor="middle" style="font-size: 18px;">${p.icon}</text>
                                <text x="${labelC.x}" y="${labelC.y}" class="hex-label">${p.title}</text>
                            </g>
                        `;
    }).join('')}
                </svg>
            </div>

            ${isLanding ? `
                <div style="display: flex; justify-content: center; margin-top: 1rem;">
                    <button class="btn-primary" id="btn-session-summary" style="background: var(--glass-bg); color: var(--color-primary); border: 1px solid var(--color-primary); box-shadow: none;">
                        📋 Ver Resumen de Sesión
                    </button>
                </div>
            ` : ''}

            
            <footer class="disclaimer">
                Accesible via teclado (Tab) • Contraste verificado
            </footer>
        </div>
    `;

    // Event Listeners
    document.getElementById('toggle-hex')?.addEventListener('click', () => { state.viewMode = 'hexaflex'; renderHexaflexModule(module, options); });
    document.getElementById('toggle-tri')?.addEventListener('click', () => { state.viewMode = 'triflex'; renderHexaflexModule(module, options); });

    const backButton = document.getElementById('btn-back');
    if (backButton) backButton.addEventListener('click', renderHome);

    const pauseButton = document.getElementById('btn-pause');
    if (pauseButton) pauseButton.addEventListener('click', togglePause);

    const summaryButton = document.getElementById('btn-session-summary');
    if (summaryButton) summaryButton.addEventListener('click', () => loadModule('resumen'));


    document.querySelectorAll('.hex-vertex').forEach(vertex => {
        const handleAction = () => {
            const target = vertex.getAttribute('data-target');
            if (target) loadModule(target);
        };
        vertex.addEventListener('click', handleAction);
        vertex.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handleAction(); });
    });
}

function renderHexaflexLanding() {
    state.currentModule = 'idle';
    state.activeModuleId = null;
    const module = modules.find(m => m.id === 'hexaflex');
    if (!module) return;
    renderHexaflexModule(module, { showControls: false, isLanding: true });
}

/**
 * MODULE: Análisis (Functional Analysis)
 */
function renderAnalisisModule(module) {
    const tools = [
        { id: 'matrix', title: 'Matrix Swipe', icon: '🔲' },
        { id: 'dots', title: 'DOTS', icon: '📋' }
    ];

    let activeToolId = 'matrix';

    const render = () => {
        mainContent.innerHTML = `
            <div class="module-view animate-slide-up">
                ${renderModuleHeader(module)}

                <div class="tool-selector glass-card" style="display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: var(--radius-md); margin-bottom: 2rem;">
                    ${tools.map(t => `
                        <button class="btn-tool ${activeToolId === t.id ? 'active' : ''}" data-id="${t.id}" style="flex: 1; font-size: 0.85rem; padding: 0.5rem 1rem; border-radius: var(--radius-sm);">
                            ${t.icon} ${t.title}
                        </button>
                    `).join('')}
                </div>

                <div id="tool-container"></div>
            </div>
        `;

        attachHeaderEvents();
        document.querySelectorAll('.btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                activeToolId = btn.getAttribute('data-id');
                render();
            });
        });

        const container = document.getElementById('tool-container');
        if (activeToolId === 'matrix') {
            renderMatrixTool(container);
        } else if (activeToolId === 'dots') {
            renderDOTSTool(container);
        }
    };

    render();
}


/**
 * MODULE: Hacer lo que Importa (Values / Committed Action)
 */
function renderHacerLoQueImportaModule(module) {
    const tools = [
        { id: 'diana', title: 'Diana (Target)', icon: '🎯' },
        { id: 'smart', title: 'SMART-ACT', icon: '📝' },
        { id: 'dare', title: 'FEAR → DARE', icon: '🚀' }
    ];

    let activeToolId = 'diana';

    const render = () => {
        mainContent.innerHTML = `
            <div class="module-view animate-slide-up">
                ${renderModuleHeader(module)}

                <div class="tool-selector glass-card" style="display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    ${tools.map(t => `
                        <button class="btn-tool ${activeToolId === t.id ? 'active' : ''}" data-id="${t.id}" style="flex: 0 0 auto; font-size: 0.85rem; padding: 0.5rem 1rem; border-radius: var(--radius-sm); white-space: nowrap;">
                            ${t.icon} ${t.title}
                        </button>
                    `).join('')}
                </div>

                <div id="tool-container"></div>
            </div>
        `;

        attachHeaderEvents();
        document.querySelectorAll('.btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                activeToolId = btn.getAttribute('data-id');
                render();
            });
        });

        const container = document.getElementById('tool-container');
        if (activeToolId === 'diana') {
            renderDianaTool(container);
        } else if (activeToolId === 'smart') {
            renderSMARTTool(container);
        } else if (activeToolId === 'dare') {
            renderDARETool(container);
        }
    };

    render();
}


/**
 * MODULE: Estar Presente (Contact with Present)
 */
function renderEstarPresenteModule(module) {
    const tools = [
        { id: 'stop', title: 'STOP', icon: '🛑' },
        { id: 'sentidos', title: '5 Sentidos', icon: '🖐️' },
        { id: 'cielo', title: 'Cielo y Clima', icon: '☁️' }
    ];

    let activeToolId = 'stop';

    const render = () => {
        mainContent.innerHTML = `
            <div class="module-view animate-slide-up">
                ${renderModuleHeader(module)}

                <div class="tool-selector glass-card" style="display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    ${tools.map(t => `
                        <button class="btn-tool ${activeToolId === t.id ? 'active' : ''}" data-id="${t.id}" style="flex: 0 0 auto; font-size: 0.85rem; padding: 0.5rem 1rem; border-radius: var(--radius-sm); white-space: nowrap;">
                            ${t.icon} ${t.title}
                        </button>
                    `).join('')}
                </div>

                <div id="tool-container"></div>
            </div>
        `;

        attachHeaderEvents();
        document.querySelectorAll('.btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                activeToolId = btn.getAttribute('data-id');
                render();
            });
        });

        const container = document.getElementById('tool-container');
        if (activeToolId === 'stop') {
            renderSTOPTool(container);
        } else if (activeToolId === 'sentidos') {
            render5SentidosTool(container);
        } else if (activeToolId === 'cielo') {
            renderCieloYClimaTool(container);
        }
    };

    render();
}


/**
 * MODULE: Abrirse (Defusion / Acceptance)
 */
function renderAbrirseModule(module) {
    const tools = [
        { id: 'visualizador', title: 'Visualizador de Pensamientos', icon: '🧠' },
        { id: 'radio', title: 'Radio Doom & Gloom', icon: '📻' },
        { id: 'lucha', title: 'Interruptor de la Lucha', icon: '⏻' }
    ];

    let activeToolId = 'visualizador';

    const render = () => {
        mainContent.innerHTML = `
            <div class="module-view animate-slide-up">
                ${renderModuleHeader(module)}

                <div class="tool-selector glass-card" style="display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    ${tools.map(t => `
                        <button class="btn-tool ${activeToolId === t.id ? 'active' : ''}" data-id="${t.id}" style="flex: 0 0 auto; font-size: 0.85rem; padding: 0.5rem 1rem; border-radius: var(--radius-sm); white-space: nowrap;">
                            ${t.icon} ${t.title.split(' ')[0]}
                        </button>
                    `).join('')}
                </div>

                <div id="tool-container"></div>
            </div>
        `;

        attachHeaderEvents();
        document.querySelectorAll('.btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                activeToolId = btn.getAttribute('data-id');
                render();
            });
        });

        const container = document.getElementById('tool-container');
        if (activeToolId === 'visualizador') {
            renderVisualizadorPensamientosTool(container);
        } else if (activeToolId === 'radio') {
            renderRadioDoomGloomTool(container);
        } else if (activeToolId === 'lucha') {
            renderInterruptorLuchaTool(container);
        }
    };

    render();
}


/**
 * TOOL: Visualizador de Pensamientos
 */
function renderVisualizadorPensamientosTool(container) {
    let selectedThoughtIndex = null;
    let selectedColor = '#ffffff';
    let selectedSize = '0.9rem';

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">Visualizador de Pensamientos</h3>
                    <p style="font-size: 0.8rem; color: var(--color-text-secondary);">Externaliza tus pensamientos y experimenta con su forma.</p>
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

                <div id="thoughts-list" style="height: 400px; padding: 1.5rem; border: 2px dashed var(--glass-border); border-radius: var(--radius-lg); position: relative; background: rgba(0,0,0,0.1); overflow: hidden;">
                    ${state.persistence.thoughts.length === 0 ? '<p style="color: var(--color-text-secondary); font-size: 0.8rem; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">Externaliza tus pensamientos aquí.</p>' : ''}
                    ${state.persistence.thoughts.map((t, i) => `
                        <div class="thought-item glass animate-scale-in ${selectedThoughtIndex === i ? 'selected' : ''}" 
                             data-index="${i}" 
                             style="position: absolute; left: ${t.x ?? (20 + (i % 3) * 30)}%; top: ${t.y ?? (20 + Math.floor(i / 3) * 20)}%; 
                                    padding: 0.75rem 1.25rem; border-radius: 20px; font-size: ${t.size || '0.9rem'}; color: ${t.color || 'white'}; 
                                    border: 2px solid ${selectedThoughtIndex === i ? 'var(--color-primary)' : (t.color || 'var(--glass-border)') + '22'}; 
                                    opacity: ${t.opacity ?? 1}; filter: blur(${t.blur ?? 0}px); cursor: move; user-select: none; z-index: ${selectedThoughtIndex === i ? 100 : 10}; transition: border 0.2s, box-shadow 0.2s;">
                            ${t.text || t}
                        </div>
                    `).join('')}
                </div>

                <!-- NEW: Property Panel -->
                <div id="property-panel" class="glass" style="margin-top: 1rem; padding: 1rem; border-radius: var(--radius-md); display: ${selectedThoughtIndex !== null ? 'flex' : 'none'}; flex-direction: column; gap: 1rem; animation: slideUp 0.3s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h4 style="font-size: 0.85rem; font-weight: bold; color: var(--color-primary);">Propiedades del Pensamiento</h4>
                        <button class="btn-ghost" id="btn-delete-thought" style="color: #ef4444; font-size: 0.75rem;">Eliminar ×</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-size: 0.7rem; color: var(--color-text-secondary);">DISTANCIAMIENTO (Blur)</label>
                            <input type="range" id="prop-blur" min="0" max="8" step="0.5" value="${state.persistence.thoughts[selectedThoughtIndex]?.blur || 0}" class="slider-act">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-size: 0.7rem; color: var(--color-text-secondary);">PRESENCIA (Opacidad)</label>
                            <input type="range" id="prop-opacity" min="0.1" max="1" step="0.1" value="${state.persistence.thoughts[selectedThoughtIndex]?.opacity || 1}" class="slider-act">
                        </div>
                    </div>

                    <div style="display: flex; justify-content: center; gap: 1rem;">
                        <div class="color-picker-mini" style="display: flex; gap: 0.4rem;">
                            ${['#ffffff', '#ef4444', '#3b82f6', '#f59e0b', '#10b981'].map(c => `
                                <div class="prop-color-swatch" data-color="${c}" style="width: 18px; height: 18px; border-radius: 50%; background: ${c}; cursor: pointer; border: 2px solid ${state.persistence.thoughts[selectedThoughtIndex]?.color === c ? 'white' : 'transparent'};"></div>
                            `).join('')}
                        </div>
                        <div style="width: 1px; background: var(--glass-border);"></div>
                        <div class="size-picker-mini" style="display: flex; gap: 0.25rem;">
                            ${['0.7rem', '0.9rem', '1.2rem'].map(s => `
                                <button class="btn-toggle-mini ${state.persistence.thoughts[selectedThoughtIndex]?.size === s ? 'active' : ''}" data-size="${s}" style="font-size: 0.6rem; padding: 0.2rem 0.4rem;">
                                    ${s === '0.7rem' ? 'P' : s === '0.9rem' ? 'M' : 'G'}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 1.5rem; display: flex; justify-content: center; opacity: 0.5;">
                    <button class="btn-ghost" id="btn-reset-v" style="font-size: 0.75rem;">Limpiar Todo</button>
                </div>
            </div>
        `;

        // Selection & Drag
        const board = document.getElementById('thoughts-list');
        board.addEventListener('click', (e) => {
            if (e.target === board) {
                selectedThoughtIndex = null;
                internalRender();
            }
        });

        document.querySelectorAll('.thought-item').forEach(el => {
            let isDragging = false;
            let startX, startY;

            el.addEventListener('mousedown', (e) => {
                selectedThoughtIndex = parseInt(el.dataset.index);
                isDragging = true;
                startX = e.clientX - el.offsetLeft;
                startY = e.clientY - el.offsetTop;
                el.style.transition = 'none'; // Disable transition while dragging
                internalRender(); // To show property panel
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;

                const rect = board.getBoundingClientRect();
                let x = e.clientX - rect.left - (el.offsetWidth / 2);
                let y = e.clientY - rect.top - (el.offsetHeight / 2);

                // Clamp x and y to stay within board boundaries
                x = Math.max(0, Math.min(x, rect.width - el.offsetWidth));
                y = Math.max(0, Math.min(y, rect.height - el.offsetHeight));

                // Convert to percentage for persistence
                const px = (x / rect.width) * 100;
                const py = (y / rect.height) * 100;

                el.style.left = `${px}%`;
                el.style.top = `${py}%`;
            });

            window.addEventListener('mouseup', () => {
                if (!isDragging) return;
                isDragging = false;
                const index = parseInt(el.dataset.index);

                state.persistence.thoughts[index].x = parseFloat(el.style.left);
                state.persistence.thoughts[index].y = parseFloat(el.style.top);

                saveState();
                el.style.transition = 'all 0.3s ease'; // Re-enable
            });
        });

        if (selectedThoughtIndex !== null) {
            const t = state.persistence.thoughts[selectedThoughtIndex];

            document.getElementById('prop-blur').addEventListener('input', (e) => {
                t.blur = parseFloat(e.target.value);
                const itemEl = document.querySelector(`.thought-item[data-index="${selectedThoughtIndex}"]`);
                if (itemEl) itemEl.style.filter = `blur(${t.blur}px)`;
                saveState();
            });

            document.getElementById('prop-opacity').addEventListener('input', (e) => {
                t.opacity = parseFloat(e.target.value);
                const itemEl = document.querySelector(`.thought-item[data-index="${selectedThoughtIndex}"]`);
                if (itemEl) itemEl.style.opacity = t.opacity;
                saveState();
            });

            document.getElementById('btn-delete-thought').addEventListener('click', () => {
                state.persistence.thoughts.splice(selectedThoughtIndex, 1);
                selectedThoughtIndex = null;
                saveState();
                internalRender();
            });

            document.querySelectorAll('.prop-color-swatch').forEach(sw => {
                sw.addEventListener('click', () => {
                    t.color = sw.dataset.color;
                    saveState();
                    internalRender();
                });
            });

            document.querySelectorAll('.btn-toggle-mini').forEach(btn => {
                btn.addEventListener('click', () => {
                    t.size = btn.dataset.size;
                    saveState();
                    internalRender();
                });
            });
        }

        // Global Style Pickers
        document.querySelectorAll('.color-swatch').forEach(sw => {
            sw.addEventListener('click', () => { selectedColor = sw.dataset.color; internalRender(); });
        });
        document.querySelectorAll('[data-size]').forEach(btn => {
            btn.addEventListener('click', () => { selectedSize = btn.dataset.size; internalRender(); });
        });

        document.getElementById('btn-reset-v').addEventListener('click', () => {
            if (confirm('¿Eliminar todos los pensamientos?')) {
                state.persistence.thoughts = [];
                selectedThoughtIndex = null;
                saveState();
                internalRender();
            }
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

        btnAdd.addEventListener('click', addThought);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addThought();
        });
        input.focus();
    };

    internalRender();
}



/**
 * DASHBOARD: Patient Selection
 */
function renderDashboard() {
    state.currentModule = 'dashboard';
    mainContent.innerHTML = `
        <div class="dashboard-view animate-slide-up">
            <header class="dashboard-header" style="text-align: center; margin-bottom: 2.5rem;">
                <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--color-primary); margin-bottom: 0.5rem;">ACT In-Session</h1>
                <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Gestión de Consultantes y Sesiones</p>
            </header>

            <div class="patient-manager glass-card" style="padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.1rem; font-weight: 600;">Consultantes</h2>
                    <button class="btn-primary" id="btn-add-patient" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">+ Nuevo</button>
                </div>

                <div id="patient-list" style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${state.patients.length === 0 ? `
                        <div style="text-align: center; padding: 2rem; color: var(--color-text-secondary); font-style: italic; font-size: 0.85rem;">
                            No hay pacientes registrados.
                        </div>
                    ` : state.patients.map(p => `
                        <div class="patient-item glass ${state.currentPatientId === p.id ? 'active' : ''}" 
                             data-id="${p.id}" 
                             style="padding: 1rem; border-radius: var(--radius-md); cursor: pointer; display: flex; justify-content: space-between; align-items: center; border: 1px solid ${state.currentPatientId === p.id ? 'var(--color-primary)' : 'var(--glass-border)'};">
                            <div>
                                <div style="font-weight: 600; font-size: 0.95rem;">${p.name}</div>
                                <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${p.history.length} sesiones previas</div>
                            </div>
                            ${state.currentPatientId === p.id ? '<span style="color: var(--color-primary);">● Seleccionado</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div id="session-controls" style="display: ${state.currentPatientId ? 'flex' : 'none'}; flex-direction: column; gap: 1rem;">
                <button class="btn-primary" id="btn-start-session" style="padding: 1.25rem;">Comenzar Nueva Sesión</button>
                ${state.patients.find(p => p.id === state.currentPatientId)?.currentSession ? `
                    <button class="btn-ghost" id="btn-resume-session" style="padding: 1rem; border: 1px solid var(--color-primary);">Continuar Sesión Pendiente</button>
                ` : ''}
                <button class="btn-ghost" id="btn-view-history" style="opacity: 0.7;">Ver Historial de Sesiones</button>
            </div>
        </div>
    `;

    // Event Listeners
    document.getElementById('btn-add-patient').addEventListener('click', () => {
        const name = prompt('Nombre del pacien/consultante:');
        if (name) {
            const newPatient = {
                id: 'p_' + Date.now(),
                name: name,
                history: [],
                currentSession: null
            };
            state.patients.push(newPatient);
            localStorage.setItem('act_patients', JSON.stringify(state.patients));
            renderDashboard();
        }
    });

    document.querySelectorAll('.patient-item').forEach(item => {
        item.addEventListener('click', () => {
            state.currentPatientId = item.dataset.id;
            localStorage.setItem('act_current_patient_id', state.currentPatientId);
            renderDashboard();
        });
    });

    if (state.currentPatientId) {
        document.getElementById('btn-start-session').addEventListener('click', () => {
            // If there's an active session, archive it first? No, let's just start fresh.
            const patient = state.patients.find(p => p.id === state.currentPatientId);
            if (patient.currentSession && confirm('Hay una sesión en curso. ¿Deseas guardarla en el historial e iniciar una nueva?')) {
                archiveCurrentSession(patient);
            }
            state.persistence = getDefaultSession();
            saveState();
            renderHome();
        });

        const resumeBtn = document.getElementById('btn-resume-session');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                const patient = state.patients.find(p => p.id === state.currentPatientId);
                state.persistence = patient.currentSession;
                renderHome();
            });
        }

        document.getElementById('btn-view-history').addEventListener('click', renderHistoryView);
    }
}

function archiveCurrentSession(patient) {
    if (patient.currentSession) {
        patient.history.push(patient.currentSession);
        patient.currentSession = null;
        localStorage.setItem('act_patients', JSON.stringify(state.patients));
    }
}

function renderHistoryView() {
    const patient = state.patients.find(p => p.id === state.currentPatientId);
    mainContent.innerHTML = `
        <div class="module-view animate-slide-up">
            <header class="tool-header">
                <div class="title-group">
                    <button class="btn-ghost" id="btn-back-dashboard">←</button>
                    <h2 style="font-size: 1.2rem; font-weight: 700;">Historial: ${patient.name}</h2>
                </div>
            </header>

            <div class="history-list" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
                ${patient.history.length === 0 ? '<p style="text-align: center; color: var(--color-text-secondary);">No hay sesiones registradas.</p>' :
            patient.history.map((s, idx) => `
                    <div class="glass-card" style="padding: 1rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600;">Sesión ${patient.history.length - idx}</div>
                            <div style="font-size: 0.8rem; color: var(--color-text-secondary);">${new Date(s.date).toLocaleDateString()}</div>
                        </div>
                        <button class="btn-ghost btn-view-old-summary" data-idx="${idx}" style="font-size: 0.8rem;">Ver Detalles</button>
                    </div>
                  `).reverse().join('')}
            </div>
        </div>
    `;

    document.getElementById('btn-back-dashboard').addEventListener('click', renderDashboard);

    document.querySelectorAll('.btn-view-old-summary').forEach(btn => {
        btn.addEventListener('click', () => {
            const session = patient.history[parseInt(btn.dataset.idx)];
            renderSessionDetail(session);
        });
    });
}

function renderSessionDetail(session) {
    // We can reuse renderResumenModule but it needs to take session as param
    // Refactoring renderResumenModule to be more flexible
    renderResumenModule(session);
}

/**
 * AUDIO ENGINE: Radio Static
 */
class RadioSound {
    constructor() {
        this.ctx = null;
        this.noise = null;
        this.gain = null;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Generate White Noise
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        this.noise = this.ctx.createBufferSource();
        this.noise.buffer = noiseBuffer;
        this.noise.loop = true;

        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0;

        this.noise.connect(this.gain);
        this.gain.connect(this.ctx.destination);
        this.noise.start();
    }

    setVolume(value) { // 0 to 1
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.gain.gain.setTargetAtTime(value * 0.1, this.ctx.currentTime, 0.05);
    }

    stop() {
        if (this.gain) this.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
}

const radioAudio = new RadioSound();

/**
 * TOOL: Radio Doom & Gloom
 */
function renderRadioDoomGloomTool(container) {
    let broadcast = '';
    let volume = 80;
    let tuning = 50;

    // Resume audio on interaction
    const startAudio = () => radioAudio.setVolume((100 - volume) / 100);

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
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.25rem;">Radio Doom & Gloom</h3>
                    <p style="font-size: 0.8rem; color: var(--color-text-secondary);">Sintonizando y distanciando la mente.</p>
                </div>

                <div class="radio-interface glass" style="padding: 1.5rem; border-radius: var(--radius-lg); border: 2px solid ${currentStation.color}88; background: rgba(0,0,0,0.2);">
                    <div class="radio-screen" style="background: #050a05; padding: 1.5rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-family: 'Courier New', monospace; color: ${currentStation.color}; min-height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                        <div class="noise-overlay" style="opacity: ${(100 - volume) / 200 + 0.05};"></div>
                        
                        <div style="font-size: 0.6rem; margin-bottom: 0.5rem; opacity: 0.7; letter-spacing: 2px;">${currentStation.label}</div>
                        
                        <div id="broadcast-text" style="font-size: 1.1rem; text-align: center; font-weight: bold; transition: all 0.2s ease; 
                             filter: blur(${(100 - volume) / 20}px); opacity: ${volume / 100};">
                            ${broadcast ? `"${broadcast}"` : 'BUSCANDO SEÑAL...'}
                        </div>

                        <div class="vu-meter" style="position: absolute; bottom: 8px; left: 12px; display: flex; height: 10px; align-items: flex-end;">
                            ${Array.from({ length: 8 }).map(() => `<div class="vu-bar" style="height: ${Math.random() * 100}%"></div>`).join('')}
                        </div>
                    </div>

                    <div class="radio-controls" style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <div class="input-group">
                            <input type="text" id="radio-input" class="input-field center" value="${broadcast}" placeholder="¿Qué dice la voz ahora?" style="background: rgba(255,255,255,0.05); border-color: ${currentStation.color}44;">
                        </div>

                        <div class="control-row" style="display: grid; grid-template-columns: 80px 1fr; align-items: center; gap: 1rem;">
                            <label style="font-size: 0.65rem; font-weight: bold; color: var(--color-text-secondary);">DEFUSIÓN</label>
                            <input type="range" id="radio-volume" min="0" max="100" value="${volume}" class="slider-act">
                        </div>

                        <div class="control-row">
                            <div style="display: flex; justify-content: space-between; font-size: 0.6rem; color: var(--color-text-secondary); margin-bottom: 0.25rem;">
                                <span>88.1</span>
                                <span>TUNING</span>
                                <span>102.5</span>
                            </div>
                            <div class="radio-dial">
                                <div class="radio-needle" style="left: ${tuning}%"></div>
                                <input type="range" id="radio-tuning" min="0" max="100" value="${tuning}" style="position: absolute; inset: 0; opacity: 0; cursor: pointer;">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="clinical-note" style="margin-top: 1.5rem; font-size: 0.75rem; border-left: 2px solid ${currentStation.color};">
                    "Baja el volumen de la mente para escuchar a tu corazón."
                </div>
            </div>
        `;

        // Event Listeners
        const input = document.getElementById('radio-input');
        const volSlider = document.getElementById('radio-volume');
        const tuneSlider = document.getElementById('radio-tuning');

        input.addEventListener('input', (e) => {
            broadcast = e.target.value;
            const text = document.getElementById('broadcast-text');
            text.innerText = broadcast ? `"${broadcast}"` : 'BUSCANDO SEÑAL...';
        });

        volSlider.addEventListener('input', (e) => {
            volume = e.target.value;
            const text = document.getElementById('broadcast-text');
            text.style.filter = `blur(${(100 - volume) / 20}px)`;
            text.style.opacity = volume / 100;
            document.querySelector('.noise-overlay').style.opacity = (100 - volume) / 200 + 0.05;
            radioAudio.setVolume((100 - volume) / 100);
        });

        tuneSlider.addEventListener('input', (e) => {
            tuning = e.target.value;
            radioAudio.init(); // Ensure initialized
            internalRender(); // Re-render to update station color and labels
        });

        // Add stop sound on close
        const originalRenderHome = renderHome;
        document.getElementById('btn-close-module').addEventListener('click', () => {
            radioAudio.stop();
        });
        document.getElementById('btn-back').addEventListener('click', () => {
            radioAudio.stop();
        });

        input.focus();
        startAudio(); // Start initial volume

        // VU Meter Animation
        const bars = document.querySelectorAll('.vu-bar');
        const animateVU = () => {
            if (!document.querySelector('.vu-meter')) return;
            bars.forEach(bar => {
                const h = Math.random() * (volume / 100) * 100;
                bar.style.height = `${h}%`;
            });
            requestAnimationFrame(animateVU);
        };
        animateVU();
    };

    internalRender();
}


/**
 * TOOL: Interruptor de la Lucha
 */
function renderInterruptorLuchaTool(container) {
    let isStruggling = true;

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">Interruptor de la Lucha</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-secondary);">¿Cómo te estás relacionando con lo que sientes hoy?</p>
                </div>

                <div class="switch-container glass" style="padding: 2.5rem; border-radius: var(--radius-lg); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 2rem; position: relative; overflow: hidden;">
                    <!-- Chaos/Peace Background -->
                    <div class="status-bg" style="position: absolute; inset: 0; z-index: 0; opacity: 0.15; transition: background 0.5s ease;
                         background: ${isStruggling ? 'repeating-conic-gradient(#ef4444 0% 25%, transparent 0% 50%) 50% / 20px 20px' : 'radial-gradient(circle, #3b82f6 0%, transparent 70%)'};
                         filter: blur(5px);"></div>
                    <div class="noise-overlay" style="opacity: ${isStruggling ? '0.1' : '0'}; transition: 0.5s;"></div>

                    <div style="z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 1.5rem;">
                        <div class="toggle-control" id="struggle-toggle" 
                             style="width: 70px; height: 120px; background: #1e293b; border-radius: 35px; padding: 5px; cursor: pointer; position: relative; border: 3px solid ${isStruggling ? '#ef4444' : '#3b82f6'}; transition: 0.3s;">
                            <div class="handle" style="width: 60px; height: 60px; background: white; border-radius: 50%; position: absolute; left: 2px; transition: cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s; top: ${isStruggling ? '5px' : '55px'}; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                                    ${isStruggling ? '⚡' : '🌊'}
                                </div>
                            </div>
                        </div>

                        <div class="status-labels" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <h4 style="font-size: 1.25rem; font-weight: 800; color: ${isStruggling ? '#ef4444' : '#3b82f6'}; text-transform: uppercase; letter-spacing: 2px;">
                                ${isStruggling ? 'LUCHA (ON)' : 'DISPOSICIÓN (OFF)'}
                            </h4>
                            <p style="font-size: 0.9rem; color: var(--color-text-secondary); max-width: 280px; line-height: 1.4;">
                                ${isStruggling
                ? 'Intentando activamente eliminar, cambiar o evitar el dolor emocional. Esto suele generar más sufrimiento.'
                : 'Permitiendo que el dolor esté presente sin pelear con él, reservando tu energía para lo que importa.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="clinical-note" style="margin-top: 1.5rem; text-align: center; border: none; background: transparent;">
                    <p style="font-style: italic; color: var(--color-text-secondary); font-size: 0.8rem;">
                        "El interruptor no apaga el dolor, apaga la pelea innecesaria contra él."
                    </p>
                </div>
            </div>
        `;

        document.getElementById('struggle-toggle').addEventListener('click', () => {
            isStruggling = !isStruggling;
            internalRender();
        });
    };

    internalRender();
}


/**
 * TOOL: STOP (Grounding)
 */
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
                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">Práctica STOP</h3>
                </div>

                <div class="stop-steps-container" style="display: flex; flex-direction: column; gap: 1rem;">
                    ${steps.map((s, i) => `
                        <div class="stop-step glass ${i === currentStep ? 'active-step' : (i < currentStep ? 'done-step' : 'pending-step')}" 
                             style="padding: 1.25rem; border-radius: var(--radius-md); transition: var(--transition-base); 
                                    opacity: ${i === currentStep ? '1' : '0.5'}; 
                                    border-left: 4px solid ${i === currentStep ? 'var(--color-primary)' : 'transparent'};">
                            <h4 style="font-size: 1rem; margin-bottom: 0.25rem;">${s.title}</h4>
                            <p style="font-size: 0.85rem; color: var(--color-text-secondary);">${s.text}</p>
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
            if (currentStep === steps.length - 1) currentStep = 0;
            else currentStep++;
            internalRender();
        });

        document.getElementById('btn-prev-stop').addEventListener('click', () => {
            if (currentStep > 0) currentStep--;
            internalRender();
        });
    };

    internalRender();
}

/**
 * TOOL: 5 Sentidos (Grounding)
 */
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
                <div class="intro" style="margin-bottom: 2rem;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">Técnica de los 5 Sentidos</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-secondary);">Anclando la atención en el entorno inmediato.</p>
                </div>

                <div class="sense-display glass" style="padding: 3rem 2rem; border-radius: var(--radius-lg); border: 2px solid ${s.color};">
                    <div style="font-size: 4rem; font-weight: 700; color: ${s.color}; line-height: 1;">${s.count}</div>
                    <div style="font-size: 1.25rem; margin-top: 0.5rem; font-weight: 600;">${s.item}</div>
                </div>

                <div style="margin-top: 2.5rem; display: flex; justify-content: center; gap: 1rem;">
                    <button class="btn-ghost" id="btn-prev-5" ${currentSense === 0 ? 'disabled' : ''} style="font-size: 0.8rem;">Anterior</button>
                    <button class="btn-primary" id="btn-next-5" style="font-size: 0.8rem;">${currentSense === senses.length - 1 ? 'Finalizar' : 'Siguiente'}</button>
                </div>

                <div class="progress-dots" style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 0.5rem;">
                    ${senses.map((_, i) => `
                        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${i === currentSense ? senses[i].color : 'var(--glass-border)'};"></div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('btn-next-5').addEventListener('click', () => {
            if (currentSense === senses.length - 1) {
                currentSense = 0;
            } else {
                currentSense++;
            }
            internalRender();
        });

        document.getElementById('btn-prev-5').addEventListener('click', () => {
            if (currentSense > 0) currentSense--;
            internalRender();
        });
    };

    internalRender();
}

/**
 * TOOL: Cielo y Clima (Self-as-context)
 */
function renderCieloYClimaTool(container) {
    let timeOfDay = 0.3; // 0 to 1 (0: Dawn, 0.25: Day, 0.5: Dusk, 0.75+: Night)

    const internalRender = () => {
        // Calculate sky color based on time
        let skyGradient, sunMoonColor, sunMoonGlow, starsOpacity = 0;

        if (timeOfDay < 0.2) { // Dawn
            skyGradient = 'linear-gradient(to bottom, #ff7e5f, #feb47b)';
            sunMoonColor = '#ffd0a1';
            sunMoonGlow = 'rgba(255, 126, 95, 0.5)';
        } else if (timeOfDay < 0.5) { // Day
            skyGradient = 'linear-gradient(to bottom, #4facfe, #00f2fe)';
            sunMoonColor = '#fff9c4';
            sunMoonGlow = 'rgba(255, 249, 196, 0.6)';
        } else if (timeOfDay < 0.7) { // Dusk
            skyGradient = 'linear-gradient(to bottom, #6a11cb, #2575fc)';
            sunMoonColor = '#ffcc33';
            sunMoonGlow = 'rgba(255, 204, 51, 0.4)';
        } else { // Night
            skyGradient = 'linear-gradient(to bottom, #0f172a, #1e293b)';
            sunMoonColor = '#f8fafc';
            sunMoonGlow = 'rgba(255, 255, 255, 0.2)';
            starsOpacity = 1;
        }

        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">Cielo y Clima</h3>
                    <p style="font-size: 0.8rem; color: var(--color-text-secondary);">El tiempo pasa, el clima cambia, pero el cielo permanece.</p>
                </div>

                <div class="sky-canvas glass" style="height: 320px; border-radius: var(--radius-lg); position: relative; overflow: hidden; background: ${skyGradient}; border: 1px solid var(--glass-border); transition: background 1s ease;">
                    
                    <!-- Stars Loop -->
                    <div id="stars-layer" style="position: absolute; inset: 0; opacity: ${starsOpacity}; transition: opacity 1s;">
                        ${Array.from({ length: 40 }).map(() => `
                            <div class="star" style="position: absolute; width: 2px; height: 2px; background: white; border-radius: 50%; 
                                 top: ${Math.random() * 100}%; left: ${Math.random() * 100}%; 
                                 opacity: ${Math.random() * 0.7 + 0.3}; animation: pulse ${Math.random() * 2 + 1}s infinite;"></div>
                        `).join('')}
                    </div>

                    <!-- Sun / Moon -->
                    <div class="celestial-body" style="position: absolute; top: 15%; left: 75%; width: 50px; height: 50px; background: ${sunMoonColor}; border-radius: 50%; box-shadow: 0 0 30px ${sunMoonGlow}; transition: all 1s ease;"></div>

                    <div class="sky-background" style="position: absolute; inset: 0; opacity: 0.1; background: radial-gradient(circle at 75% 15%, white 0%, transparent 60%);"></div>
                    
                    <div id="clouds-container" style="position: absolute; inset: 0;">
                        ${state.persistence.weather.map((item, i) => {
            // Organic cloud shapes: variations of blobs
            const blob = `border-radius: ${40 + Math.random() * 20}% ${30 + Math.random() * 20}% ${50 + Math.random() * 20}% ${40 + Math.random() * 20}% / ${30 + Math.random() * 20}% ${50 + Math.random() * 20}% ${40 + Math.random() * 20}% ${60 + Math.random() * 20}%;`;
            return `
                                <div class="cloud glass animate-scale-in" id="cloud-${i}" 
                                     style="position: absolute; left: ${item.x}%; top: ${item.y}%; padding: 0.75rem 1.25rem; ${blob} font-size: 0.8rem; white-space: nowrap; transition: transform 0.1s linear; background: rgba(255,255,255,0.7); color: #334155; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: none; backdrop-filter: blur(4px);">
                                    ${item.text}
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>

                <div class="sky-controls" style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span style="font-size: 0.7rem; color: var(--color-text-secondary); width: 60px;">PASO DEL DÍA</span>
                        <input type="range" id="time-slider" min="0" max="100" value="${timeOfDay * 100}" class="slider-act" style="flex: 1;">
                    </div>
                    
                    <div id="weather-input-container" style="display: flex; gap: 0.5rem;">
                        <input type="text" id="weather-input" class="input-field" placeholder="¿Qué clima hay hoy?" style="flex: 1; font-size: 0.85rem;">
                        <button id="btn-add-weather" class="btn-primary">+</button>
                    </div>
                </div>

                <div class="clinical-note" style="margin-top: 1.5rem; font-size: 0.75rem; color: var(--color-text-secondary); text-align: center; border: none; font-style: italic;">
                    "Como el cielo, tú eres el espacio donde todo ocurre. El clima cambia, tú permaneces."
                </div>
            </div>
        `;

        const input = document.getElementById('weather-input');
        const btnAdd = document.getElementById('btn-add-weather');
        const timeSlider = document.getElementById('time-slider');

        timeSlider.addEventListener('input', (e) => {
            timeOfDay = e.target.value / 100;
            internalRender();
        });

        const addWeather = () => {
            const val = input.value.trim();
            if (val) {
                state.persistence.weather.push({
                    text: val,
                    x: Math.random() * 70 + 5,
                    y: Math.random() * 60 + 10,
                    vx: (Math.random() - 0.5) * 0.1,
                    vy: (Math.random() - 0.5) * 0.1
                });
                saveState();
                internalRender();
            }
        };

        btnAdd.addEventListener('click', addWeather);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addWeather();
        });
        input.focus();

        // Animation Loop
        const clouds = state.persistence.weather;
        let frame;
        const animate = () => {
            clouds.forEach((c, i) => {
                const el = document.getElementById(`cloud-${i}`);
                if (!el) return;

                c.vx += (Math.random() - 0.5) * 0.01;
                c.vy += (Math.random() - 0.5) * 0.01;
                c.vx *= 0.99;
                c.vy *= 0.99;
                c.x += c.vx;
                c.y += c.vy;

                if (c.x < -10) { c.x = 100; } // Wrap clouds
                if (c.x > 110) { c.x = -10; }
                if (c.y < 5) { c.y = 5; c.vy *= -1; }
                if (c.y > 80) { c.y = 80; c.vy *= -1; }

                el.style.left = `${c.x}%`;
                el.style.top = `${c.y}%`;
            });
            frame = requestAnimationFrame(animate);
        };

        frame = requestAnimationFrame(animate);
        const observer = new MutationObserver(() => {
            if (!container.contains(document.getElementById('clouds-container'))) {
                cancelAnimationFrame(frame);
                observer.disconnect();
            }
        });
        observer.observe(container, { childList: true });
    };

    internalRender();
}


/**
 * TOOL: Diana (Target) - Values
 */
function renderDianaTool(container) {
    let selectedAreaIndex = 0;

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">La Diana de Valores</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-secondary);">Ubica cada área de vida en la diana según tu perspectiva actual.</p>
                </div>

                <div class="diana-target glass" style="width: 300px; height: 300px; margin: 0 auto; border-radius: 50%; position: relative; border: 1px solid var(--glass-border); background: radial-gradient(circle, transparent 30%, rgba(255,255,255,0.1) 30.1%, rgba(255,255,255,0.1) 60%, transparent 60.1%, transparent 90%, rgba(255,255,255,0.1) 90.1%);">
                    <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: var(--glass-border);"></div>
                    <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: var(--glass-border);"></div>
                    
                    <div id="target-marks">
                        ${state.persistence.diana.map((area, i) => `
                            <div class="mark animate-scale-in" data-index="${i}" style="position: absolute; left: calc(50% + ${area.x}px); top: calc(50% + ${area.y}px); transform: translate(-50%, -50%); width: 28px; height: 28px; background: var(--color-accent); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #000; font-weight: bold; border: 2px solid white; box-shadow: 0 0 10px var(--color-accent); z-index: 10;">
                                ${i + 1}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="active-area-selector" style="margin-top: 1rem; display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
                    ${state.persistence.diana.map((area, i) => `
                        <button class="btn-toggle ${selectedAreaIndex === i ? 'active' : ''}" data-idx="${i}" style="font-size: 0.7rem; padding: 0.4rem 0.8rem; min-height: auto; border-radius: 8px;">
                            ${i + 1}: ${area.label.split(' ')[0]}
                        </button>
                    `).join('')}
                </div>

                <div class="clinical-note" style="margin-top: 1.5rem; font-size: 0.75rem; color: var(--color-text-secondary); text-align: center;">
                    "Pulsa en la diana para ubicar <strong>${state.persistence.diana[selectedAreaIndex].label}</strong>."
                </div>
            </div>
        `;

        const target = document.querySelector('.diana-target');
        target.addEventListener('click', (e) => {
            const rect = target.getBoundingClientRect();
            const x = e.clientX - rect.left - 150;
            const y = e.clientY - rect.top - 150;

            state.persistence.diana[selectedAreaIndex].x = x;
            state.persistence.diana[selectedAreaIndex].y = y;
            saveState();
            internalRender();
        });

        document.querySelectorAll('.active-area-selector button').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedAreaIndex = parseInt(btn.dataset.idx);
                internalRender();
            });
        });
    };

    internalRender();
}

/**
 * TOOL: SMART-ACT
 */
function renderSMARTTool(container) {
    const goals = {
        S: '', M: '', A: '', R: '', T: ''
    };

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">Acción SMART</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-secondary);">Transformando valores en acciones concretas.</p>
                </div>

                <div class="smart-form" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="glass" style="padding: 1rem; border-radius: var(--radius-md);">
                        <label style="display: block; font-size: 0.7rem; color: var(--color-primary); font-weight: bold; margin-bottom: 0.5rem;">ESPECÍFICA (¿Qué harás exactamente?)</label>
                        <input type="text" data-key="S" value="${state.persistence.smart.S}" class="input-underline">
                    </div>
                    <div class="glass" style="padding: 1rem; border-radius: var(--radius-md);">
                        <label style="display: block; font-size: 0.7rem; color: var(--color-primary); font-weight: bold; margin-bottom: 0.5rem;">MOTIVADA (¿Por qué valor es importante?)</label>
                        <input type="text" data-key="M" value="${state.persistence.smart.M}" class="input-underline">
                    </div>
                    <div class="glass" style="padding: 1rem; border-radius: var(--radius-md);">
                        <label style="display: block; font-size: 0.7rem; color: var(--color-primary); font-weight: bold; margin-bottom: 0.5rem;">ACCESIBLE (¿Está bajo tu control?)</label>
                        <input type="text" data-key="A" value="${state.persistence.smart.A}" class="input-underline">
                    </div>
                    <div class="glass" style="padding: 1rem; border-radius: var(--radius-md);">
                        <label style="display: block; font-size: 0.7rem; color: var(--color-primary); font-weight: bold; margin-bottom: 0.5rem;">RELEVANTE (¿Te acerca a tu dirección?)</label>
                        <input type="text" data-key="R" value="${state.persistence.smart.R}" class="input-underline">
                    </div>
                    <div class="glass" style="padding: 1rem; border-radius: var(--radius-md);">
                        <label style="display: block; font-size: 0.7rem; color: var(--color-primary); font-weight: bold; margin-bottom: 0.5rem;">TEMPORAL (¿Cuándo lo harás?)</label>
                        <input type="text" data-key="T" value="${state.persistence.smart.T}" class="input-underline">
                    </div>
                </div>
            </div>
        `;

        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                state.persistence.smart[e.target.dataset.key] = e.target.value;
                saveState();
            });
        });
    };


    internalRender();
}

/**
 * TOOL: FEAR -> DARE
 */
function renderDARETool(container) {
    let viewMode = 'fear'; // fear or dare

    const fear = [
        { id: 'F', title: 'Fusión', text: 'Engancharse a los pensamientos.', icon: '🔗' },
        { id: 'E', title: 'Evaluación', text: 'Juzgar la experiencia como mala.', icon: '⚖️' },
        { id: 'A', title: 'Avoidance (Evitación)', text: 'Huir del malestar.', icon: '🏃' },
        { id: 'R', title: 'Reason-giving', text: 'Dar excusas para no actuar.', icon: '🗣️' }
    ];

    const dare = [
        { id: 'D', title: 'Defusión', text: 'Observar los pensamientos sin juzgar.', icon: '🍃' },
        { id: 'A', title: 'Aceptación', text: 'Hacer espacio al sentimiento.', icon: '🤲' },
        { id: 'R', title: 'Realismo (Valores)', text: 'Conectar con lo que importa.', icon: '⚓' },
        { id: 'E', title: 'Estrategia (Acción)', text: 'Pasos comprometidos.', icon: '🚀' }
    ];

    const internalRender = () => {
        const currentList = viewMode === 'fear' ? fear : dare;
        const persistenceKey = viewMode === 'fear' ? 'fear' : 'dare';

        container.innerHTML = `
            <div class="tool-content">
                <div class="view-toggle glass" style="display: flex; gap: 0.5rem; padding: 0.5rem; margin-bottom: 2rem; border-radius: var(--radius-md);">
                    <button class="btn-tool ${viewMode === 'fear' ? 'active' : ''}" id="view-fear" style="flex: 1;">Barreras (FEAR)</button>
                    <button class="btn-tool ${viewMode === 'dare' ? 'active' : ''}" id="view-dare" style="flex: 1;">Motores (DARE)</button>
                </div>

                <div class="fear-dare-list" style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${currentList.map(item => `
                        <div class="glass" style="padding: 1rem; border-radius: var(--radius-md); border-left: 4px solid ${viewMode === 'fear' ? '#ef4444' : '#10b981'};">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <span style="font-size: 1.25rem;">${item.icon}</span>
                                <div>
                                    <h4 style="font-size: 0.9rem; font-weight: bold;">${item.title}</h4>
                                    <p style="font-size: 0.8rem; color: var(--color-text-secondary);">${item.text}</p>
                                </div>
                            </div>
                            <input type="text" data-key="${item.id}" value="${state.persistence[persistenceKey][item.id] || ''}" placeholder="¿Cómo se ve esto hoy?" class="input-underline" style="margin-top: 0.5rem;">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('view-fear').addEventListener('click', () => { viewMode = 'fear'; internalRender(); });
        document.getElementById('view-dare').addEventListener('click', () => { viewMode = 'dare'; internalRender(); });

        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                state.persistence[persistenceKey][e.target.dataset.key] = e.target.value;
                saveState();
            });
        });
    };

    internalRender();
}

/**
 * TOOL: Matrix Swipe (The ACT Matrix)
 */
function renderMatrixTool(container) {
    const categories = {
        top_left: { label: 'Pensamientos / Alejamiento', color: '#ef4444', hint: 'Lo que te distrae' },
        top_right: { label: 'Pensamientos / Acercamiento', color: '#10b981', hint: 'Lo que te motiva' },
        bottom_left: { label: 'Acciones / Alejamiento', color: '#f59e0b', hint: 'Lo que haces al huir' },
        bottom_right: { label: 'Acciones / Acercamiento', color: '#3b82f6', hint: 'Pasos hacia tus valores' }
    };

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content" style="position: relative;">
                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">Matrix ACT</h3>
                    <p style="font-size: 0.8rem; color: var(--color-text-secondary);">Organiza tu experiencia entre lo mental/físico y el alejamiento/acercamiento.</p>
                </div>

                <div class="matrix-wrapper" style="position: relative; padding: 1.5rem 0.5rem;">
                    <!-- Axis Labels -->
                    <div style="position: absolute; left: 50%; top: -10px; transform: translateX(-50%); font-size: 0.6rem; font-weight: bold; color: var(--color-text-secondary); background: var(--color-bg); padding: 0 5px; z-index: 2;">MENTAL / INTERNO</div>
                    <div style="position: absolute; left: 50%; bottom: -10px; transform: translateX(-50%); font-size: 0.6rem; font-weight: bold; color: var(--color-text-secondary); background: var(--color-bg); padding: 0 5px; z-index: 2;">CONDUCTUAL / EXTERNO</div>
                    <div style="position: absolute; left: -15px; top: 50%; transform: translateY(-50%) rotate(-90deg); font-size: 0.6rem; font-weight: bold; color: #ef4444; background: var(--color-bg); padding: 0 5px; z-index: 2;">ALEJAMIENTO</div>
                    <div style="position: absolute; right: -15px; top: 50%; transform: translateY(-50%) rotate(90deg); font-size: 0.6rem; font-weight: bold; color: #10b981; background: var(--color-bg); padding: 0 5px; z-index: 2;">ACERCAMIENTO</div>

                    <div class="matrix-grid" style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 4px; height: 320px; border: 1px solid var(--glass-border); background: var(--glass-border);">
                        ${Object.entries(categories).map(([id, cat]) => `
                            <div class="matrix-quadrant" id="quad-${id}" style="padding: 0.5rem; background: var(--color-bg); position: relative; overflow-y: auto; display: flex; flex-direction: column;">
                                <header style="font-size: 0.55rem; font-weight: 800; color: ${cat.color}; opacity: 0.7; margin-bottom: 0.4rem; text-transform: uppercase;">
                                    ${cat.label.split(' / ')[1]}
                                </header>
                                <div class="items" style="display: flex; flex-direction: column; gap: 0.25rem;">
                                    ${state.persistence.matrix[id].length === 0 ? `<div style="font-size: 0.6rem; color: var(--color-text-secondary); opacity: 0.3; font-style: italic; margin-top: auto;">${cat.hint}</div>` : ''}
                                    ${state.persistence.matrix[id].map(item => `
                                        <div class="item glass" style="padding: 0.35rem 0.5rem; border-radius: 4px; font-size: 0.7rem; border-left: 2px solid ${cat.color};">${item}</div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="matrix-input-area" style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
                    <input type="text" id="matrix-item-input" class="input-field" placeholder="¿Qué pensamiento o acción notas?" style="font-size: 0.9rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <button class="btn-ghost" data-quad="top_left" style="font-size: 0.65rem; padding: 0.75rem 0.25rem; border: 1px solid #ef444444; color: #ef4444;">Mental ↔ Lejos</button>
                        <button class="btn-ghost" data-quad="top_right" style="font-size: 0.65rem; padding: 0.75rem 0.25rem; border: 1px solid #10b98144; color: #10b981;">Mental ↔ Hacia</button>
                        <button class="btn-ghost" data-quad="bottom_left" style="font-size: 0.65rem; padding: 0.75rem 0.25rem; border: 1px solid #f59e0b44; color: #f59e0b;">Acción ↔ Lejos</button>
                        <button class="btn-ghost" data-quad="bottom_right" style="font-size: 0.65rem; padding: 0.75rem 0.25rem; border: 1px solid #3b82f644; color: #3b82f6;">Acción ↔ Hacia</button>
                    </div>
                </div>
            </div>
        `;

        const input = document.getElementById('matrix-item-input');
        container.querySelectorAll('button[data-quad]').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = input.value.trim();
                if (text) {
                    state.persistence.matrix[btn.dataset.quad].push(text);
                    saveState();
                    input.value = '';
                    internalRender();
                }
            });
        });
        input.focus();
    };

    internalRender();
}


/**
 * TOOL: DOTS (Avoidance Strategies)
 */
function renderDOTSTool(container) {
    const strategies = [
        { id: 'D', label: 'D · Distracción', examples: 'TV, redes sociales, trabajo excesivo...' },
        { id: 'O', label: 'O · Otros (Culpabilizar)', examples: 'Quejarse, discutir, culpar a otros...' },
        { id: 'T', label: 'T · Thinking (Pensar)', examples: 'Rumiar, planificar obsesivamente, fantasear...' },
        { id: 'S', label: 'S · Substances / Strategies', examples: 'Comida, alcohol, compras, evitar lugares...' }
    ];

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">Análisis DOTS</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-secondary);">Identificando estrategias de evitación comunes.</p>
                </div>

                <div class="dots-list" style="display: flex; flex-direction: column; gap: 1rem;">
                    ${strategies.map(s => `
                        <div class="strategy-item glass" style="padding: 1.25rem; border-radius: var(--radius-md);">
                            <h4 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.25rem;">${s.label}</h4>
                            <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 0.75rem;">${s.examples}</p>
                            <input type="text" data-key="${s.id}" value="${state.persistence.dots[s.id] || ''}" placeholder="Tus ejemplos..." class="input-underline">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                state.persistence.dots[e.target.dataset.key] = e.target.value;
                saveState();
            });
        });
    };

    internalRender();
}



function renderPlaceholderModule(module) {
    mainContent.innerHTML = `
        <div class="module-view">
            <header style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem;">
                <button class="btn-ghost" id="btn-back">← Volver</button>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.25rem;">${module.icon}</span>
                    <h2 style="font-size: 1.1rem; font-weight: 600;">${module.title}</h2>
                </div>
            </header>
            
            <div class="glass" style="padding: 2rem; border-radius: var(--radius-lg); text-align: center;">
                <p style="margin-bottom: 2rem; color: var(--color-text-secondary);">
                    [Cargando herramientas de ${module.title}...]
                </p>
                <div class="placeholder-tool" style="padding: 3rem; border: 2px dashed var(--glass-border); border-radius: var(--radius-md);">
                    Espacio para herramientas clínicas
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-back').addEventListener('click', renderHome);
}


/**
 * MODULE: SOS / Crisis
 */
function renderSOSModule() {
    state.currentModule = 'sos';
    const tools = [
        { id: 'breathing', title: 'Respiración', icon: '🫁' },
        { id: '54321', title: '5-4-3-2-1', icon: '🖐️' }
    ];
    let activeTool = 'breathing';

    const render = () => {
        mainContent.innerHTML = `
            <div class="module-view animate-scale-in">
                <header class="tool-header" style="border-bottom: 2px solid var(--hex-sos); padding-bottom: 1rem;">
                    <div class="title-group">
                        <span style="font-size: 1.5rem;">🆘</span>
                        <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--hex-sos);">Módulo SOS</h2>
                    </div>
                    <button class="btn-ghost" id="btn-close-sos">Cerrar</button>
                </header>

                <nav class="tool-selector glass-card" style="display: flex; gap: 0.5rem; padding: 0.5rem; margin-bottom: 1.5rem;">
                    ${tools.map(t => `
                        <button class="btn-tool ${activeTool === t.id ? 'active' : ''}" data-id="${t.id}" style="flex: 1; font-size: 0.85rem;">
                            ${t.icon} ${t.title}
                        </button>
                    `).join('')}
                </nav>

                <div id="sos-tool-container"></div>
            </div>
        `;

        document.getElementById('btn-close-sos').addEventListener('click', () => {
            state.currentModule = 'idle';
            renderHome();
        });

        document.querySelectorAll('.btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                activeTool = btn.dataset.id;
                render();
            });
        });

        const container = document.getElementById('sos-tool-container');
        if (activeTool === 'breathing') {
            container.innerHTML = `
                <div class="tool-content" style="text-align: center;">
                    <h3 style="margin-bottom: 1rem;">Respiración Consciente</h3>
                    <p class="clinical-note">Sigue el círculo: Inhala cuando crezca, Exhala cuando encoja.</p>
                    <div class="breathing-circle"></div>
                </div>
            `;
        } else {
            render5SentidosTool(container);
        }
    };

    render();
}

/**
 * MODULE: Resumen de Sesión
 */
function renderResumenModule(sessionData = null) {
    const p = sessionData || state.persistence;
    const isHistorical = !!sessionData;
    const patient = state.patients.find(pat => pat.id === state.currentPatientId);

    mainContent.innerHTML = `
        <div class="module-view animate-slide-up">
            <header class="tool-header">
                <div class="title-group">
                    <span style="font-size: 1.5rem;">📋</span>
                    <div>
                        <h2 style="font-size: 1.2rem; font-weight: 700;">${isHistorical ? 'Registro Histórico' : 'Resumen de Sesión'}</h2>
                        <p style="font-size: 0.7rem; color: var(--color-text-secondary);">${patient.name} • ${new Date(p.date).toLocaleDateString()}</p>
                    </div>
                </div>
                <button class="btn-ghost" id="btn-back-resumen">${isHistorical ? 'Volver' : 'Cerrar'}</button>
            </header>

            <div class="resumen-content" style="display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 3rem; overflow-y: auto; max-height: calc(100vh - 120px);">
                
                <section class="glass-card" style="padding: 1rem;">
                    <h3 style="font-size: 0.9rem; color: var(--color-primary); margin-bottom: 0.5rem;">🧠 Pensamientos Externalizados</h3>
                    <ul style="font-size: 0.85rem; padding-left: 1rem; color: var(--color-text-secondary);">
                        ${p.thoughts.map(t => `<li>${t}</li>`).join('') || '<em>Sin datos</em>'}
                    </ul>
                </section>

                <section class="glass-card" style="padding: 1rem;">
                    <h3 style="font-size: 0.9rem; color: var(--color-primary); margin-bottom: 0.5rem;">🔲 Matrix ACT</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.75rem;">
                        <div style="background: rgba(239, 68, 68, 0.1); padding: 0.5rem; border-radius: 4px;"><strong>Mental/Lejos:</strong><br>${p.matrix.top_left.join(', ') || '-'}</div>
                        <div style="background: rgba(16, 185, 129, 0.1); padding: 0.5rem; border-radius: 4px;"><strong>Mental/Hacia:</strong><br>${p.matrix.top_right.join(', ') || '-'}</div>
                        <div style="background: rgba(245, 158, 11, 0.1); padding: 0.5rem; border-radius: 4px;"><strong>Acción/Lejos:</strong><br>${p.matrix.bottom_left.join(', ') || '-'}</div>
                        <div style="background: rgba(59, 130, 246, 0.1); padding: 0.5rem; border-radius: 4px;"><strong>Acción/Hacia:</strong><br>${p.matrix.bottom_right.join(', ') || '-'}</div>
                    </div>
                </section>

                <section class="glass-card" style="padding: 1rem;">
                    <h3 style="font-size: 0.9rem; color: var(--color-primary); margin-bottom: 0.5rem;">🎯 Valores (Diana)</h3>
                    <ul style="font-size: 0.85rem; padding-left: 1rem; color: var(--color-text-secondary);">
                        ${p.diana.filter(d => d.x !== 0 || d.y !== 0).map(d => `<li>${d.label}: Ubicado</li>`).join('') || '<em>Sin marcar</em>'}
                    </ul>
                </section>

                <section class="glass-card" style="padding: 1rem;">
                    <h3 style="font-size: 0.9rem; color: var(--color-primary); margin-bottom: 0.5rem;">🚀 Plan de Acción (SMART)</h3>
                    <div style="font-size: 0.85rem; color: var(--color-text-secondary);">
                        <strong>Objetivo:</strong> ${p.smart.S || '-'}<br>
                        <strong>Motivación:</strong> ${p.smart.M || '-'}<br>
                        <strong>Cuándo:</strong> ${p.smart.T || '-'}
                    </div>
                </section>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn-primary" id="btn-copy-summary">Copiar Texto</button>
                    <button class="btn-primary" id="btn-download-session">Descargar EMR</button>
                    <button class="btn-ghost" id="btn-homework-view" style="border: 1px solid var(--color-primary);">Ver Tarea Paciente</button>
                    ${!isHistorical ? `
                        <button class="btn-ghost" id="btn-finalize-session" style="background: var(--color-success); color: white;">Finalizar Sesión</button>
                    ` : `
                        <button class="btn-ghost" id="btn-delete-history" style="color: #ef4444;">Eliminar Registro</button>
                    `}
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-back-resumen').addEventListener('click', isHistorical ? renderHistoryView : renderHome);

    document.getElementById('btn-copy-summary').addEventListener('click', () => {
        const text = `RESUMEN DE SESIÓN ACT - ${patient.name}\n\n` +
            `🧠 PENSAMIENTOS:\n${p.thoughts.length ? p.thoughts.join('\n') : 'Ninguno'}\n\n` +
            `🔲 MATRIX:\n- Hacia: ${p.matrix.top_right.concat(p.matrix.bottom_right).join(', ') || 'Sin datos'}\n- Lejos: ${p.matrix.top_left.concat(p.matrix.bottom_left).join(', ') || 'Sin datos'}\n\n` +
            `🎯 VALORES: ${p.diana.filter(d => d.x !== 0 || d.y !== 0).map(d => d.label).join(', ') || 'Sin marcar'}\n\n` +
            `🚀 PLAN SMART: ${p.smart.S || 'Sin objetivo'} (${p.smart.T || 'S/D'})`;
        navigator.clipboard.writeText(text).then(() => alert('Resumen copiado'));
    });

    document.getElementById('btn-download-session').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(p, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `ACT_${patient.name}_${p.date.split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    document.getElementById('btn-homework-view').addEventListener('click', () => renderHomeworkView(p));

    if (!isHistorical) {
        document.getElementById('btn-finalize-session').addEventListener('click', () => {
            if (confirm('¿Deseas guardar esta sesión en el historial de ' + patient.name + ' y volver al panel?')) {
                archiveCurrentSession(patient);
                renderDashboard();
            }
        });
    } else {
        document.getElementById('btn-delete-history').addEventListener('click', () => {
            if (confirm('¿Eliminar este registro permanentemente?')) {
                patient.history = patient.history.filter(s => s.date !== p.date);
                localStorage.setItem('act_patients', JSON.stringify(state.patients));
                renderHistoryView();
            }
        });
    }
}

function renderHomeworkView(p) {
    const patient = state.patients.find(pat => pat.id === state.currentPatientId);
    mainContent.innerHTML = `
        <div class="module-view animate-scale-in" style="background: white; color: #1e293b; padding: 2rem; border-radius: var(--radius-lg); min-height: 80vh;">
            <style>
                .homework-p { margin-bottom: 1.5rem; border-left: 4px solid #3b82f6; padding-left: 1.5rem; }
                @media print { .no-print { display: none; } .module-view { padding: 0; box-shadow: none; } }
            </style>
            
            <header style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem;">
                <div>
                    <h1 style="font-size: 1.5rem; font-weight: 800; color: #1e3a8a;">Tarea para Casa</h1>
                    <p style="color: #64748b; font-size: 0.9rem;">${patient.name} • ${new Date(p.date).toLocaleDateString()}</p>
                </div>
                <div style="text-align: right; font-size: 0.8rem; color: #94a3b8;">
                    ACT In-Session Digital
                </div>
            </header>
            
            <div class="homework-body">
                <section class="homework-p">
                    <h3 style="color: #2563eb; font-size: 1.1rem; margin-bottom: 0.5rem;">🚀 Mi Compromiso</h3>
                    <p style="font-weight: 600;">${p.smart.S || 'Actuar en dirección a mis valores'}</p>
                    <p style="font-size: 0.9rem; color: #475569;">Motivación: ${p.smart.M || 'Vivir una vida valiosa'}</p>
                    <p style="font-size: 0.9rem; color: #475569;">Cuándo: ${p.smart.T || 'Esta semana'}</p>
                </section>

                <section class="homework-p">
                    <h3 style="color: #2563eb; font-size: 1.1rem; margin-bottom: 0.5rem;">🧘 Espacio de Notar</h3>
                    <p>Cuando notes que tu mente dice: <em>"${p.thoughts.slice(0, 3).join('", "') || 'pensamientos difíciles'}"</em>...</p>
                    <p style="font-size: 0.9rem; font-style: italic;">...practica respirar y recordar que son solo palabras, no la realidad absoluta.</p>
                </section>

                <section class="homework-p">
                    <h3 style="color: #2563eb; font-size: 1.1rem; margin-bottom: 0.5rem;">🎯 Lo que hace que valga la pena</h3>
                    <p>${p.diana.filter(d => d.x !== 0 || d.y !== 0).map(d => d.label).join(', ') || 'Mis valores y relaciones'}</p>
                </section>
            </div>

            <div class="no-print" style="margin-top: 3rem; display: flex; gap: 1rem; border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
                <button class="btn-primary" onclick="window.print()" style="background: #2563eb; color: white;">🖨️ Imprimir / PDF</button>
                <button class="btn-ghost" id="btn-back-res-hw" style="color: #64748b;">Volver al Resumen</button>
            </div>
        </div>
    `;
    document.getElementById('btn-back-res-hw').addEventListener('click', () => renderResumenModule(p));
}

// Start
init();
