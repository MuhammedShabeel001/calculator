import { StorageManager } from '../storage.js';

export class TabManager {
    constructor(soundManager) {
        this.soundManager = soundManager;
        this.activeTab = StorageManager.get('active_tab', 'basic');
        this.initDOM();
        this.bindEvents();
        this.activateTab(this.activeTab, false); // initial load
    }

    initDOM() {
        this.tabBasic = document.getElementById('tab-basic');
        this.tabAge = document.getElementById('tab-age');
        this.panelBasic = document.getElementById('panel-basic');
        this.panelAge = document.getElementById('panel-age');
        this.indicator = document.getElementById('tab-indicator');
        this.historyPanel = document.getElementById('history-panel'); // We might want to hide history for Age calc
        this.historyToggle = document.getElementById('toggle-history');
    }

    bindEvents() {
        this.tabBasic.addEventListener('click', () => {
            this.activateTab('basic');
            if (this.soundManager) this.soundManager.playClick();
        });
        
        this.tabAge.addEventListener('click', () => {
            this.activateTab('age');
            if (this.soundManager) this.soundManager.playClick();
        });
    }

    activateTab(tabId, animate = true) {
        this.activeTab = tabId;
        StorageManager.set('active_tab', tabId);

        if (tabId === 'basic') {
            this.tabBasic.classList.add('active');
            this.tabBasic.setAttribute('aria-selected', 'true');
            this.tabAge.classList.remove('active');
            this.tabAge.setAttribute('aria-selected', 'false');
            
            this.indicator.style.transform = 'translateX(0)';
            
            this.panelBasic.classList.add('active');
            this.panelAge.classList.remove('active');
            
            if (this.historyToggle) this.historyToggle.style.display = 'flex';
            if (this.historyPanel && StorageManager.get('history_visible', true)) {
                this.historyPanel.classList.remove('hidden');
            }
        } else {
            this.tabAge.classList.add('active');
            this.tabAge.setAttribute('aria-selected', 'true');
            this.tabBasic.classList.remove('active');
            this.tabBasic.setAttribute('aria-selected', 'false');
            
            this.indicator.style.transform = 'translateX(100%)';
            
            this.panelAge.classList.add('active');
            this.panelBasic.classList.remove('active');
            
            // Hide history panel in age calculator mode
            if (this.historyToggle) this.historyToggle.style.display = 'none';
            if (this.historyPanel) this.historyPanel.classList.add('hidden');
        }
    }
}
