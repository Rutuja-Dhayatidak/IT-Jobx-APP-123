/**
 * Formats a number as INR currency (₹)
 * @param {number} amount 
 * @returns {string}
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

module.exports = formatCurrency;
