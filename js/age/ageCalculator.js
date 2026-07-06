import { DateUtils } from './dateUtils.js?v=2';
import { AgeValidation } from './validation.js?v=2';
import { BirthdayUtils } from './birthday.js?v=2';
import { createRipple } from '../ui/animations.js?v=2';

export class AgeCalculator {
    constructor(soundManager) {
        this.soundManager = soundManager;
        this.liveInterval = null;
        this.liveTimeout = null;
        this.initDOM();
        this.bindEvents();
    }

    initDOM() {
        this.inputDob = document.getElementById('dob-input');
        this.errorMsg = document.getElementById('dob-error');
        
        this.btnReset = document.getElementById('age-reset');
        this.btnCalculate = document.getElementById('age-calculate');
        
        this.resultContainer = document.getElementById('age-result-container');
        
        this.outYears = document.getElementById('age-years');
        this.outMonths = document.getElementById('age-months');
        this.outDays = document.getElementById('age-days');
        
        this.statusBirthday = document.getElementById('birthday-status');
        
        this.statYears = document.getElementById('stat-years');
        this.statMonths = document.getElementById('stat-months');
        this.statWeeks = document.getElementById('stat-weeks');
        this.statDays = document.getElementById('stat-days');
        this.statHours = document.getElementById('stat-hours');
        this.statMinutes = document.getElementById('stat-minutes');
        this.statSeconds = document.getElementById('stat-seconds');
    }

    bindEvents() {
        this.btnCalculate.addEventListener('click', (e) => {
            createRipple(e, this.btnCalculate);
            if (this.soundManager) this.soundManager.playClick(true);
            this.calculate();
        });

        this.btnReset.addEventListener('click', (e) => {
            createRipple(e, this.btnReset);
            if (this.soundManager) this.soundManager.playClick();
            this.reset();
        });

        this.inputDob.addEventListener('input', () => {
            this.clearError();
        });
    }

    showError(msg) {
        this.inputDob.classList.add('invalid');
        this.errorMsg.textContent = msg;
        this.errorMsg.classList.add('show');
    }

    clearError() {
        this.inputDob.classList.remove('invalid');
        this.errorMsg.classList.remove('show');
    }

    calculate() {
        const dateString = this.inputDob.value;
        const validation = AgeValidation.validate(dateString);
        
        if (!validation.isValid) {
            this.showError(validation.error);
            return;
        }

        this.clearError();
        
        // Calculate age
        const age = DateUtils.calculateAge(dateString);
        
        // Calculate stats
        const stats = DateUtils.getStats(dateString);
        
        // Get birthday status
        const status = BirthdayUtils.getStatus(dateString);

        this.stopLiveUpdate();
        this.animateResult(age, stats, status);
        
        // Start live ticking after animation
        this.liveTimeout = setTimeout(() => {
            this.startLiveUpdate(dateString);
        }, 850);
    }

    animateResult(age, stats, status) {
        // Show container with animation
        this.resultContainer.classList.remove('hidden');
        this.resultContainer.classList.add('fade-in-up');
        
        // Temporarily reset animation class to re-trigger if needed
        setTimeout(() => {
            this.resultContainer.classList.remove('fade-in-up');
        }, 500);

        this.animateValue(this.outYears, 0, age.years, 800);
        this.animateValue(this.outMonths, 0, age.months, 800);
        this.animateValue(this.outDays, 0, age.days, 800);

        this.animateValue(this.statYears, 0, stats.totalYears, 800);
        this.animateValue(this.statMonths, 0, stats.totalMonths, 800);
        this.animateValue(this.statWeeks, 0, stats.totalWeeks, 800);
        this.animateValue(this.statDays, 0, stats.totalDays, 800);
        this.animateValue(this.statHours, 0, stats.totalHours, 800);
        this.animateValue(this.statMinutes, 0, stats.totalMinutes, 800);
        this.animateValue(this.statSeconds, 0, stats.totalSeconds, 800);
        
        this.statusBirthday.textContent = status;
    }

    animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // easeOutQuart
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            
            const currentVal = Math.floor(easeProgress * (end - start) + start);
            obj.innerHTML = new Intl.NumberFormat('en-IN').format(currentVal);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = new Intl.NumberFormat('en-IN').format(end);
            }
        };
        window.requestAnimationFrame(step);
    }

    startLiveUpdate(dateString) {
        this.liveInterval = setInterval(() => {
            const age = DateUtils.calculateAge(dateString);
            const stats = DateUtils.getStats(dateString);
            
            this.outYears.innerHTML = age.years;
            this.outMonths.innerHTML = age.months;
            this.outDays.innerHTML = age.days;
            
            this.statYears.innerHTML = new Intl.NumberFormat('en-IN').format(stats.totalYears);
            this.statMonths.innerHTML = new Intl.NumberFormat('en-IN').format(stats.totalMonths);
            this.statWeeks.innerHTML = new Intl.NumberFormat('en-IN').format(stats.totalWeeks);
            this.statDays.innerHTML = new Intl.NumberFormat('en-IN').format(stats.totalDays);
            this.statHours.innerHTML = new Intl.NumberFormat('en-IN').format(stats.totalHours);
            this.statMinutes.innerHTML = new Intl.NumberFormat('en-IN').format(stats.totalMinutes);
            this.statSeconds.innerHTML = new Intl.NumberFormat('en-IN').format(stats.totalSeconds);
        }, 1000);
    }

    stopLiveUpdate() {
        if (this.liveTimeout) clearTimeout(this.liveTimeout);
        if (this.liveInterval) clearInterval(this.liveInterval);
        this.liveTimeout = null;
        this.liveInterval = null;
    }

    reset() {
        this.stopLiveUpdate();
        this.inputDob.value = '';
        this.clearError();
        this.resultContainer.classList.add('hidden');
    }
}
