import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHTML, sanitizeObject } from '../core/security.js';

describe('core/security', () => {
    describe('escapeHTML', () => {
        it('debe devolver cadena vacía ante valores falsy', () => {
            assert.equal(escapeHTML(''), '');
            assert.equal(escapeHTML(null), '');
            assert.equal(escapeHTML(undefined), '');
        });

        it('debe escapar caracteres peligrosos para XSS', () => {
            assert.equal(
                escapeHTML('<script>alert("xss")</script>'),
                '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
            );
            assert.equal(
                escapeHTML('<img src="x" onerror="alert(1)">'),
                '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;'
            );
            assert.equal(escapeHTML("Juan's test & demo"), "Juan&#039;s test &amp; demo");
        });

        it('debe mantener texto plano sin alterar', () => {
            assert.equal(escapeHTML('Pensamiento habitual'), 'Pensamiento habitual');
            assert.equal(escapeHTML('Valores 123'), 'Valores 123');
        });
    });

    describe('sanitizeObject', () => {
        it('debe sanitizar cadenas en objetos planos', () => {
            const input = {
                nombre: '<b>Test</b>',
                edad: 30,
                activo: true
            };
            const result = sanitizeObject(input);
            assert.equal(result.nombre, '&lt;b&gt;Test&lt;/b&gt;');
            assert.equal(result.edad, 30);
            assert.equal(result.activo, true);
        });

        it('debe sanitizar arrays y objetos anidados recursivamente', () => {
            const input = {
                pensamientos: ['<i>uno</i>', '<script>dos</script>'],
                meta: {
                    nota: '"comillas"'
                }
            };
            const result = sanitizeObject(input);
            assert.deepEqual(result.pensamientos, [
                '&lt;i&gt;uno&lt;/i&gt;',
                '&lt;script&gt;dos&lt;/script&gt;'
            ]);
            assert.equal(result.meta.nota, '&quot;comillas&quot;');
        });
    });
});
