import { StorageManager } from '../storage.js';

export class SettingsManager {
    constructor(soundManager) {
        this.soundManager = soundManager;
        this.formatEnabled = StorageManager.get('format', true);
        this.soundEnabled = StorageManager.get('sound', false);
        this.theme = StorageManager.get('theme', 'dark');
        
        this.initDOM();
        this.applyTheme();
        this.updateDOM();
        this.bindEvents();
    }

    initDOM() {
        this.btnFormat = document.getElementById('toggle-format');
        this.btnSound = document.getElementById('toggle-sound');
        this.btnTheme = document.getElementById('toggle-theme');
        
        if (this.btnSound) {
            this.iconSoundOn = this.btnSound.querySelector('.sound-on-icon');
            this.iconSoundOff = this.btnSound.querySelector('.sound-off-icon');
        }
        if (this.btnTheme) {
            this.iconSun = this.btnTheme.querySelector('.sun-icon');
            this.iconMoon = this.btnTheme.querySelector('.moon-icon');
        }
    }

    bindEvents() {
        if (this.btnFormat) {
            this.btnFormat.addEventListener('click', () => {
                this.formatEnabled = !this.formatEnabled;
                StorageManager.set('format', this.formatEnabled);
                this.updateDOM();
                if (this.onFormatChange) this.onFormatChange();
            });
        }

        if (this.btnSound) {
            this.btnSound.addEventListener('click', () => {
                this.soundEnabled = !this.soundEnabled;
                StorageManager.set('sound', this.soundEnabled);
                if (this.soundEnabled && this.soundManager) this.soundManager.init();
                this.updateDOM();
                if (this.onSoundChange) this.onSoundChange();
            });
        }

        if (this.btnTheme) {
            this.btnTheme.addEventListener('click', () => {
                this.theme = this.theme === 'dark' ? 'light' : 'dark';
                StorageManager.set('theme', this.theme);
                this.applyTheme();
                this.updateDOM();
                if (this.onThemeChange) this.onThemeChange();
            });
        }
    }

    applyTheme() {
        if (this.theme === 'light') {
            document.body.setAttribute('data-theme', 'light');
        } else {
            document.body.removeAttribute('data-theme');
        }
    }

    updateDOM() {
        if (this.btnFormat) this.btnFormat.classList.toggle('active', this.formatEnabled);
        
        if (this.btnSound) {
            this.btnSound.classList.toggle('active', this.soundEnabled);
            this.iconSoundOn.style.display = this.soundEnabled ? 'block' : 'none';
            this.iconSoundOff.style.display = this.soundEnabled ? 'none' : 'block';
        }

        if (this.btnTheme) {
            this.iconSun.style.display = this.theme === 'light' ? 'block' : 'none';
            this.iconMoon.style.display = this.theme === 'light' ? 'none' : 'block';
        }
    }

    playSound(isEquals = false) {
        if (this.soundEnabled && this.soundManager) {
            this.soundManager.playClick(isEquals);
        }
    }
}
