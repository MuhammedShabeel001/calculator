/**
 * Premium Modern Calculator
 * Modular Architecture with separation of concerns.
 */

/* LocalStorage Wrapper */
class StorageManager {
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`calc_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage', e);
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(`calc_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage', e);
        }
    }
}

/* Audio Context Manager */
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
        // Equals button gets a lower, more resonant tone. Normal buttons get a higher, shorter tap.
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

/* App Settings & UI State */
class SettingsManager {
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
        
        this.iconSoundOn = this.btnSound.querySelector('.sound-on-icon');
        this.iconSoundOff = this.btnSound.querySelector('.sound-off-icon');
        this.iconSun = this.btnTheme.querySelector('.sun-icon');
        this.iconMoon = this.btnTheme.querySelector('.moon-icon');
    }

    bindEvents() {
        this.btnFormat.addEventListener('click', () => {
            this.formatEnabled = !this.formatEnabled;
            StorageManager.set('format', this.formatEnabled);
            this.updateDOM();
            if (this.onFormatChange) this.onFormatChange();
        });

        this.btnSound.addEventListener('click', () => {
            this.soundEnabled = !this.soundEnabled;
            StorageManager.set('sound', this.soundEnabled);
            if (this.soundEnabled) this.soundManager.init();
            this.updateDOM();
            if (this.onSoundChange) this.onSoundChange();
        });

        this.btnTheme.addEventListener('click', () => {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            StorageManager.set('theme', this.theme);
            this.applyTheme();
            this.updateDOM();
            if (this.onThemeChange) this.onThemeChange();
        });
    }

    applyTheme() {
        if (this.theme === 'light') {
            document.body.setAttribute('data-theme', 'light');
        } else {
            document.body.removeAttribute('data-theme');
        }
    }

    updateDOM() {
        // Format icon
        this.btnFormat.classList.toggle('active', this.formatEnabled);
        
        // Sound icons
        this.btnSound.classList.toggle('active', this.soundEnabled);
        this.iconSoundOn.style.display = this.soundEnabled ? 'block' : 'none';
        this.iconSoundOff.style.display = this.soundEnabled ? 'none' : 'block';

        // Theme icons
        this.iconSun.style.display = this.theme === 'light' ? 'block' : 'none';
        this.iconMoon.style.display = this.theme === 'light' ? 'none' : 'block';
    }

    playSound(isEquals = false) {
        if (this.soundEnabled) {
            this.soundManager.playClick(isEquals);
        }
    }
}

/* History Management */
class HistoryManager {
    constructor() {
        this.history = StorageManager.get('history', []);
        this.panelVisible = StorageManager.get('history_visible', true);
        
        this.initDOM();
        this.bindEvents();
        this.render();
    }

    initDOM() {
        this.btnToggle = document.getElementById('toggle-history');
        this.panel = document.getElementById('history-panel');
        this.list = document.getElementById('history-list');
        this.btnClear = document.getElementById('history-clear-btn');
        
        // Initial state
        if (!this.panelVisible) {
            this.panel.classList.add('hidden');
        } else {
            this.btnToggle.classList.add('active');
        }
    }

    bindEvents() {
        this.btnToggle.addEventListener('click', () => {
            this.panelVisible = !this.panelVisible;
            StorageManager.set('history_visible', this.panelVisible);
            
            if (this.panelVisible) {
                this.panel.classList.remove('hidden');
                this.btnToggle.classList.add('active');
            } else {
                this.panel.classList.add('hidden');
                this.btnToggle.classList.remove('active');
            }
        });

        this.btnClear.addEventListener('click', () => {
            this.history = [];
            StorageManager.set('history', this.history);
            this.render();
        });
        
        // Delegate clicks for restoring history items
        this.list.addEventListener('click', (e) => {
            const item = e.target.closest('.history-item');
            if (!item) return;
            const index = item.dataset.index;
            if (index !== undefined && this.onRestore) {
                this.onRestore(this.history[index]);
            }
        });
    }

    addRecord(expr, result) {
        this.history.unshift({ expr, result });
        if (this.history.length > 20) {
            this.history.pop();
        }
        StorageManager.set('history', this.history);
        this.render();
    }

