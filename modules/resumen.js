/**
 * ACT In-Session - Resumen & History Module
 */

import { state, archiveCurrentSession, saveState } from '../core/state.js';
import { showToast } from '../ui/utils.js';
import { escapeHTML as esc } from '../core/security.js';

const GROUNDING_TOOLS = [
    { key: 'visualizador', label: 'Visualizador de Pensamientos' },
    { key: 'hojas', label: 'Hojas en Agua' },
    { key: 'radio', label: 'Radio Doom & Gloom' },
    { key: 'lucha', label: 'Interruptor de la Lucha' },
    { key: 'cielo', label: 'Cielo y Clima' }
];

const PASO_LABELS = { area: 'Área de valor', accion: 'Paso mínimo', disposicion: 'Disposición', cuando: 'Cuándo' };
// Legacy labels kept so archived sessions still render.
const SMART_LABELS = { S: 'Específica', M: 'Medible', A: 'Alcanzable', R: 'Relevante', T: 'Tiempo' };
const DOTS_LABELS = { D: 'Distracción', O: 'Otros', T: 'Pensamiento', S: 'Sustancias' };
const FEAR_LABELS = { F: 'Fusión', E: 'Expectativas / Evaluaciones', A: 'Evitación del malestar', R: 'Alejamiento de los valores' };
const DARE_LABELS = { D: 'Defusión', A: 'Aceptación del malestar', R: 'Dirección realista', E: 'Encarnar los valores' };
const MATRIX_LABELS = {
    top_left: 'Interior · Alejamiento',
    top_right: 'Interior · Acercamiento',
    bottom_left: 'Exterior · Alejamiento',
    bottom_right: 'Exterior · Acercamiento'
};
const GROUNDING_FIELD_LABELS = { contexto: 'Contexto', aprendizaje: 'Aprendizaje', accion: 'Acción' };

const clamp01 = (n) => Math.max(0, Math.min(1, n));

function groundingFilledCount(entry) {
    if (!entry) return 0;
    return ['contexto', 'aprendizaje', 'accion'].filter(k => (entry[k] || '').trim()).length;
}

function computeRadarScores(p) {
    const g = p.grounding || {};
    const filled = (key) => groundingFilledCount(g[key]);
    const thoughts = p.thoughts?.length || 0;
    const weather = p.weather?.length || 0;
    const pasoFilled = p.paso
        ? Object.values(p.paso).filter(v => (v || '').trim()).length
        : (p.smart ? Object.values(p.smart).filter(v => (v || '').trim()).length : 0);
    const dareFilled = p.dare ? Object.values(p.dare).filter(v => (v || '').trim()).length : 0;
    const fearFilled = p.fear ? Object.values(p.fear).filter(v => (v || '').trim()).length : 0;
    const matrixCount = p.matrix ? Object.values(p.matrix).reduce((a, arr) => a + (arr?.length || 0), 0) : 0;
    const evitCount = Array.isArray(p.evitacion)
        ? p.evitacion.length
        : (p.dots ? Object.values(p.dots).filter(v => (v || '').trim()).length : 0);
    const dianaSet = p.diana ? p.diana.some(d => d.x !== 0 || d.y !== 0) : false;
    const accionLanded = GROUNDING_TOOLS.reduce((acc, t) => acc + ((g[t.key]?.accion || '').trim() ? 1 : 0), 0);
    const abrirseLanded = filled('visualizador') + filled('hojas') + filled('radio') + filled('lucha');

    return {
        presente: clamp01((weather ? 0.6 : 0) + (filled('cielo') ? 0.4 : 0) + (weather > 2 ? 0.2 : 0)),
        abrirse: clamp01((thoughts ? 0.5 : 0) + (abrirseLanded ? 0.5 : 0) + (thoughts > 2 ? 0.2 : 0)),
        yo: clamp01((filled('cielo') ? 0.7 : 0) + (weather ? 0.3 : 0)),
        valores: clamp01(dianaSet ? 0.85 : 0.1),
        accion: clamp01(pasoFilled * 0.15 + dareFilled * 0.08 + accionLanded * 0.12),
        analisis: clamp01(matrixCount * 0.12 + evitCount * 0.12 + fearFilled * 0.05)
    };
}

