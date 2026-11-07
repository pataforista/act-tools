/**
 * ACT In-Session - Audio Engine
 */

export class RadioSound {
    constructor() {
        this.ctx = null;
        this.noise = null;
        this.gain = null;
    }

    init() {
        if (this.ctx) return;
        const AudioCtx = typeof window !== 'undefined'
            ? (window.AudioContext || window.webkitAudioContext)
            : null;
        if (!AudioCtx) return;

        try {
            this.ctx = new AudioCtx();

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
        } catch (e) {
            console.warn('Web Audio no disponible o bloqueado:', e);
        }
    }

    setVolume(value) { // 0 to 1
        if (!this.ctx) this.init();
        if (!this.ctx || !this.gain) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        this.gain.gain.setTargetAtTime(value * 0.1, this.ctx.currentTime, 0.05);
    }

    stop() {
        if (this.gain && this.ctx) {
            this.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
            // Suspend context to yield audio thread
            setTimeout(() => {
                if (this.ctx && this.ctx.state === 'running' && this.gain && this.gain.gain.value < 0.01) {
                    this.ctx.suspend().catch(() => {});
                }
            }, 100);
        }
    }

    destroy() {
        this.stop();
        if (this.noise) {
            try { this.noise.stop(); this.noise.disconnect(); } catch (_) {}
            this.noise = null;
        }
        if (this.gain) {
            try { this.gain.disconnect(); } catch (_) {}
            this.gain = null;
        }
        if (this.ctx) {
            try { this.ctx.close(); } catch (_) {}
            this.ctx = null;
        }
    }
}

export const radioAudio = new RadioSound();
