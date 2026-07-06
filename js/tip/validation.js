/**
 * Validation logic for tip calculator inputs.
 */

export const validateBill = (billStr) => {
    if (!billStr || billStr.toString().trim() === '') {
        return { isValid: false, message: 'Please enter a bill amount.' };
    }
    
    // Remove commas before parsing
    const rawStr = billStr.toString().replace(/,/g, '');
    const bill = parseFloat(rawStr);
    
    if (isNaN(bill)) {
        return { isValid: false, message: 'Please enter a valid number.' };
    }
    
    if (bill < 0) {
        return { isValid: false, message: 'Bill cannot be negative.' };
    }
    
    if (bill > 999999999) {
        return { isValid: false, message: 'Amount is too large.' };
    }
    
    return { isValid: true, value: bill, message: '' };
};

export const validatePeople = (peopleStr) => {
    if (!peopleStr || peopleStr.trim() === '') {
        return { isValid: false, message: 'Please enter number of people.' };
    }
    
    const people = parseInt(peopleStr, 10);
    
    if (isNaN(people)) {
        return { isValid: false, message: 'Please enter a valid number.' };
    }
    
    if (people < 1) {
        return { isValid: false, message: 'Must be at least 1 person.' };
    }
    
    if (people > 9999) {
        return { isValid: false, message: 'Number of people is too large.' };
    }
    
    return { isValid: true, value: people, message: '' };
};