    render() {
        this.list.innerHTML = '';
        if (this.history.length === 0) {
            this.list.innerHTML = '<div class="history-empty">No history yet</div>';
            return;
        }

        this.history.forEach((record, index) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.dataset.index = index;
            div.innerHTML = `
                <div class="hist-expr">${record.expr}</div>
                <div class="hist-result">${record.result}</div>
            `;
            this.list.appendChild(div);
        });
    }
}

/* Math Engine */
class CalculatorEngine {
    constructor() {
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.expression = '';
        this.justEvaluated = false;
        this.error = false;
    }

    delete() {
        if (this.error || this.justEvaluated) {
            this.clear();
            return;
        }
        if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.error) this.clear();
        if (this.justEvaluated) {
            this.currentOperand = number === '.' ? '0.' : number;
            this.justEvaluated = false;
            return;
        }

        if (number === '.' && this.currentOperand.includes('.')) return;
        
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
            return;
        }

        // Limit digits
        if (this.currentOperand.replace(/[^0-9]/g, '').length >= 15 && !this.currentOperand.includes('e')) return;
        
        this.currentOperand += number;
    }

    chooseOperation(operation) {
        if (this.error) this.clear();
        if (this.currentOperand === '0' && this.previousOperand === '' && operation !== '−') return;
        
        const opSymbol = this.normalizeOp(operation);

        if (this.previousOperand !== '') {
            if (this.currentOperand === '0' && this.justEvaluated) {
                // Allows changing operation right after equals if user types operator
                this.expression = `${this.currentOperand} ${opSymbol}`;
            } else if (this.currentOperand === '0' && !this.justEvaluated) {
                 // User is switching operator without entering a number
                 this.operation = opSymbol;
                 // Replace the last operator in expression (which is " <op>")
                 this.expression = this.expression.slice(0, -2) + opSymbol;
                 return;
            } else {
                this.expression += ` ${this.currentOperand} ${opSymbol}`;
                this.computeIntermediate();
            }
        } else {
            this.expression = `${this.currentOperand} ${opSymbol}`;
            this.previousOperand = this.currentOperand;
            this.currentOperand = '0';
        }
        
        this.operation = opSymbol;
        this.justEvaluated = false;
    }
    
    normalizeOp(op) {
        if (op === '÷' || op === '/') return '÷';
        if (op === '×' || op === '*') return '×';
        if (op === '−' || op === '-') return '−';
        if (op === '+' || op === '+') return '+';
        return op;
    }

    computeIntermediate() {
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        
        let computation = this.calculate(prev, current, this.operation);
        if (computation === false) return;
        
        this.previousOperand = computation.toString();
        this.currentOperand = '0';
    }

    compute() {
        if (this.error || !this.operation || !this.previousOperand) return false;
        
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return false;

        let computation = this.calculate(prev, current, this.operation);
        if (computation === false) return false;

        const exprString = `${this.expression} ${this.currentOperand}`;
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.expression = '';
        this.justEvaluated = true;
        
        return { expr: exprString, result: this.currentOperand };
    }
    
    calculate(prev, current, operation) {
        let computation;
        switch (operation) {
            case '+': computation = prev + current; break;
            case '−': computation = prev - current; break;
            case '×': computation = prev * current; break;
            case '÷':
                if (current === 0) {
                    this.error = true;
                    this.currentOperand = "Error: Div by 0";
                    this.previousOperand = '';
                    this.operation = undefined;
                    this.expression = '';
                    return false;
                }
                computation = prev / current;
                break;
            default: return false;
        }

        // Fix floating point issues
        computation = Math.round(computation * 1e12) / 1e12;
        
        // Handle massive numbers with scientific notation
        if (Math.abs(computation) > 1e15 || (Math.abs(computation) < 1e-7 && computation !== 0)) {
            computation = computation.toExponential(6);
        }
        
        return computation;
    }

    toggleSign() {
        if (this.error) this.clear();
        if (this.currentOperand === '0') return;
        
        if (this.currentOperand.startsWith('-')) {
            this.currentOperand = this.currentOperand.slice(1);
        } else {
            this.currentOperand = '-' + this.currentOperand;
        }
    }

    percentage() {
        if (this.error) this.clear();
        if (this.currentOperand === '0') return;
        
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        
        // Fix float issues
        let computation = current / 100;
        computation = Math.round(computation * 1e12) / 1e12;
        
        this.currentOperand = computation.toString();
        this.justEvaluated = true;
    }
    
    restore(expr, result) {
        this.clear();
        this.currentOperand = result;
        this.justEvaluated = true;
    }
}

