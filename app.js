/**
 * ACT In-Session Instrument v1.0
 * Main Application Logic
 */

const state = {
    currentModule: 'idle', // idle, active, paused
    activeModuleId: null,
    theme: 'dark'
};

const modules = [
    { id: 'abrirse', title: 'Abrirse', icon: '🔓', color: '#f59e0b' },
    { id: 'presente', title: 'Estar Presente', icon: '🧘', color: '#10b981' },
    { id: 'importa', title: 'Hacer lo que Importa', icon: '🎯', color: '#3182ce' },
    { id: 'analisis', title: 'Análisis', icon: '🔍', color: '#8b5cf6' }
];

const mainContent = document.getElementById('main-content');
const themeToggle = document.getElementById('theme-toggle');

/**
 * Initialize the App
 */
function init() {
    renderHome();
    setupEventListeners();
}

function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', state.theme);
}

/**
 * Render Home Screen (Module Selector)
 */
function renderHome() {
    state.currentModule = 'idle';
    state.activeModuleId = null;

    mainContent.innerHTML = `
        <div class="intro" style="margin-bottom: 2rem;">
            <h1 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Hola, Clínico</h1>
            <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Selecciona una puerta de entrada para este momento de la sesión.</p>
        </div>
        <div class="module-grid">
            ${modules.map(module => `
                <div class="module-card glass" data-id="${module.id}">
                    <div class="icon">${module.icon}</div>
                    <h3>${module.title}</h3>
                </div>
            `).join('')}
        </div>
    `;

    // Add click events to cards
    document.querySelectorAll('.module-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            loadModule(id);
        });
    });
}

/**
 * Load a Clinical Module
 */
