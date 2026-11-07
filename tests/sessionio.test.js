import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSessionExport, extractSession } from '../core/sessionio.js';

describe('core/sessionio', () => {
    it('buildSessionExport debe generar un sobre con metadatos y sesión', () => {
        const pkg = buildSessionExport();
        assert.equal(pkg.app, 'ACT In-Session');
        assert.equal(pkg.schema, 'act-session');
        assert.equal(pkg.version, 1);
        assert.ok(pkg.exportedAt);
        assert.ok(pkg.session);
    });

    it('extractSession debe extraer sesión envuelta en sobre exported', () => {
        const input = {
            app: 'ACT In-Session',
            session: {
                thoughts: ['P1'],
                matrix: { top_left: [] }
            }
        };
        const extracted = extractSession(input);
        assert.equal(extracted.thoughts[0], 'P1');
    });

    it('extractSession debe admitir sesión plana sin sobre', () => {
        const flat = {
            thoughts: ['P1'],
            diana: []
        };
        const extracted = extractSession(flat);
        assert.equal(extracted.thoughts[0], 'P1');
    });

    it('extractSession debe rechazar objetos inválidos o vacíos', () => {
        assert.throws(() => extractSession(null), /no contiene un objeto JSON válido/);
        assert.throws(() => extractSession('texto'), /no contiene un objeto JSON válido/);
        assert.throws(() => extractSession([]), /no contiene un objeto JSON válido/);
        assert.throws(() => extractSession({ foo: 'bar' }), /no parece ser una sesión válida/);
        assert.throws(() => extractSession({ session: 'invalido' }), /no parece ser una sesión válida/);
    });
});
