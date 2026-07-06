/**
 * Pure functions for tip calculations.
 */

export const calculateTipAmount = (bill, tipPercentage) => {
    return bill * (tipPercentage / 100);
};

export const calculateTotalBill = (bill, tipAmount) => {
    return bill + tipAmount;
};

export const calculateEachPersonPays = (totalBill, people) => {
    return totalBill / people;
};

export const calculatePerPersonTip = (tipAmount, people) => {
    return tipAmount / people;
};
