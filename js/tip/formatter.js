/**
 * Format numbers as Indian Rupee (₹).
 */
export const formatCurrency = (amount, isFormatEnabled = true) => {
    if (isNaN(amount) || amount === null) {
        return '₹0.00';
    }
    
    if (!isFormatEnabled) {
        return `₹${amount.toFixed(2)}`;
    }
    
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

/**
 * Format plain numbers with commas (no currency symbol).
 */
export const formatNumberWithCommas = (amount, isFormatEnabled = true) => {
    if (isNaN(amount) || amount === null || amount === '') {
        return '';
    }
    
    if (!isFormatEnabled) {
        return amount.toString();
    }
    
    return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2
    }).format(amount);
};