// Axis order matches the SVG labels: top, upper-right, lower-right, bottom, lower-left, upper-left
function radarPointsString(s) {
    const c = 50, r = 40;
    const pts = [
        { x: c, y: c - r * s.presente },
        { x: c + r * 0.866 * s.abrirse, y: c - r * 0.5 * s.abrirse },
        { x: c + r * 0.866 * s.analisis, y: c + r * 0.5 * s.analisis },
        { x: c, y: c + r * s.accion },
        { x: c - r * 0.866 * s.valores, y: c + r * 0.5 * s.valores },
        { x: c - r * 0.866 * s.yo, y: c - r * 0.5 * s.yo }
    ];
    return pts.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
}

function thoughtText(t) {
    return (t && typeof t === 'object') ? (t.text || '') : (t || '');
}

function listSection(title, items) {
    if (!items.length) return '';
    return `
        <section class="glass-card">
            <h3>${title}</h3>
            <ul style="font-size: 0.85rem; padding-left: 1.1rem; display: flex; flex-direction: column; gap: 0.25rem;">
                ${items.map(i => `<li>${i}</li>`).join('')}
            </ul>
        </section>
    `;
}

function renderGroundingSection(p) {
    const g = p.grounding || {};
    const blocks = GROUNDING_TOOLS
        .filter(t => groundingFilledCount(g[t.key]) > 0)
        .map(t => {
            const entry = g[t.key];
            const rows = ['contexto', 'aprendizaje', 'accion']
                .filter(k => (entry[k] || '').trim())
                .map(k => `<p style="margin: 0; font-size: 0.8rem;"><strong style="color: var(--color-primary);">${GROUNDING_FIELD_LABELS[k]}:</strong> ${esc(entry[k])}</p>`)
                .join('');
            return `
                <div class="glass" style="padding: 0.85rem; border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 0.35rem;">
                    <h4 style="font-size: 0.8rem; margin: 0;">${t.label}</h4>
                    ${rows}
                </div>
            `;
        });

    if (!blocks.length) return '';
    return `
        <section class="glass-card">
            <h3>🧭 Aterrizaje clínico</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem;">
                ${blocks.join('')}
            </div>
        </section>
    `;
}

