import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultSession, normalizeSession, state, resetSession, loadSessionData } from '../core/state.js';

describe('core/state', () => {
    it('getDefaultSession debe devolver estructura canónica con valores por defecto', () => {
        const session = getDefaultSession();
        assert.ok(session.date);
        assert.ok(Array.isArray(session.thoughts));
        assert.ok(Array.isArray(session.weather));
        assert.equal(session.diana.length, 4);
        assert.ok(session.matrix.top_left);
        assert.ok(session.grounding.hojas);
        assert.ok(session.paso);
        assert.ok(session.fear);
        assert.ok(session.dare);
        assert.ok(Array.isArray(session.evitacion));
        assert.equal(session.estres.cupSize, 'medium');
    });

    it('normalizeSession debe rellenar campos faltantes sin sobrescribir existentes', () => {
        const partial = {
            thoughts: [{ text: 'Pensamiento A' }],
            matrix: { top_left: ['Item 1'] }
        };
        const normalized = normalizeSession(partial);
        assert.equal(normalized.thoughts.length, 1);
        assert.equal(normalized.matrix.top_left.length, 1);
        assert.equal(normalized.diana.length, 4);
        assert.equal(normalized.estres.cupSize, 'medium');
        assert.ok(Array.isArray(normalized.evitacion));
    });

    it('normalizeSession debe corregir tipos corruptos o anómalos de forma defensiva', () => {
        const corrupt = {
            thoughts: 'no-es-array',
            weather: 12345,
            matrix: 'corrupt-string',
            diana: 'no-array',
            estres: { cupSize: 'extra-gigante', load: 'no-array', responses: null }
        };
        const normalized = normalizeSession(corrupt);
        assert.ok(Array.isArray(normalized.thoughts));
        assert.equal(normalized.thoughts.length, 0);
        assert.ok(Array.isArray(normalized.weather));
        assert.ok(Array.isArray(normalized.matrix.top_left));
        assert.equal(normalized.diana.length, 4);
        assert.equal(normalized.estres.cupSize, 'medium');
        assert.ok(Array.isArray(normalized.estres.load));
        assert.ok(Array.isArray(normalized.estres.responses));
    });

    it('normalizeSession debe manejar null y undefined de forma segura', () => {
        const def1 = normalizeSession(null);
        assert.ok(Array.isArray(def1.thoughts));
        const def2 = normalizeSession(undefined);
        assert.ok(Array.isArray(def2.thoughts));
    });

    it('resetSession y loadSessionData deben actualizar el estado en memoria', () => {
        const custom = {
            thoughts: [{ text: 'Sesión cargada' }],
            matrix: { top_right: ['Valor vital'] }
        };
        loadSessionData(custom);
        assert.equal(state.persistence.thoughts[0].text, 'Sesión cargada');
        assert.equal(state.persistence.matrix.top_right[0], 'Valor vital');

        resetSession();
        assert.equal(state.persistence.thoughts.length, 0);
        assert.equal(state.persistence.matrix.top_right.length, 0);
    });
});