function loadModule(id) {
    const module = modules.find(m => m.id === id);
    if (!module) return;

    state.currentModule = 'active';
    state.activeModuleId = id;

    if (id === 'abrirse') {
        renderAbrirseModule(module);
    } else if (id === 'presente') {
        renderEstarPresenteModule(module);
    } else if (id === 'importa') {
        renderHacerLoQueImportaModule(module);
    } else if (id === 'analisis') {
        renderAnalisisModule(module);
    } else {
        renderPlaceholderModule(module);
    }
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
            <div class="module-view">
                <header style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.25rem;">${module.icon}</span>
                        <h2 style="font-size: 1.1rem; font-weight: 600;">${module.title}</h2>
                    </div>
                    <button class="btn-ghost" id="btn-back">Finalizar</button>
                </header>

                <div class="tool-selector glass" style="display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
                    ${tools.map(t => `
                        <button class="btn-tool ${activeToolId === t.id ? 'active' : ''}" data-id="${t.id}" style="flex: 1; font-size: 0.8rem; padding: 0.5rem 1rem; border-radius: var(--radius-sm);">
                            ${t.icon} ${t.title}
                        </button>
                    `).join('')}
                </div>

                <div id="tool-container"></div>
            </div>
        `;

        document.getElementById('btn-back').addEventListener('click', renderHome);
        document.querySelectorAll('.btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                activeToolId = btn.getAttribute('data-id');
                render();
            });
        });

        if (activeToolId === 'matrix') {
            renderMatrixTool(document.getElementById('tool-container'));
        } else if (activeToolId === 'dots') {
            renderDOTSTool(document.getElementById('tool-container'));
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
            <div class="module-view">
                <header style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.25rem;">${module.icon}</span>
                        <h2 style="font-size: 1.1rem; font-weight: 600;">${module.title}</h2>
                    </div>
                    <button class="btn-ghost" id="btn-back">Finalizar</button>
                </header>

                <div class="tool-selector glass" style="display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    ${tools.map(t => `
                        <button class="btn-tool ${activeToolId === t.id ? 'active' : ''}" data-id="${t.id}" style="flex: 0 0 auto; font-size: 0.8rem; padding: 0.5rem 1rem; border-radius: var(--radius-sm); white-space: nowrap;">
                            ${t.icon} ${t.title}
                        </button>
                    `).join('')}
                </div>

                <div id="tool-container"></div>
            </div>
        `;

        document.getElementById('btn-back').addEventListener('click', renderHome);
        document.querySelectorAll('.btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                activeToolId = btn.getAttribute('data-id');
                render();
            });
        });

        if (activeToolId === 'diana') {
            renderDianaTool(document.getElementById('tool-container'));
        } else if (activeToolId === 'smart') {
            renderSMARTTool(document.getElementById('tool-container'));
        } else if (activeToolId === 'dare') {
            renderDARETool(document.getElementById('tool-container'));
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
            <div class="module-view">
                <header style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.25rem;">${module.icon}</span>
                        <h2 style="font-size: 1.1rem; font-weight: 600;">${module.title}</h2>
                    </div>
                    <button class="btn-ghost" id="btn-back">Finalizar</button>
                </header>

                <div class="tool-selector glass" style="display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    ${tools.map(t => `
                        <button class="btn-tool ${activeToolId === t.id ? 'active' : ''}" data-id="${t.id}" style="flex: 0 0 auto; font-size: 0.8rem; padding: 0.5rem 1rem; border-radius: var(--radius-sm); white-space: nowrap;">
                            ${t.icon} ${t.title}
                        </button>
                    `).join('')}
                </div>

                <div id="tool-container"></div>
            </div>
        `;

        document.getElementById('btn-back').addEventListener('click', renderHome);
        document.querySelectorAll('.btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                activeToolId = btn.getAttribute('data-id');
                render();
            });
        });

        if (activeToolId === 'stop') {
            renderSTOPTool(document.getElementById('tool-container'));
        } else if (activeToolId === 'sentidos') {
            render5SentidosTool(document.getElementById('tool-container'));
        } else if (activeToolId === 'cielo') {
            renderCieloYClimaTool(document.getElementById('tool-container'));
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
            <div class="module-view">
                <header style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.25rem;">${module.icon}</span>
                        <h2 style="font-size: 1.1rem; font-weight: 600;">${module.title}</h2>
                    </div>
                    <button class="btn-ghost" id="btn-back">Finalizar</button>
                </header>

                <div class="tool-selector glass" style="display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; overflow-x: auto; -webkit-overflow-scrolling: touch;">
                    ${tools.map(t => `
                        <button class="btn-tool ${activeToolId === t.id ? 'active' : ''}" data-id="${t.id}" style="flex: 0 0 auto; font-size: 0.8rem; padding: 0.5rem 1rem; border-radius: var(--radius-sm); white-space: nowrap;">
                            ${t.icon} ${t.title.split(' ')[0]}
                        </button>
                    `).join('')}
                </div>

                <div id="tool-container"></div>
            </div>
        `;

        document.getElementById('btn-back').addEventListener('click', renderHome);
        document.querySelectorAll('.btn-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                activeToolId = btn.getAttribute('data-id');
                render();
            });
        });

        if (activeToolId === 'visualizador') {
            renderVisualizadorPensamientosTool(document.getElementById('tool-container'));
        } else if (activeToolId === 'radio') {
            renderRadioDoomGloomTool(document.getElementById('tool-container'));
        } else if (activeToolId === 'lucha') {
            renderInterruptorLuchaTool(document.getElementById('tool-container'));
        }
    };

    render();
}

/**
 * TOOL: Visualizador de Pensamientos
 */
function renderVisualizadorPensamientosTool(container) {
    const thoughts = [];

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">Visualizador de Pensamientos</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-secondary);">Escribe un pensamiento que esté presente ahora mismo y obsérvalo.</p>
                </div>

                <div id="thought-input-container" style="margin-bottom: 2rem; display: flex; gap: 0.5rem;">
                    <input type="text" id="thought-input" placeholder="Tengo el pensamiento de que..." 
                           style="flex: 1; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: var(--glass-bg); color: white;">
                    <button id="btn-add-thought" class="btn-primary">+</button>
                </div>

                <div id="thoughts-list" style="display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; min-height: 200px; padding: 1rem; border: 1px dashed var(--glass-border); border-radius: var(--radius-lg);">
                    ${thoughts.length === 0 ? '<p style="color: var(--color-text-secondary); font-size: 0.8rem; align-self: center;">Aún no has externalizado ningún pensamiento.</p>' : ''}
                    ${thoughts.map((t, i) => `
                        <div class="thought-item glass" style="padding: 0.75rem 1.25rem; border-radius: 20px; font-size: 0.9rem; animation: floatIn 0.5s ease-out;">
                            ${t}
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 2rem; display: flex; justify-content: center;">
                    <button class="btn-ghost" id="btn-reset-v" style="font-size: 0.8rem;">Limpiar Pizarra</button>
                </div>
            </div>
        `;

        document.getElementById('btn-reset-v').addEventListener('click', () => {
            thoughts.length = 0;
            internalRender();
        });

        const input = document.getElementById('thought-input');
        const btnAdd = document.getElementById('btn-add-thought');

        const addThought = () => {
            const val = input.value.trim();
            if (val) {
                thoughts.push(val);
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
 * TOOL: Radio Doom & Gloom
 */
function renderRadioDoomGloomTool(container) {
    let broadcast = '';

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">Radio Doom & Gloom</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-secondary);">Sintonizando la estación de pensamientos catastróficos.</p>
                </div>

                <div class="radio-interface glass" style="padding: 2rem; border-radius: var(--radius-lg); text-align: center; border: 2px solid var(--color-primary);">
                    <div class="radio-screen" style="background: #000; padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-family: monospace; color: #0f0; min-height: 80px; display: flex; align-items: center; justify-content: center;">
                        ${broadcast ? `LIVE: ${broadcast}` : 'BUSCANDO SEÑAL...'}
                    </div>
                    
                    <div class="radio-controls" style="display: flex; flex-direction: column; gap: 1rem;">
                        <input type="text" id="radio-input" placeholder="¿Qué dice la radio ahora?" 
                               style="padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: var(--glass-bg); color: white; text-align: center;">
                        
                        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.7rem; color: var(--color-text-secondary);">
                            <span>VOLUMEN</span>
                            <input type="range" style="flex: 1; margin: 0 1rem;">
                            <span>TUNING</span>
                        </div>
                    </div>
                </div>

                <div class="clinical-note" style="margin-top: 1.5rem; font-size: 0.8rem; color: var(--color-text-secondary); font-style: italic; text-align: center;">
                    "No intentamos apagar la radio, solo notar que está encendida."
                </div>
            </div>
        `;

        const input = document.getElementById('radio-input');
        input.addEventListener('input', (e) => {
            broadcast = e.target.value;
            const screen = document.querySelector('.radio-screen');
            screen.innerText = broadcast ? `LIVE: ${broadcast}` : 'BUSCANDO SEÑAL...';
        });
        input.focus();
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
                    <p style="font-size: 0.85rem; color: var(--color-text-secondary);">¿Cómo te estás relacionando con lo que sientes?</p>
                </div>

                <div class="switch-container glass" style="padding: 2.5rem; border-radius: var(--radius-lg); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 2rem;">
                    <div class="toggle-switch ${isStruggling ? 'on' : 'off'}" id="struggle-toggle" 
                         style="width: 80px; height: 140px; background: #334155; border-radius: 40px; padding: 10px; cursor: pointer; position: relative; transition: var(--transition-base); border: 2px solid var(--glass-border);">
                        <div class="handle" style="width: 60px; height: 60px; background: ${isStruggling ? 'var(--color-danger)' : 'var(--color-primary)'}; border-radius: 50%; position: absolute; left: 10px; transition: var(--transition-base); top: ${isStruggling ? '10px' : '70px'}; box-shadow: 0 0 20px ${isStruggling ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'};"></div>
                    </div>

                    <div class="status-labels" style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <h4 style="font-size: 1.25rem; color: ${isStruggling ? 'var(--color-danger)' : 'var(--color-primary)'};">
                            ${isStruggling ? 'LUCHANDO' : 'ABIERTO / DISPUESTO'}
                        </h4>
                        <p style="font-size: 0.8rem; color: var(--color-text-secondary); max-width: 250px;">
                            ${isStruggling
                ? 'Gastando energía para que la emoción desaparezca o cambie.'
                : 'Permitiendo que la emoción esté ahí, sin dedicar energía a combatirla.'}
                        </p>
                    </div>
                </div>

                <div class="clinical-outcomes" style="margin-top: 2rem; padding: 1.5rem; border-radius: var(--radius-md); background: var(--glass-bg); font-size: 0.85rem; text-align: center;">
                    <p><strong>Efecto observado:</strong> ${isStruggling ? 'Tensión alta, fatiga, aumento de la importancia del síntoma.' : 'La emoción sigue ahí, pero hay espacio para elegir qué hacer.'}</p>
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
    const weatherItems = [];

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">Cielo y Clima</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-secondary);">Tú eres el cielo. Los pensamientos y emociones son el clima.</p>
                </div>

                <div class="sky-canvas glass" style="height: 300px; border-radius: var(--radius-lg); position: relative; overflow: hidden; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border: 1px solid var(--glass-border);">
                    <div class="sky-background" style="position: absolute; inset: 0; opacity: 0.2; background: radial-gradient(circle at 50% 50%, #38bdf8 0%, transparent 70%);"></div>
                    
                    <div id="clouds-container" style="position: absolute; inset: 0;">
                        ${weatherItems.map((item, i) => `
                            <div class="cloud glass" style="position: absolute; left: ${item.x}%; top: ${item.y}%; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.8rem; animation: drift 20s linear infinite; animation-delay: -${i * 2}s;">
                                ${item.text}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div id="weather-input-container" style="margin-top: 1.5rem; display: flex; gap: 0.5rem;">
                    <input type="text" id="weather-input" placeholder="¿Qué clima hay hoy? (ej. ansiedad, duda...)" 
                           style="flex: 1; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: var(--glass-bg); color: white;">
                    <button id="btn-add-weather" class="btn-primary">+</button>
                </div>

                <div class="clinical-note" style="margin-top: 1.5rem; font-size: 0.8rem; color: var(--color-text-secondary); font-style: italic; text-align: center;">
                    "El cielo nunca es dañado por las tormentas más feroces."
                </div>
            </div>
        `;

        const input = document.getElementById('weather-input');
        const btnAdd = document.getElementById('btn-add-weather');

        const addWeather = () => {
            const val = input.value.trim();
            if (val) {
                weatherItems.push({
                    text: val,
                    x: Math.random() * 70 + 5,
                    y: Math.random() * 60 + 10
                });
                internalRender();
            }
        };

        btnAdd.addEventListener('click', addWeather);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addWeather();
        });
        input.focus();
    };

    internalRender();
}

