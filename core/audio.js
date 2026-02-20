/**
 * ACT In-Session - Audio Engine
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

export const radioAudio = new RadioSound();
