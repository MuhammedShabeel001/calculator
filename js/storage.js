export class StorageManager {
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
