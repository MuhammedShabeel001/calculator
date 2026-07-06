import { 
    calculateTipAmount, 
    calculateTotalBill, 
    calculateEachPersonPays, 
    calculatePerPersonTip 
} from './calculations.js';
import { formatCurrency, formatNumberWithCommas } from './formatter.js';
import { validateBill, validatePeople } from './validation.js';
import { StorageManager } from '../storage.js';

export class TipCalculator {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.soundManager = settingsManager.soundManager;
        
        // State
        this.billAmount = StorageManager.get('tip_bill', 0);
        this.tipPercentage = StorageManager.get('tip_percentage', 10);
        this.numberOfPeople = StorageManager.get('tip_people', 1);

        this.initDOM();
        this.bindEvents();
        this.restoreState();
        
        // Initial Calculation if values exist
        if (this.billAmount > 0) {
            this.calculate();
        }
        
        // Listen to format toggles
        const originalFormatChange = this.settingsManager.onFormatChange;
        this.settingsManager.onFormatChange = () => {
            if (originalFormatChange) originalFormatChange();
            if (this.billAmount > 0) {
                if (document.activeElement !== this.billInput) {
                    this.billInput.value = this.settingsManager.formatEnabled 
                        ? formatNumberWithCommas(this.billAmount, true) 
                        : this.billAmount;
                }
                this.calculate();
            }
        };
    }

    initDOM() {
        // Inputs
        this.billInput = document.getElementById('bill-input');
        this.billWrapper = document.querySelector('.bill-input-wrapper');
        this.billError = document.getElementById('bill-error');
        
        this.tipSlider = document.getElementById('tip-slider');
        this.tipDisplay = document.getElementById('tip-display');
        this.quickTips = document.querySelectorAll('.tip-chip');
        
        this.peopleInput = document.getElementById('people-input');
        this.peopleWrapper = document.querySelector('.stepper-wrapper');
        this.peopleError = document.getElementById('people-error');
        this.peopleMinus = document.getElementById('people-minus');
        this.peoplePlus = document.getElementById('people-plus');
        
        // Actions
        this.resetBtn = document.getElementById('tip-reset');
        
        // Results
        this.resultContainer = document.getElementById('tip-result-container');
        this.eachPaysOutput = document.getElementById('tip-each-pays');
        this.tipAmountOutput = document.getElementById('stat-tip-amount');
        this.totalBillOutput = document.getElementById('stat-total-bill');
        this.perPersonTipOutput = document.getElementById('stat-per-person-tip');
    }

    restoreState() {
        if (this.billAmount > 0) {
            this.billInput.value = this.settingsManager.formatEnabled 
                ? formatNumberWithCommas(this.billAmount, true) 
                : this.billAmount;
        }
        
        this.tipSlider.value = this.tipPercentage;
        this.tipDisplay.textContent = this.tipPercentage;
        this.updateActiveChip();
        
        this.peopleInput.value = this.numberOfPeople;
    }

    bindEvents() {
        // Bill Input
        this.billInput.addEventListener('input', (e) => {
            const val = e.target.value;
            this.validateAndUpdateBill(val);
        });

        this.billInput.addEventListener('focus', (e) => {
            if (this.billAmount > 0) {
                e.target.value = this.billAmount;
            }
        });

        this.billInput.addEventListener('blur', (e) => {
            if (this.billAmount > 0) {
                e.target.value = this.settingsManager.formatEnabled 
                    ? formatNumberWithCommas(this.billAmount, true) 
                    : this.billAmount;
            }
        });

        // Tip Slider
        this.tipSlider.addEventListener('input', (e) => {
            this.tipPercentage = parseInt(e.target.value, 10);
            this.tipDisplay.textContent = this.tipPercentage;
            this.updateActiveChip();
            this.saveStateAndCalculate();
        });

        // Quick Tips
        this.quickTips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                if (this.soundManager) this.soundManager.playClick();
                this.tipPercentage = parseInt(e.target.dataset.tip, 10);
                this.tipSlider.value = this.tipPercentage;
                this.tipDisplay.textContent = this.tipPercentage;
                this.updateActiveChip();
                this.saveStateAndCalculate();
            });
        });

        // People Stepper
        this.peopleInput.addEventListener('input', (e) => {
            const val = e.target.value;
            this.validateAndUpdatePeople(val);
        });

        this.peopleMinus.addEventListener('click', () => {
            if (this.soundManager) this.soundManager.playClick();
            let current = parseInt(this.peopleInput.value, 10) || 1;
            if (current > 1) {
                this.peopleInput.value = current - 1;
                this.validateAndUpdatePeople(this.peopleInput.value);
            }
        });

        this.peoplePlus.addEventListener('click', () => {
            if (this.soundManager) this.soundManager.playClick();
            let current = parseInt(this.peopleInput.value, 10) || 1;
            this.peopleInput.value = current + 1;
            this.validateAndUpdatePeople(this.peopleInput.value);
        });

        // Actions
        this.resetBtn.addEventListener('click', () => {
            if (this.soundManager) this.soundManager.playClick();
            this.reset();
        });
    }

    updateActiveChip() {
        this.quickTips.forEach(chip => {
            if (parseInt(chip.dataset.tip, 10) === this.tipPercentage) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    }

    validateAndUpdateBill(val) {
        const result = validateBill(val);
        if (result.isValid) {
            this.billAmount = result.value;
            this.clearError(this.billWrapper, this.billError);
            this.saveStateAndCalculate();
            return true;
        } else {
            this.showError(this.billWrapper, this.billError, result.message);
            // Hide results on invalid input
            this.resultContainer.classList.add('hidden');
            return false;
        }
    }

    validateAndUpdatePeople(val) {
        const result = validatePeople(val);
        if (result.isValid) {
            this.numberOfPeople = result.value;
            this.clearError(this.peopleWrapper, this.peopleError);
            this.saveStateAndCalculate();
            return true;
        } else {
            this.showError(this.peopleWrapper, this.peopleError, result.message);
            this.resultContainer.classList.add('hidden');
            return false;
        }
    }

    showError(wrapper, errorEl, msg) {
        wrapper.classList.add('invalid');
        errorEl.textContent = msg;
        errorEl.classList.add('show');
    }

    clearError(wrapper, errorEl) {
        wrapper.classList.remove('invalid');
        errorEl.textContent = '';
        errorEl.classList.remove('show');
    }

    saveStateAndCalculate() {
        StorageManager.set('tip_bill', this.billAmount);
        StorageManager.set('tip_percentage', this.tipPercentage);
        StorageManager.set('tip_people', this.numberOfPeople);
        this.calculate();
    }

    calculate() {
        if (this.billAmount <= 0 || this.numberOfPeople < 1) {
            this.resultContainer.classList.add('hidden');
            return;
        }

        const tipAmount = calculateTipAmount(this.billAmount, this.tipPercentage);
        const totalBill = calculateTotalBill(this.billAmount, tipAmount);
        const eachPersonPays = calculateEachPersonPays(totalBill, this.numberOfPeople);
        const perPersonTip = calculatePerPersonTip(tipAmount, this.numberOfPeople);

        const formatEnabled = this.settingsManager.formatEnabled;
        
        // Update DOM
        this.eachPaysOutput.textContent = formatCurrency(eachPersonPays, formatEnabled);
        this.tipAmountOutput.textContent = formatCurrency(tipAmount, formatEnabled);
        this.totalBillOutput.textContent = formatCurrency(totalBill, formatEnabled);
        this.perPersonTipOutput.textContent = formatCurrency(perPersonTip, formatEnabled);

        // Show results
        this.resultContainer.classList.remove('hidden');
    }

    reset() {
        this.billInput.value = '';
        this.billAmount = 0;
        this.clearError(this.billWrapper, this.billError);
        
        this.tipPercentage = 10;
        this.tipSlider.value = 10;
        this.tipDisplay.textContent = 10;
        this.updateActiveChip();
        
        this.numberOfPeople = 1;
        this.peopleInput.value = 1;
        this.clearError(this.peopleWrapper, this.peopleError);
        
        this.resultContainer.classList.add('hidden');
        
        StorageManager.set('tip_bill', 0);
        StorageManager.set('tip_percentage', 10);
        StorageManager.set('tip_people', 1);
    }
}
