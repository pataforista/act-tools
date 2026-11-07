import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeRadarScores, radarPointsString } from '../modules/resumen.js';
import { getDefaultSession } from '../core/state.js';
import { modules } from '../data/config.js';

describe('modules/resumen - Radar de Procesos ACT', () => {
    it('debe calcular puntuaciones dentro del rango acotado [0, 1] para una sesión vacía', () => {
        const empty = getDefaultSession();
        const scores = computeRadarScores(empty);

        const keys = ['presente', 'abrirse', 'yo', 'valores', 'accion', 'analisis'];
        for (const k of keys) {
            assert.equal(typeof scores[k], 'number');
            assert.ok(scores[k] >= 0, `${k} debe ser >= 0`);
            assert.ok(scores[k] <= 1, `${k} debe ser <= 1`);
        }
    });

    it('debe reflejar adecuadamente el trabajo realizado en cada proceso clínico', () => {
        const session = getDefaultSession();
        session.thoughts.push({ text: 'Pensamiento 1' }, { text: 'Pensamiento 2' }, { text: 'Pensamiento 3' });
        session.weather.push('Lluvioso', 'Despejando');
        session.diana[0].x = 25;
        session.diana[0].y = 40;
        session.paso.accion = 'Caminar 10 minutos';
        session.matrix.top_left.push('Ansiedad');
        session.matrix.bottom_left.push('Procrastinar');

        const scores = computeRadarScores(session);

        assert.ok(scores.abrirse > 0.5, 'abrirse debe incrementarse con pensamientos trabajados');
        assert.ok(scores.presente > 0.5, 'presente debe incrementarse con clima observado');
        assert.equal(scores.valores, 0.85, 'valores debe ser 0.85 cuando la diana está situada');
        assert.ok(scores.accion > 0, 'accion debe registrar el paso mínimo');
        assert.ok(scores.analisis > 0, 'analisis debe registrar los ítems de la matriz');
    });

    it('radarPointsString debe generar 6 pares de coordenadas numéricas para el SVG', () => {
        const scores = {
            presente: 0.8,
            abrirse: 0.6,
            yo: 0.5,
            valores: 0.7,
            accion: 0.9,
            analisis: 0.4
        };
        const pointsStr = radarPointsString(scores);
        assert.ok(typeof pointsStr === 'string');
        const points = pointsStr.split(' ');
        assert.equal(points.length, 6, 'Debe haber exactamente 6 puntos para el hexágono del radar');
        for (const pt of points) {
            const [x, y] = pt.split(',').map(Number);
            assert.ok(!isNaN(x), `Coordenada X inválida en ${pt}`);
            assert.ok(!isNaN(y), `Coordenada Y inválida en ${pt}`);
        }
    });
});

describe('data/config - Módulos del Hexaflex', () => {
    it('debe definir todos los módulos canónicos requeridos', () => {
        const ids = modules.map(m => m.id);
        const required = ['hexaflex', 'abrirse', 'presente', 'yo', 'importa', 'accion', 'analisis', 'estres'];
        for (const req of required) {
            assert.ok(ids.includes(req), `Falta el módulo requerido: ${req}`);
        }
    });

    it('no debe tener IDs duplicados y cada módulo debe tener propiedades completas', () => {
        const ids = modules.map(m => m.id);
        const uniqueIds = new Set(ids);
        assert.equal(ids.length, uniqueIds.size, 'No debe haber IDs duplicados en modules');

        for (const mod of modules) {
            assert.ok(mod.id && typeof mod.id === 'string');
            assert.ok(mod.title && typeof mod.title === 'string');
            assert.ok(mod.icon && typeof mod.icon === 'string');
            assert.ok(mod.color && typeof mod.color === 'string');
        }
    });
});