/**
 * TOOL: Diana (Target) - Values
 */
function renderDianaTool(container) {
    const areas = [
        { id: 'work', label: 'Trabajo / Educación', x: 0, y: 0 },
        { id: 'relationships', label: 'Relaciones', x: 0, y: 0 },
        { id: 'personal', label: 'Personal / Salud', x: 0, y: 0 },
        { id: 'leisure', label: 'Ocio / Social', x: 0, y: 0 }
    ];

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">La Diana de Valores</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-secondary);">Marca qué tan cerca estás de actuar según tus valores en cada área.</p>
                </div>

                <div class="diana-target glass" style="width: 300px; height: 300px; margin: 0 auto; border-radius: 50%; position: relative; border: 1px solid var(--glass-border); background: radial-gradient(circle, transparent 30%, rgba(255,255,255,0.05) 30.1%, rgba(255,255,255,0.05) 60%, transparent 60.1%, transparent 90%, rgba(255,255,255,0.05) 90.1%);">
                    <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: var(--glass-border);"></div>
                    <div style="position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: var(--glass-border);"></div>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; border-radius: 50%; background: var(--color-primary); box-shadow: 0 0 10px var(--color-primary);"></div>
                    
                    <div id="target-marks">
                        ${areas.map((area, i) => `
                            <div class="mark" data-index="${i}" style="position: absolute; left: calc(50% + ${area.x}px); top: calc(50% + ${area.y}px); transform: translate(-50%, -50%); width: 24px; height: 24px; background: var(--color-accent); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: #000; font-weight: bold; border: 2px solid white;">
                                ${i + 1}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="areas-list" style="margin-top: 1.5rem; font-size: 0.8rem;">
                    ${areas.map((area, i) => `
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="width: 18px; height: 18px; border-radius: 50%; background: var(--color-accent); display: inline-flex; align-items: center; justify-content: center; font-size: 0.6rem; color: #000; font-weight: bold;">${i + 1}</span>
                            <span style="color: var(--color-text-secondary);">${area.label}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="clinical-note" style="margin-top: 1rem; font-size: 0.75rem; color: var(--color-text-secondary); text-align: center;">
                    "Pulsa en la diana para ubicar cada área. El centro es la vida que quieres vivir."
                </div>
            </div>
        `;

        const target = document.querySelector('.diana-target');
        target.addEventListener('click', (e) => {
            const rect = target.getBoundingClientRect();
            const x = e.clientX - rect.left - 150;
            const y = e.clientY - rect.top - 150;

            // Find first area without x,y or just cycle
            const nextAreaIndex = areas.findIndex(a => a.x === 0 && a.y === 0);
            const indexToUpdate = nextAreaIndex === -1 ? 0 : nextAreaIndex;

            areas[indexToUpdate].x = x;
            areas[indexToUpdate].y = y;
            internalRender();
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
                        <input type="text" data-key="S" value="${goals.S}" style="width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--glass-border); color: white; outline: none; padding: 0.25rem 0;">
                    </div>
                    <div class="glass" style="padding: 1rem; border-radius: var(--radius-md);">
                        <label style="display: block; font-size: 0.7rem; color: var(--color-primary); font-weight: bold; margin-bottom: 0.5rem;">MOTIVADA (¿Por qué valor es importante?)</label>
                        <input type="text" data-key="M" value="${goals.M}" style="width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--glass-border); color: white; outline: none; padding: 0.25rem 0;">
                    </div>
                    <div class="glass" style="padding: 1rem; border-radius: var(--radius-md);">
                        <label style="display: block; font-size: 0.7rem; color: var(--color-primary); font-weight: bold; margin-bottom: 0.5rem;">ACCESIBLE (¿Está bajo tu control?)</label>
                        <input type="text" data-key="A" value="${goals.A}" style="width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--glass-border); color: white; outline: none; padding: 0.25rem 0;">
                    </div>
                    <div class="glass" style="padding: 1rem; border-radius: var(--radius-md);">
                        <label style="display: block; font-size: 0.7rem; color: var(--color-primary); font-weight: bold; margin-bottom: 0.5rem;">RELEVANTE (¿Te acerca a tu dirección?)</label>
                        <input type="text" data-key="R" value="${goals.R}" style="width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--glass-border); color: white; outline: none; padding: 0.25rem 0;">
                    </div>
                    <div class="glass" style="padding: 1rem; border-radius: var(--radius-md);">
                        <label style="display: block; font-size: 0.7rem; color: var(--color-primary); font-weight: bold; margin-bottom: 0.5rem;">TEMPORAL (¿Cuándo lo harás?)</label>
                        <input type="text" data-key="T" value="${goals.T}" style="width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--glass-border); color: white; outline: none; padding: 0.25rem 0;">
                    </div>
                </div>
            </div>
        `;

        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                goals[e.target.dataset.key] = e.target.value;
            });
        });
    };

    internalRender();
}

