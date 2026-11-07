import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RadioSound, radioAudio } from '../core/audio.js';

describe('core/audio - RadioSound Engine', () => {
    it('debe inicializarse con propiedades nulas antes de activación', () => {
        const sound = new RadioSound();
        assert.equal(sound.ctx, null);
        assert.equal(sound.noise, null);
        assert.equal(sound.gain, null);
    });

    it('stop() y destroy() deben ser seguros de invocar sin contexto activo', () => {
        const sound = new RadioSound();
        assert.doesNotThrow(() => sound.stop());
        assert.doesNotThrow(() => sound.destroy());
    });

    it('radioAudio singleton exportado debe estar instanciado correctamente', () => {
        assert.ok(radioAudio instanceof RadioSound);
        assert.doesNotThrow(() => radioAudio.stop());
    });
});