/* Formatting Utilities */
class FormatUtils {
    static formatNumber(numberStr, useFormatting) {
        if (isNaN(parseFloat(numberStr)) || numberStr.includes('Error')) return numberStr;
        if (numberStr.includes('e')) return numberStr; // Don't format scientific

        const parts = numberStr.split('.');
        let integerPart = parts[0];
        const decimalPart = parts[1];

        if (useFormatting) {
            const parsedInt = parseFloat(integerPart);
            if (!isNaN(parsedInt)) {
                integerPart = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(parsedInt);
            }
        }

        return decimalPart !== undefined ? `${integerPart}.${decimalPart}` : integerPart;
    }

    static formatExpression(exprString, useFormatting) {
        if (!useFormatting || !exprString) return exprString;
        return exprString.split(' ').map(part => {
            if (['+', '−', '×', '÷'].includes(part) || part === '') return part;
            return this.formatNumber(part, true);
        }).join(' ');
    }
}

/* Main UI Controller */
class UIManager {
    constructor(engine, settings, history) {
        this.engine = engine;
        this.settings = settings;
        this.history = history;
        
        this.historyElement = document.getElementById('calc-history-expr');
        this.currentElement = document.getElementById('calc-current');
        this.statusIndicators = document.getElementById('status-indicators');
        
        this.initEvents();
        this.updateDisplay();
        
        // Callbacks
        this.settings.onFormatChange = () => this.updateDisplay();
        this.settings.onThemeChange = () => this.updateStatusIndicators();
        this.settings.onSoundChange = () => this.updateStatusIndicators();
        
        this.history.onRestore = (record) => {
            this.engine.restore(record.expr, record.result);
            this.updateDisplay();
        };
    }