/**
 * TOOL: FEAR -> DARE
 */
function renderDARETool(container) {
    const fear = [
        { id: 'F', title: 'F · Fusión', text: 'Con pensamientos/emociones', icon: '🔗' },
        { id: 'E', title: 'E · Expectativas', text: 'Poco realistas o excesivas', icon: '📈' },
        { id: 'A', title: 'A · Alejamiento', text: 'De la acción valiosa', icon: '🏃' },
        { id: 'R', title: 'R · Rigidez', text: 'Estar pegado a una idea', icon: '🔒' }
    ];

    const dare = [
        { id: 'D', title: 'D · Defusión', text: 'Notar pensamientos como tal', icon: '🕊️' },
        { id: 'A', title: 'A · Aceptación', text: 'Hacer espacio a la emoción', icon: '👐' },
        { id: 'R', title: 'R · Realismo', text: 'Metas pequeñas y posibles', icon: '🎯' },
        { id: 'E', title: 'E · Enganche', text: 'Con tus valores profundos', icon: '⚓' }
    ];

    let viewMode = 'fear'; // 'fear' or 'dare'

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="intro" style="margin-bottom: 1.5rem; text-align: center;">
                    <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 0.5rem;">Análisis FEAR → DARE</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-secondary);">Identifica las barreras y transfórmalas en disposición.</p>
                </div>

                <div class="toggle-container glass" style="display: flex; gap: 0.5rem; padding: 0.25rem; border-radius: 10px; margin-bottom: 1.5rem;">
                    <button id="view-fear" class="btn-tool ${viewMode === 'fear' ? 'active' : ''}" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; border-radius: 8px;">Las Barreras (FEAR)</button>
                    <button id="view-dare" class="btn-tool ${viewMode === 'dare' ? 'active' : ''}" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; border-radius: 8px;">La Respuesta (DARE)</button>
                </div>

                <div class="fear-dare-list" style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${(viewMode === 'fear' ? fear : dare).map(item => `
                        <div class="glass" style="padding: 1rem; border-radius: var(--radius-md); border-left: 4px solid ${viewMode === 'fear' ? '#ef4444' : '#10b981'};">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <span style="font-size: 1.25rem;">${item.icon}</span>
                                <div>
                                    <h4 style="font-size: 0.9rem; font-weight: bold;">${item.title}</h4>
                                    <p style="font-size: 0.8rem; color: var(--color-text-secondary);">${item.text}</p>
                                </div>
                            </div>
                            <input type="text" placeholder="¿Cómo se ve esto hoy?" 
                                   style="width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--glass-border); color: white; outline: none; margin-top: 0.5rem; font-size: 0.8rem;">
                        </div>
                    `).join('')}
                </div>
                
                <div class="clinical-note" style="margin-top: 1.5rem; font-size: 0.8rem; color: var(--color-text-secondary); font-style: italic; text-align: center;">
                    ${viewMode === 'fear'
                ? '"No es un fallo, es lo que hace la mente para protegernos."'
                : '"Pequeños pasos, consistentemente, en la dirección que importa."'}
                </div>
            </div>
        `;

        document.getElementById('view-fear').addEventListener('click', () => { viewMode = 'fear'; internalRender(); });
        document.getElementById('view-dare').addEventListener('click', () => { viewMode = 'dare'; internalRender(); });
    };

    internalRender();
}

/**
 * TOOL: Matrix Swipe (The ACT Matrix)
 */
function renderMatrixTool(container) {
    const categories = {
        top_left: { label: 'Mental / Lejos', items: [], color: '#ef4444' },
        top_right: { label: 'Mental / Hacia', items: [], color: '#10b981' },
        bottom_left: { label: 'Conductual / Lejos', items: [], color: '#f59e0b' },
        bottom_right: { label: 'Conductual / Hacia', items: [], color: '#3b82f6' }
    };

    const internalRender = () => {
        container.innerHTML = `
            <div class="tool-content">
                <div class="matrix-grid" style="display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 0.5rem; height: 350px;">
                    ${Object.entries(categories).map(([id, cat]) => `
                        <div class="matrix-quadrant glass" id="quad-${id}" style="padding: 0.75rem; border-radius: var(--radius-md); position: relative; overflow-y: auto; border: 1px solid ${cat.color}44;">
                            <header style="font-size: 0.6rem; font-weight: bold; color: ${cat.color}; opacity: 0.8; margin-bottom: 0.5rem; text-transform: uppercase;">
                                ${cat.label}
                            </header>
                            <div class="items" style="display: flex; flex-direction: column; gap: 0.25rem;">
                                ${cat.items.map(item => `
                                    <div class="item glass" style="padding: 0.4rem; border-radius: 4px; font-size: 0.75rem;">${item}</div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="matrix-input-area" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                    <input type="text" id="matrix-item-input" placeholder="Escribe algo..." 
                           style="padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: var(--glass-bg); color: white;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <button class="btn-ghost" data-quad="top_left" style="font-size: 0.65rem; border: 1px solid #ef444444;">Mental ↔ Lejos</button>
                        <button class="btn-ghost" data-quad="top_right" style="font-size: 0.65rem; border: 1px solid #10b98144;">Mental ↔ Hacia</button>
                        <button class="btn-ghost" data-quad="bottom_left" style="font-size: 0.65rem; border: 1px solid #f59e0b44;">Acción ↔ Lejos</button>
                        <button class="btn-ghost" data-quad="bottom_right" style="font-size: 0.65rem; border: 1px solid #3b82f644;">Acción ↔ Hacia</button>
                    </div>
                </div>
            </div>
        `;

        const input = document.getElementById('matrix-item-input');
        container.querySelectorAll('button[data-quad]').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = input.value.trim();
                if (text) {
                    categories[btn.dataset.quad].items.push(text);
                    input.value = '';
                    internalRender();
                }
            });
        });
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
                            <input type="text" placeholder="Tus ejemplos..." style="width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--glass-border); color: white; outline: none; font-size: 0.85rem;">
                        </div>
                    `).join('')}
                </div>

                <div class="clinical-outcomes glass" style="margin-top: 2rem; padding: 1.5rem; border-radius: var(--radius-md); background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1);">
                    <h5 style="font-size: 0.85rem; color: #ef4444; margin-bottom: 0.5rem; text-align: center;">El coste de la evitación</h5>
                    <p style="font-size: 0.8rem; color: var(--color-text-secondary); text-align: center;">Estas estrategias funcionan a corto plazo, pero a largo plazo suelen alejarte de lo que importa.</p>
                </div>
            </div>
        `;
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

// Start
init();