function renderSummarySections(p) {
    const sections = [];

    sections.push(renderGroundingSection(p));

    sections.push(listSection('🧠 Pensamientos Externalizados',
        (p.thoughts || []).map(thoughtText).map(esc).filter(Boolean)));

    sections.push(listSection('🌤️ Clima Observado',
        (p.weather || []).map(w => esc(w.text || w)).filter(Boolean)));

    const dianaSet = (p.diana || []).filter(d => d.x !== 0 || d.y !== 0).map(d => esc(d.label));
    sections.push(listSection('🎯 Valores · Áreas situadas en la Diana', dianaSet));

    if (p.paso && Object.values(p.paso).some(v => (v || '').trim())) {
        const pasoItems = ['area', 'accion', 'disposicion', 'cuando']
            .filter(k => (p.paso[k] || '').trim())
            .map(k => `<strong>${PASO_LABELS[k]}:</strong> ${esc(p.paso[k])}`);
        sections.push(listSection('✅ Acción · Paso mínimo', pasoItems));
    } else if (p.smart) {
        const smartItems = Object.entries(p.smart).filter(([, v]) => (v || '').trim()).map(([k, v]) => `<strong>${SMART_LABELS[k] || k}:</strong> ${esc(v)}`);
        sections.push(listSection('✅ Acción · SMART-ACT', smartItems));
    }

    const fearItems = p.fear
        ? Object.entries(p.fear).filter(([, v]) => (v || '').trim()).map(([k, v]) => `<strong>${FEAR_LABELS[k] || k}:</strong> ${esc(v)}`)
        : [];
    const dareItems = p.dare
        ? Object.entries(p.dare).filter(([, v]) => (v || '').trim()).map(([k, v]) => `<strong>${DARE_LABELS[k] || k}:</strong> ${esc(v)}`)
        : [];
    if (fearItems.length || dareItems.length) {
        sections.push(`
            <section class="glass-card">
                <h3>🚀 FEAR → DARE</h3>
                ${fearItems.length ? `<p style="font-size: 0.75rem; color: #ef4444; margin: 0.5rem 0 0.2rem;">Barreras (FEAR)</p><ul style="font-size: 0.82rem; padding-left: 1.1rem;">${fearItems.map(i => `<li>${i}</li>`).join('')}</ul>` : ''}
                ${dareItems.length ? `<p style="font-size: 0.75rem; color: #10b981; margin: 0.5rem 0 0.2rem;">Dirección (DARE)</p><ul style="font-size: 0.82rem; padding-left: 1.1rem;">${dareItems.map(i => `<li>${i}</li>`).join('')}</ul>` : ''}
            </section>
        `);
    }

    const matrixItems = [];
    if (p.matrix) {
        Object.entries(p.matrix).forEach(([id, arr]) => {
            (arr || []).forEach(item => matrixItems.push(`<strong>${MATRIX_LABELS[id] || id}:</strong> ${esc(item)}`));
        });
    }
    sections.push(listSection('🧩 Análisis · Matrix', matrixItems));

    if (Array.isArray(p.evitacion) && p.evitacion.length) {
        const evitItems = p.evitacion.map(e => {
            const detail = [];
            if ((e.alivio || '').trim()) detail.push(`alivio: ${esc(e.alivio)}`);
            if ((e.costo || '').trim()) detail.push(`coste: ${esc(e.costo)}`);
            return `<strong>${esc((e.tipo || '').trim() || 'Evitación')}</strong>${detail.length ? ' — ' + detail.join(' · ') : ''}`;
        });
        sections.push(listSection('🔁 Análisis · Coste de la evitación', evitItems));
    } else if (p.dots) {
        const dotsItems = Object.entries(p.dots).filter(([, v]) => (v || '').trim()).map(([k, v]) => `<strong>${DOTS_LABELS[k] || k}:</strong> ${esc(v)}`);
        sections.push(listSection('🔁 Análisis · DOTS (evitación)', dotsItems));
    }

    const estres = p.estres || {};
    const estresLoad = Array.isArray(estres.load) ? estres.load : [];
    const estresResponses = Array.isArray(estres.responses) ? estres.responses : [];
    if (estresLoad.length || estresResponses.length) {
        const loadItems = estresLoad.map(s => `<strong>${esc((s.label || '').trim() || 'Carga')}</strong>${s.pct ? ` <span style="opacity: 0.6;">(${s.pct}%)</span>` : ''}`);
        const toward = estresResponses.filter(r => r.dir === 'toward').map(r => esc(r.text)).filter(Boolean);
        const away = estresResponses.filter(r => r.dir === 'away').map(r => esc(r.text)).filter(Boolean);
        sections.push(`
            <section class="glass-card">
                <h3>🥤 Vaso de Estrés</h3>
                ${loadItems.length ? `<p style="font-size: 0.75rem; color: var(--color-text-secondary); margin: 0.5rem 0 0.2rem;">Carga que lleva</p><ul style="font-size: 0.82rem; padding-left: 1.1rem;">${loadItems.map(i => `<li>${i}</li>`).join('')}</ul>` : ''}
                ${toward.length ? `<p style="font-size: 0.75rem; color: #10b981; margin: 0.5rem 0 0.2rem;">Respuestas que acercan</p><ul style="font-size: 0.82rem; padding-left: 1.1rem;">${toward.map(i => `<li>${i}</li>`).join('')}</ul>` : ''}
                ${away.length ? `<p style="font-size: 0.75rem; color: #ef4444; margin: 0.5rem 0 0.2rem;">Respuestas que alejan (evitación)</p><ul style="font-size: 0.82rem; padding-left: 1.1rem;">${away.map(i => `<li>${i}</li>`).join('')}</ul>` : ''}
            </section>
        `);
    }

    const rendered = sections.filter(Boolean);
    if (!rendered.length) {
        return '<section class="glass-card"><p style="font-size: 0.85rem; color: var(--color-text-secondary);">Sin registros en esta sesión.</p></section>';
    }
    return rendered.join('');
}