    initEvents() {
        // Setup cascading entrance animation for keypad buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach((btn, index) => {
            btn.style.animationDelay = `${0.1 + (index * 0.015)}s`;
        });
        
        // Sync history panel height to exactly match the calculator
        const syncHeight = () => {
            const calc = document.querySelector('.calculator');
            const hist = document.querySelector('.history-panel');
            if (calc && hist) {
                hist.style.height = `${calc.offsetHeight}px`;
            }
        };
        syncHeight();
        window.addEventListener('resize', syncHeight);

        // Keypad clicks
        document.querySelector('.calc-keypad').addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            // Add ripple
            this.createRipple(e, btn);
            this.handleInput(btn.dataset);
        });

        // Keyboard
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Copy functionality
        const copyBtn = document.getElementById('copy-btn');
        const screen = document.getElementById('calc-screen');
        
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyToClipboard();
        });
        
        screen.addEventListener('dblclick', () => {
            this.copyToClipboard();
        });
    }
    
    handleInput(dataset) {
        let isEquals = false;
        
        if (dataset.value !== undefined && !dataset.action) {
            this.engine.appendNumber(dataset.value);
        } else if (dataset.action === 'operator') {
            this.engine.chooseOperation(dataset.value);
        } else if (dataset.action === 'clear') {
            this.engine.clear();
        } else if (dataset.action === 'delete') {
            this.engine.delete();
        } else if (dataset.action === 'toggle-sign') {
            this.engine.toggleSign();
        } else if (dataset.action === 'percentage') {
            this.engine.percentage();
        } else if (dataset.action === 'equals') {
            const result = this.engine.compute();
            if (result) {
                this.history.addRecord(result.expr, result.result);
            }
            isEquals = true;
        }

        this.settings.playSound(isEquals);
        this.updateDisplay();
    }

    handleKeyboard(e) {
        if (e.repeat) return; // Prevent continuous firing
        
        let targetSelector = null;
        
        if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
            targetSelector = `[data-value="${e.key}"]`;
            this.engine.appendNumber(e.key);
        } else if (['+', '-', '*', '/'].includes(e.key)) {
            const map = {'+': '+', '-': '−', '*': '×', '/': '÷'};
            targetSelector = `[data-value="${map[e.key]}"]`;
            this.engine.chooseOperation(map[e.key]);
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            targetSelector = '[data-action="equals"]';
            const result = this.engine.compute();
            if (result) this.history.addRecord(result.expr, result.result);
            this.settings.playSound(true);
            this.updateDisplay();
            this.simulateBtn(targetSelector);
            return;
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            targetSelector = '[data-action="delete"]';
            this.engine.delete();
        } else if (e.key === 'Escape') {
            targetSelector = '[data-action="clear"]';
            this.engine.clear();
        } else if (e.key === '%') {
            targetSelector = '[data-action="percentage"]';
            this.engine.percentage();
        }

        if (targetSelector) {
            if (e.key !== 'Enter' && e.key !== '=') this.settings.playSound();
            this.updateDisplay();
            this.simulateBtn(targetSelector);
        }
    }

    updateDisplay() {
        // Handle Error state
        if (this.engine.error) {
            this.currentElement.innerText = this.engine.currentOperand;
            this.currentElement.classList.add('error');
            this.historyElement.innerText = '';
            return;
        }

        this.currentElement.classList.remove('error');
        
        // Format numbers
        const formattedCurrent = FormatUtils.formatNumber(this.engine.currentOperand, this.settings.formatEnabled);
        this.currentElement.innerText = formattedCurrent;
        
        if (this.engine.expression) {
            this.historyElement.innerText = FormatUtils.formatExpression(this.engine.expression, this.settings.formatEnabled);
        } else {
            this.historyElement.innerText = '';
        }

        // Dynamic font resizing
        const len = this.currentElement.innerText.length;
        if (len > 12) this.currentElement.style.fontSize = '1.8rem';
        else if (len > 9) this.currentElement.style.fontSize = '2.5rem';
        else this.currentElement.style.fontSize = '3.5rem';
        
        // Add subtle pop animation
        this.currentElement.classList.remove('pop');
        // Force reflow to trigger animation restart
        void this.currentElement.offsetWidth;
        this.currentElement.classList.add('pop');
        
        if (this.popTimeout) clearTimeout(this.popTimeout);
        this.popTimeout = setTimeout(() => this.currentElement.classList.remove('pop'), 150);
        
        this.updateStatusIndicators();
    }
    
    updateStatusIndicators() {
        let indicators = [];
        if (this.settings.formatEnabled) indicators.push('1,0');
        if (this.settings.soundEnabled) indicators.push('♪');
        
        this.statusIndicators.innerText = indicators.join(' • ');
    }

    createRipple(e, btn) {
        const circle = document.createElement('div');
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        
        // If clicking via keyboard, e.clientX is usually 0. Center it.
        if (e.clientX === 0 && e.clientY === 0) {
            circle.style.left = `${btn.clientWidth / 2 - radius}px`;
            circle.style.top = `${btn.clientHeight / 2 - radius}px`;
        } else {
            circle.style.left = `${e.clientX - btn.getBoundingClientRect().left - radius}px`;
            circle.style.top = `${e.clientY - btn.getBoundingClientRect().top - radius}px`;
        }
        
        circle.classList.add('ripple');

        btn.appendChild(circle);
        circle.addEventListener('animationend', () => circle.remove());
    }
    
    simulateBtn(selector) {
        const btn = document.querySelector(selector);
        if (btn) {
            btn.style.transition = 'all 0.05s ease';
            btn.style.transform = 'translateY(2px) scale(0.94)';
            btn.style.filter = 'brightness(1.2)';
            btn.style.zIndex = '10';
            
            // Trigger ripple for keyboard users
            this.createRipple({clientX: 0, clientY: 0}, btn);
            
            setTimeout(() => {
                btn.style.transition = '';
                btn.style.transform = '';
                btn.style.filter = '';
                btn.style.zIndex = '';
            }, 100);
        }
    }

    copyToClipboard() {
        if (this.engine.error) return;
        
        // Copy the raw number, not the formatted string
        const text = this.engine.currentOperand;
        navigator.clipboard.writeText(text).then(() => {
            this.showToast();
        });
    }

    showToast() {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }
}

// ---------------------------------------------------------
// Bootstrap App
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const soundManager = new SoundManager();
    const settingsManager = new SettingsManager(soundManager);
    const historyManager = new HistoryManager();
    const engine = new CalculatorEngine();
    
    // Attach UI
    new UIManager(engine, settingsManager, historyManager);
});
