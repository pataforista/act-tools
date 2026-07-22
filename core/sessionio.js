/**
 * ACT In-Session - Exportar / Importar sesión (JSON)
 *
 * La app no guarda registro entre sesiones. El clínico exporta la sesión a un
 * archivo .json que puede compartir con el paciente o adjuntar al expediente,
 * y puede volver a cargarlo para retomar el mismo tema en otro momento.
 */

import { state, loadSessionData } from './state.js';

const SESSION_KEYS = ['thoughts', 'weather', 'diana', 'matrix', 'grounding', 'paso', 'fear', 'dare', 'evitacion', 'estres', 'date'];

export function buildSessionExport() {
    return {
        app: 'ACT In-Session',
        schema: 'act-session',
        version: 1,
        exportedAt: new Date().toISOString(),
        session: state.persistence
    };
}

function timestampSlug(d = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

// Descarga la sesión en curso como archivo .json.
export function exportSessionToFile() {
    const json = JSON.stringify(buildSessionExport(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sesion-act-${timestampSlug()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Valida que el objeto parseado sea (o contenga) una sesión ACT reconocible.
function extractSession(parsed) {
    const raw = parsed && parsed.session ? parsed.session : parsed;
    if (!raw || typeof raw !== 'object') {
        throw new Error('El archivo no tiene un formato reconocible.');
    }
    if (!SESSION_KEYS.some((k) => k in raw)) {
        throw new Error('El archivo no parece una sesión ACT.');
    }
    return raw;
}

// Lee un archivo .json y carga su sesión en la app. Devuelve una promesa.
export function importSessionFromFile(file) {
    return new Promise((resolve, reject) => {
        if (!file) return reject(new Error('No se seleccionó ningún archivo.'));
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                const session = extractSession(parsed);
                loadSessionData(session);
                resolve();
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = () => reject(reader.error || new Error('No se pudo leer el archivo.'));
        reader.readAsText(file);
    });
}
