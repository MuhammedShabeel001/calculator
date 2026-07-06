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
        this.tabTip = document.getElementById('tab-tip');
        this.panelBasic = document.getElementById('panel-basic');
        this.panelAge = document.getElementById('panel-age');
        this.panelTip = document.getElementById('panel-tip');
        this.indicator = document.getElementById('tab-indicator');
        this.historyPanel = document.getElementById('history-panel'); // We might want to hide history for Age calc
        this.historyToggle = document.getElementById('toggle-history');
        this.formatToggle = document.getElementById('toggle-format');
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

        this.tabTip.addEventListener('click', () => {
            this.activateTab('tip');
            if (this.soundManager) this.soundManager.playClick();
        });
    }

    activateTab(tabId, animate = true) {
        this.activeTab = tabId;
        StorageManager.set('active_tab', tabId);

        // Reset all tabs
        const tabs = [this.tabBasic, this.tabAge, this.tabTip];
        const panels = [this.panelBasic, this.panelAge, this.panelTip];
        
        tabs.forEach(tab => {
            if (tab) {
                tab.classList.remove('active');
                tab.setAttribute('aria-selected', 'false');
            }
        });
        
        panels.forEach(panel => {
            if (panel) panel.classList.remove('active');
        });

        let translateVal = '0';
        let showHistory = false;
        let showFormat = true;

        if (tabId === 'basic') {
            if (this.tabBasic) {
                this.tabBasic.classList.add('active');
                this.tabBasic.setAttribute('aria-selected', 'true');
            }
            if (this.panelBasic) this.panelBasic.classList.add('active');
            translateVal = '0';
            showHistory = true;
            showFormat = true;
        } else if (tabId === 'age') {
            if (this.tabAge) {
                this.tabAge.classList.add('active');
                this.tabAge.setAttribute('aria-selected', 'true');
            }
            if (this.panelAge) this.panelAge.classList.add('active');
            translateVal = '100%';
            showHistory = false;
            showFormat = false;
        } else if (tabId === 'tip') {
            if (this.tabTip) {
                this.tabTip.classList.add('active');
                this.tabTip.setAttribute('aria-selected', 'true');
            }
            if (this.panelTip) this.panelTip.classList.add('active');
            translateVal = '200%';
            showHistory = false;
            showFormat = true;
        }

        if (this.indicator) {
            this.indicator.style.transform = `translateX(${translateVal})`;
        }
        
        if (showHistory) {
            if (this.historyToggle) this.historyToggle.style.display = 'flex';
            if (this.historyPanel && StorageManager.get('history_visible', true)) {
                this.historyPanel.classList.remove('hidden');
            }
        } else {
            if (this.historyToggle) this.historyToggle.style.display = 'none';
            if (this.historyPanel) this.historyPanel.classList.add('hidden');
        }

        if (this.formatToggle) {
            this.formatToggle.style.display = showFormat ? 'flex' : 'none';
        }
    }
}