function buildSummaryText(p, patientName) {
    const lines = [];
    const dateStr = new Date(p.date).toLocaleDateString();
    lines.push(`Resumen de sesión — ${patientName}`, `Fecha: ${dateStr}`, '');

    const g = p.grounding || {};
    const grounded = GROUNDING_TOOLS.filter(t => groundingFilledCount(g[t.key]) > 0);
    if (grounded.length) {
        lines.push('ATERRIZAJE CLÍNICO');
        grounded.forEach(t => {
            lines.push(`  ${t.label}:`);
            ['contexto', 'aprendizaje', 'accion'].forEach(k => {
                if ((g[t.key][k] || '').trim()) lines.push(`    - ${GROUNDING_FIELD_LABELS[k]}: ${g[t.key][k]}`);
            });
        });
        lines.push('');
    }

    const thoughts = (p.thoughts || []).map(thoughtText).filter(Boolean);
    if (thoughts.length) { lines.push('PENSAMIENTOS EXTERNALIZADOS', ...thoughts.map(t => `  - ${t}`), ''); }

    const weather = (p.weather || []).map(w => w.text || w).filter(Boolean);
    if (weather.length) { lines.push('CLIMA OBSERVADO', ...weather.map(t => `  - ${t}`), ''); }

    const dianaSet = (p.diana || []).filter(d => d.x !== 0 || d.y !== 0).map(d => d.label);
    if (dianaSet.length) { lines.push('VALORES · DIANA', ...dianaSet.map(t => `  - ${t}`), ''); }

    if (p.paso && Object.values(p.paso).some(v => (v || '').trim())) {
        const items = ['area', 'accion', 'disposicion', 'cuando'].filter(k => (p.paso[k] || '').trim());
        lines.push('ACCIÓN · PASO MÍNIMO', ...items.map(k => `  - ${PASO_LABELS[k]}: ${p.paso[k]}`), '');
    } else if (p.smart) {
        const items = Object.entries(p.smart).filter(([, v]) => (v || '').trim());
        if (items.length) { lines.push('ACCIÓN · SMART-ACT', ...items.map(([k, v]) => `  - ${SMART_LABELS[k] || k}: ${v}`), ''); }
    }

    if (p.fear) {
        const items = Object.entries(p.fear).filter(([, v]) => (v || '').trim());
        if (items.length) { lines.push('FEAR (barreras)', ...items.map(([k, v]) => `  - ${FEAR_LABELS[k] || k}: ${v}`), ''); }
    }
    if (p.dare) {
        const items = Object.entries(p.dare).filter(([, v]) => (v || '').trim());
        if (items.length) { lines.push('DARE (dirección)', ...items.map(([k, v]) => `  - ${DARE_LABELS[k] || k}: ${v}`), ''); }
    }

    if (p.matrix) {
        const rows = [];
        Object.entries(p.matrix).forEach(([id, arr]) => (arr || []).forEach(item => rows.push(`  - ${MATRIX_LABELS[id] || id}: ${item}`)));
        if (rows.length) { lines.push('ANÁLISIS · MATRIX', ...rows, ''); }
    }

    if (Array.isArray(p.evitacion) && p.evitacion.length) {
        lines.push('ANÁLISIS · COSTE DE LA EVITACIÓN');
        p.evitacion.forEach(e => {
            lines.push(`  - ${(e.tipo || '').trim() || 'Evitación'}`);
            if ((e.alivio || '').trim()) lines.push(`      alivio corto: ${e.alivio}`);
            if ((e.costo || '').trim()) lines.push(`      coste largo: ${e.costo}`);
        });
        lines.push('');
    } else if (p.dots) {
        const items = Object.entries(p.dots).filter(([, v]) => (v || '').trim());
        if (items.length) { lines.push('ANÁLISIS · DOTS', ...items.map(([k, v]) => `  - ${DOTS_LABELS[k] || k}: ${v}`), ''); }
    }

    const estres = p.estres || {};
    const estresLoad = Array.isArray(estres.load) ? estres.load : [];
    const estresResponses = Array.isArray(estres.responses) ? estres.responses : [];
    if (estresLoad.length || estresResponses.length) {
        lines.push('VASO DE ESTRÉS');
        if (estresLoad.length) {
            lines.push('  Carga que lleva:');
            estresLoad.forEach(s => lines.push(`    - ${(s.label || '').trim() || 'Carga'}${s.pct ? ` (${s.pct}%)` : ''}`));
        }
        const toward = estresResponses.filter(r => r.dir === 'toward').map(r => r.text).filter(Boolean);
        const away = estresResponses.filter(r => r.dir === 'away').map(r => r.text).filter(Boolean);
        if (toward.length) { lines.push('  Respuestas que acercan:'); toward.forEach(t => lines.push(`    - ${t}`)); }
        if (away.length) { lines.push('  Respuestas que alejan (evitación):'); away.forEach(t => lines.push(`    - ${t}`)); }
        lines.push('');
    }

    return lines.join('\n').trim();
}

async function copyToClipboard(text) {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
        }
        showToast('✓ Resumen copiado');
    } catch {
        showToast('No se pudo copiar');
    }
}

