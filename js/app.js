// Entry Point
import { SettingsManager } from './ui/theme.js';
import { TabManager } from './ui/tabs.js';
import { HistoryManager } from './basic/history.js';
import { BasicCalculator } from './basic/calculator.js';
import { AgeCalculator } from './age/ageCalculator.js';
import { TipCalculator } from './tip/tipCalculator.js';

// Sound Manager class definition inside app.js or separate file. 
// Given the simplicity, we'll implement it here.
class SoundManager {
    constructor() {
        this.audioCtx = null;
    }

    init() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
    }

    playClick(isEquals = false) {
        if (!this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        osc.type = 'sine';
        // Equals button gets a lower, more resonant tone
        osc.frequency.setValueAtTime(isEquals ? 150 : 300, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioCtx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);

        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Core Systems
    const soundManager = new SoundManager();
    const settingsManager = new SettingsManager(soundManager);
    const historyManager = new HistoryManager();

    // Initialize UI Managers
    const tabManager = new TabManager(soundManager);

    // Initialize Calculators
    const basicCalc = new BasicCalculator(settingsManager, historyManager);
    const ageCalc = new AgeCalculator(soundManager);
    const tipCalc = new TipCalculator(settingsManager);
});
