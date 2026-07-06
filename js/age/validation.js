export class AgeValidation {
    static validate(dateString) {
        if (!dateString) {
            return { isValid: false, error: 'Please enter your date of birth.' };
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return { isValid: false, error: 'Please enter a valid date.' };
        }

        const today = new Date();
        // Reset time for accurate comparison
        today.setHours(0, 0, 0, 0);
        const birthDate = new Date(date);
        birthDate.setHours(0, 0, 0, 0);

        if (birthDate.getTime() > today.getTime()) {
            return { isValid: false, error: 'Date of birth cannot be in the future.' };
        }

        // Optional: Check if unrealistic age (e.g. over 150 years)
        const yearsDiff = today.getFullYear() - birthDate.getFullYear();
        if (yearsDiff > 150) {
            return { isValid: false, error: 'Please enter a more recent date.' };
        }

        return { isValid: true, error: null };
    }
}
