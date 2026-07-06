import { NumberFormatter } from './formatter.js';
import { createRipple } from '../ui/animations.js';

export class BasicCalculator {
    constructor(settingsManager, historyManager) {
        this.settingsManager = settingsManager;
        this.historyManager = historyManager;
        
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForNewValue = false;
        this.expressionString = '';
        
        this.initDOM();
        this.bindEvents();
        this.updateScreen();
    }

    initDOM() {
        this.screenCurrent = document.getElementById('calc-current');
        this.screenHistory = document.getElementById('calc-history-expr');
        this.keypad = document.querySelector('.calc-keypad');
        this.copyBtn = document.getElementById('copy-btn');
        this.statusIndicators = document.getElementById('status-indicators');
    }

    bindEvents() {
        // Event delegation for keypad
        this.keypad.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn');
            if (!btn) return;
            
            createRipple(e, btn);
            
            const action = btn.dataset.action;
            const value = btn.dataset.value;
            
            if (!action) {
                this.handleNumber(value);
            } else if (action === 'operator') {
                this.handleOperator(value);
            } else if (action === 'clear') {
                this.handleClear();
            } else if (action === 'delete') {
                this.handleDelete();
            } else if (action === 'equals') {
                this.handleEquals();
            } else if (action === 'toggle-sign') {
                this.handleToggleSign();
            } else if (action === 'percentage') {
                this.handlePercentage();
            }
            
            this.settingsManager.playSound(action === 'equals');
            this.updateScreen();
        });

        // Copy button
        this.copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(this.currentValue).then(() => {
                import('../ui/toast.js').then(module => {
                    module.Toast.show('Copied to clipboard');
                });
            });
        });

        // Restore history
        this.historyManager.onRestore = (item) => {
            this.currentValue = item.result.toString();
            this.previousValue = null;
            this.operator = null;
            this.expressionString = '';
            this.waitingForNewValue = true;
            this.updateScreen();
        };

        // Settings updates
        this.settingsManager.onFormatChange = () => this.updateScreen();
        
        // Keyboard support
        this.bindKeyboard();
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Only handle if we are not in age tab (which might have inputs focused)
            const activeTab = document.querySelector('.view-panel.active');
            if (activeTab && activeTab.id !== 'panel-basic') return;
            
            let handled = true;
            
            if (e.key >= '0' && e.key <= '9') {
                this.handleNumber(e.key);
            } else if (e.key === '.') {
                this.handleNumber('.');
            } else if (e.key === '+' || e.key === '-') {
                this.handleOperator(e.key === '-' ? '−' : '+');
            } else if (e.key === '*' || e.key === 'x') {
                this.handleOperator('×');
            } else if (e.key === '/') {
                this.handleOperator('÷');
                e.preventDefault();
            } else if (e.key === 'Enter' || e.key === '=') {
                this.handleEquals();
                e.preventDefault();
            } else if (e.key === 'Escape') {
                this.handleClear();
            } else if (e.key === 'Backspace') {
                this.handleDelete();
            } else if (e.key === '%') {
                this.handlePercentage();
            } else {
                handled = false;
            }

            if (handled) {
                this.settingsManager.playSound(e.key === 'Enter' || e.key === '=');
                this.updateScreen();
            }
        });
    }

    handleNumber(num) {
        if (this.currentValue === 'Error') {
            this.currentValue = '0';
        }

        if (this.waitingForNewValue) {
            this.currentValue = num === '.' ? '0.' : num;
            this.waitingForNewValue = false;
        } else {
            if (num === '.') {
                if (this.currentValue.includes('.')) return;
                this.currentValue += '.';
            } else {
                this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
            }
        }
    }

    handleOperator(nextOperator) {
        if (this.currentValue === 'Error') return;

        const inputValue = parseFloat(this.currentValue);

        if (this.operator && this.waitingForNewValue) {
            this.operator = nextOperator;
            this.expressionString = `${NumberFormatter.format(this.previousValue.toString(), this.settingsManager.formatEnabled)} ${this.operator}`;
            return;
        }

        if (this.previousValue == null) {
            this.previousValue = inputValue;
        } else if (this.operator) {
            const currentValue = this.previousValue || 0;
            const result = this.calculate(currentValue, inputValue, this.operator);
            
            if (!isFinite(result) || isNaN(result)) {
                this.currentValue = 'Error';
                this.previousValue = null;
                this.operator = null;
                this.expressionString = '';
                return;
            }

            // Fix floating point precision
            this.currentValue = `${parseFloat(result.toFixed(10))}`;
            this.previousValue = parseFloat(this.currentValue);
        }

        this.waitingForNewValue = true;
        this.operator = nextOperator;
        
        // Update expression string
        this.expressionString = `${NumberFormatter.format(this.previousValue.toString(), this.settingsManager.formatEnabled)} ${this.operator}`;
    }

    calculate(first, second, operator) {
        switch (operator) {
            case '+': return first + second;
            case '−': return first - second;
            case '×': return first * second;
            case '÷': return first / second;
            default: return second;
        }
    }

    handleEquals() {
        if (this.currentValue === 'Error' || !this.operator || this.waitingForNewValue) return;

        const inputValue = parseFloat(this.currentValue);
        const result = this.calculate(this.previousValue, inputValue, this.operator);

        if (!isFinite(result) || isNaN(result)) {
            this.currentValue = 'Error';
        } else {
            const finalResult = `${parseFloat(result.toFixed(10))}`;
            const expr = `${NumberFormatter.format(this.previousValue.toString(), this.settingsManager.formatEnabled)} ${this.operator} ${NumberFormatter.format(inputValue.toString(), this.settingsManager.formatEnabled)}`;
            
            this.historyManager.add(expr, NumberFormatter.format(finalResult, this.settingsManager.formatEnabled));
            
            this.currentValue = finalResult;
        }
        
        this.expressionString = '';
        this.operator = null;
        this.previousValue = null;
        this.waitingForNewValue = true;
        
        this.popScreen();
    }

    handleClear() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForNewValue = false;
        this.expressionString = '';
    }

    handleDelete() {
        if (this.waitingForNewValue || this.currentValue === 'Error') {
            this.handleClear();
            return;
        }
        
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
    }

    handleToggleSign() {
        if (this.currentValue === 'Error' || this.currentValue === '0') return;
        this.currentValue = (parseFloat(this.currentValue) * -1).toString();
    }

    handlePercentage() {
        if (this.currentValue === 'Error') return;
        this.currentValue = (parseFloat(this.currentValue) / 100).toString();
    }

    updateScreen() {
        this.screenCurrent.textContent = NumberFormatter.format(this.currentValue, this.settingsManager.formatEnabled);
        this.screenHistory.textContent = this.expressionString;
        
        if (this.currentValue === 'Error') {
            this.screenCurrent.classList.add('error');
        } else {
            this.screenCurrent.classList.remove('error');
        }
        
        // Adjust font size for large numbers
        const len = this.screenCurrent.textContent.length;
        if (len > 12) {
            this.screenCurrent.style.fontSize = '2rem';
        } else if (len > 9) {
            this.screenCurrent.style.fontSize = '2.8rem';
        } else {
            this.screenCurrent.style.fontSize = '3.5rem';
        }
    }
    
    popScreen() {
        this.screenCurrent.classList.remove('pop');
        // trigger reflow
        void this.screenCurrent.offsetWidth;
        this.screenCurrent.classList.add('pop');
    }
}
