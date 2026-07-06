export class NumberFormatter {
    static format(value, isFormatEnabled = true) {
        if (value === 'Error') return value;
        if (!isFormatEnabled) return value;
        
        // Handle negative sign easily
        let isNegative = false;
        if (value.startsWith('-')) {
            isNegative = true;
            value = value.substring(1);
        }

        // Split into integer and decimal parts
        const parts = value.split('.');
        const integerPart = parts[0];
        const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

        // Add commas
        let formattedInteger = integerPart;
        if (integerPart.length > 3) {
            formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        return (isNegative ? '-' : '') + formattedInteger + decimalPart;
    }
}