export function renderResumenModule(container, { sessionData = null, navigateToDashboard, navigateToHome, renderHistoryView, renderHomeworkView }) {
    const p = sessionData || state.persistence;
    const isHistorical = !!sessionData;
    const patient = state.patients.find(pat => pat.id === state.currentPatientId);
    const patientName = esc(patient?.name || 'Consultante');
    const scores = computeRadarScores(p);

    container.innerHTML = `
            <header class="tool-header">
                <div class="title-group">
                    <i data-lucide="clipboard-check" style="width: 1.5rem; height: 1.5rem; color: var(--color-primary);"></i>
                    <div>
                        <h2 style="font-size: 1.2rem; font-weight: 700;">${isHistorical ? 'Registro Histórico' : 'Resumen de Sesión'}</h2>
                        <p style="font-size: 0.7rem; color: var(--color-text-secondary);">${patientName} • ${new Date(p.date).toLocaleDateString()}</p>
                    </div>
                </div>
                <button class="btn-ghost" id="btn-back-resumen">${isHistorical ? 'Volver' : 'Cerrar'}</button>
            </header>

            <div class="resumen-content" style="display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 3rem;">
                <!-- Radar Chart Section -->
                <section class="glass-card" style="display: flex; flex-direction: column; align-items: center; padding: 1.5rem 1rem;">
                    <h3 style="font-size: 0.95rem; margin-bottom: 1rem; color: var(--color-primary);">Procesos trabajados en la sesión</h3>

                    <div id="radar-container" style="width: 250px; height: 250px; position: relative;">
                        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%; overflow: visible;">
                            <!-- Grid -->
                            <polygon points="50,10 84.6,30 84.6,70 50,90 15.4,70 15.4,30" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
                            <polygon points="50,30 67.3,40 67.3,60 50,70 32.7,60 32.7,40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />

                            <!-- Hexaflex Labels -->
                            <text x="50" y="5" text-anchor="middle" font-size="3" fill="var(--color-text-secondary)">Presente</text>
                            <text x="90" y="30" text-anchor="start" font-size="3" fill="var(--color-text-secondary)">Abrirse</text>
                            <text x="90" y="70" text-anchor="start" font-size="3" fill="var(--color-text-secondary)">Análisis</text>
                            <text x="50" y="95" text-anchor="middle" font-size="3" fill="var(--color-text-secondary)">Acción</text>
                            <text x="10" y="70" text-anchor="end" font-size="3" fill="var(--color-text-secondary)">Valores</text>
                            <text x="10" y="30" text-anchor="end" font-size="3" fill="var(--color-text-secondary)">Yo</text>

                            <!-- Data Polygon -->
                            <polygon id="radar-shape" points="50,50 50,50 50,50 50,50 50,50 50,50" fill="var(--color-primary)" fill-opacity="0.3" stroke="var(--color-primary)" stroke-width="1" />
                        </svg>
                    </div>
                    <p style="font-size: 0.68rem; color: var(--color-text-secondary); margin-top: 0.5rem; text-align: center; max-width: 220px;">Refleja qué procesos se tocaron, no una puntuación de logro.</p>
                </section>

                ${renderSummarySections(p)}

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn-primary" id="btn-copy-summary">Copiar Texto</button>
                    <button class="btn-ghost" id="btn-homework-view">Ver Tarea Paciente</button>
                    ${!isHistorical ? `<button class="btn-ghost" id="btn-finalize-session" style="grid-column: 1 / -1; background: var(--color-success); color: white;">Finalizar Sesión</button>` : ''}
                </div>
            </div>
    `;

    if (window.lucide) lucide.createIcons();

    document.getElementById('btn-back-resumen').addEventListener('click', isHistorical ? renderHistoryView : navigateToHome);
    document.getElementById('btn-homework-view').addEventListener('click', () => renderHomeworkView(p));
    document.getElementById('btn-copy-summary').addEventListener('click', () => copyToClipboard(buildSummaryText(p, patientName)));

    if (!isHistorical) {
        document.getElementById('btn-finalize-session').addEventListener('click', () => {
            if (confirm('¿Finalizar sesión?')) {
                archiveCurrentSession();
                navigateToDashboard();
            }
        });
    }

    // Radar animation from real session data
    setTimeout(() => {
        anime({
            targets: '#radar-shape',
            points: [
                { value: '50,50 50,50 50,50 50,50 50,50 50,50' },
                { value: radarPointsString(scores) }
            ],
            duration: 1500,
            easing: 'easeOutQuint'
        });
    }, 100);
}

