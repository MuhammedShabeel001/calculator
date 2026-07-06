import { StorageManager } from '../storage.js';

export class HistoryManager {
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
        
        if (this.panel && this.btnToggle) {
            if (!this.panelVisible) {
                this.panel.classList.add('hidden');
            } else {
                this.btnToggle.classList.add('active');
            }
        }
    }

    bindEvents() {
        if (this.btnToggle && this.panel) {
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
        }

        if (this.btnClear) {
            this.btnClear.addEventListener('click', () => {
                this.history = [];
                StorageManager.set('history', this.history);
                this.render();
            });
        }
        
        if (this.list) {
            this.list.addEventListener('click', (e) => {
                const item = e.target.closest('.history-item');
                if (!item) return;
                const index = item.dataset.index;
                if (index !== undefined && this.onRestore) {
                    this.onRestore(this.history[index]);
                }
            });
        }
    }

    add(expression, result) {
        // Prevent duplicates
        if (this.history.length > 0) {
            const last = this.history[this.history.length - 1];
            if (last.expression === expression && last.result === result) {
                return;
            }
        }

        this.history.push({ expression, result });
        // Keep only last 50 items
        if (this.history.length > 50) {
            this.history.shift();
        }
        StorageManager.set('history', this.history);
        this.render();
    }

    render() {
        if (!this.list) return;

        if (this.history.length === 0) {
            this.list.innerHTML = '<div class="history-empty">No history yet</div>';
            return;
        }

        this.list.innerHTML = '';
        
        // Render in reverse order (newest top)
        for (let i = this.history.length - 1; i >= 0; i--) {
            const item = this.history[i];
            const div = document.createElement('div');
            div.className = 'history-item';
            div.dataset.index = i;
            div.setAttribute('role', 'button');
            div.setAttribute('tabindex', '0');
            div.setAttribute('aria-label', `Restore calculation: ${item.expression} equals ${item.result}`);
            
            div.innerHTML = `
                <div class="hist-expr">${item.expression} =</div>
                <div class="hist-result">${item.result}</div>
            `;
            
            this.list.appendChild(div);
        }
    }
}
