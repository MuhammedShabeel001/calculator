export class BirthdayUtils {
    static getStatus(birthDateString) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const birthDate = new Date(birthDateString);
        
        // Find next birthday
        const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        // If birthday has already passed this year, it's next year
        if (nextBirthday.getTime() < today.getTime()) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        
        const diffMs = nextBirthday.getTime() - today.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return '🎉 Today is your birthday!';
        } else if (diffDays === 1) {
            return 'Tomorrow is your birthday!';
        } else {
            return `Next birthday in ${diffDays} days`;
        }
    }
}