export function renderHomeworkScreen(container, session, onBack) {
    const p = session || state.persistence;
    const patient = state.patients.find(pat => pat.id === state.currentPatientId);
    const patientName = esc(patient?.name || 'Consultante');
    const g = p.grounding || {};

    const acciones = GROUNDING_TOOLS
        .filter(t => (g[t.key]?.accion || '').trim())
        .map(t => ({ label: t.label, text: esc(g[t.key].accion) }));

    const dianaSet = (p.diana || []).filter(d => d.x !== 0 || d.y !== 0).map(d => esc(d.label));
    const embrace = esc((p.dare?.E || '').trim());
    const pasoAccion = esc((p.paso?.accion || '').trim() || (p.smart?.S || '').trim());
    const thoughts = (p.thoughts || []).map(thoughtText).map(esc).filter(Boolean).slice(0, 5);

    const block = (title, html) => html ? `
        <section class="glass-card">
            <h3 style="font-size: 0.95rem; color: var(--color-primary);">${title}</h3>
            ${html}
        </section>
    ` : '';

    container.innerHTML = `
        <div class="module-view animate-slide-up">
            <header class="tool-header">
                <button class="btn-ghost" id="btn-back-homework">←</button>
                <div>
                    <h2 style="font-size: 1.2rem; font-weight: 700;">Tarea para ${patientName}</h2>
                    <p style="font-size: 0.7rem; color: var(--color-text-secondary);">${new Date(p.date).toLocaleDateString()}</p>
                </div>
            </header>

            <div style="display: flex; flex-direction: column; gap: 1.25rem; padding-bottom: 3rem;">
                <p class="clinical-note" style="font-size: 0.85rem;">Estas son las direcciones y acciones que elegiste en la sesión. No son obligaciones ni metas a cumplir: son recordatorios de hacia dónde quisiste moverte.</p>

                ${block('Acciones que elegiste',
                    acciones.length
                        ? `<ul style="font-size: 0.85rem; padding-left: 1.1rem; display: flex; flex-direction: column; gap: 0.3rem;">${acciones.map(a => `<li><strong>${a.label}:</strong> ${a.text}</li>`).join('')}</ul>`
                        : (pasoAccion ? `<p style="font-size: 0.85rem;">${pasoAccion}</p>` : ''))}

                ${block('Dirección valiosa',
                    (dianaSet.length || embrace)
                        ? `${dianaSet.length ? `<p style="font-size: 0.8rem; margin: 0 0 0.4rem;">Áreas en foco: ${dianaSet.join(', ')}.</p>` : ''}${embrace ? `<p style="font-size: 0.85rem;">${embrace}</p>` : ''}`
                        : '')}

                ${block('Pensamientos para observar (no para resolver)',
                    thoughts.length
                        ? `<ul style="font-size: 0.85rem; padding-left: 1.1rem; display: flex; flex-direction: column; gap: 0.3rem;">${thoughts.map(t => `<li>${t}</li>`).join('')}</ul>`
                        : '')}

                <p style="font-size: 0.75rem; color: var(--color-text-secondary); font-style: italic; text-align: center;">Nota lo que aparezca. Sigues aquí.</p>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
    document.getElementById('btn-back-homework').addEventListener('click', onBack);
}

export function renderHistoryView(container, { navigateToDashboard, renderSessionDetail }) {
    const patient = state.patients.find(p => p.id === state.currentPatientId);
    if (!patient) return navigateToDashboard();
    
    container.innerHTML = `
        <div class="module-view animate-slide-up">
            <header class="tool-header">
                <button class="btn-ghost" id="btn-back-dashboard">←</button>
                <h2 style="font-size: 1.2rem; font-weight: 700;">Historial: ${esc(patient.name)}</h2>
            </header>
            <div class="history-list" style="display: flex; flex-direction: column; gap: 1rem;">
                ${patient.history.length === 0 ? '<p>No hay sesiones registradas.</p>' :
            patient.history.map((s, idx) => `
                    <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;">
                        <div>
                            <div style="font-weight: 600;">Sesión ${idx + 1}</div>
                            <div style="font-size: 0.8rem;">${new Date(s.date).toLocaleDateString()}</div>
                        </div>
                        <button class="btn-ghost btn-view-old-summary" data-idx="${idx}">Ver Detalles</button>
                    </div>
                `).reverse().join('')}
            </div>
        </div>
    `;
    document.getElementById('btn-back-dashboard').addEventListener('click', navigateToDashboard);
    document.querySelectorAll('.btn-view-old-summary').forEach(btn => {
        btn.addEventListener('click', () => renderSessionDetail(patient.history[parseInt(btn.dataset.idx)]));
    });
}
