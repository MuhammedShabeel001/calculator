export class DateUtils {
    /**
     * Calculate difference between two dates accurately.
     * Returns an object { years, months, days }
     */
    static calculateAge(birthDate, targetDate = new Date()) {
        const startDate = new Date(birthDate);
        const endDate = new Date(targetDate);
        
        let years = endDate.getFullYear() - startDate.getFullYear();
        let months = endDate.getMonth() - startDate.getMonth();
        let days = endDate.getDate() - startDate.getDate();
        
        // Adjust if day difference is negative
        if (days < 0) {
            months--;
            // Get number of days in the previous month of the end date
            const previousMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
            days += previousMonth.getDate();
        }
        
        // Adjust if month difference is negative
        if (months < 0) {
            years--;
            months += 12;
        }
        
        return { years, months, days };
    }

    /**
     * Get exact statistics in total units
     */
    static getStats(birthDate, targetDate = new Date()) {
        const start = new Date(birthDate).getTime();
        const end = new Date(targetDate).getTime();
        
        // Normalize to ignore time of day
        const diffMs = Math.abs(end - start);
        
        // Total days
        const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        // Total weeks
        const totalWeeks = Math.floor(totalDays / 7);
        
        // Accurate Total Months
        // calculateAge gives us years and months, total months is years * 12 + months
        const age = this.calculateAge(birthDate, targetDate);
        const totalMonths = (age.years * 12) + age.months;
        
        return {
            totalYears: age.years,
            totalMonths,
            totalWeeks,
            totalDays
        };
    }
}
