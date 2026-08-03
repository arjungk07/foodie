/**
 * Formats a number to Indian Rupee (₹) using the Indian numbering system (Lakh/Crore).
 * Example: 125999 -> ₹1,25,999
 * 
 * @param {number|string} amount 
 * @returns {string} Formatted price
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  
  const numericAmount = Math.round(Number(amount));
  return `₹${numericAmount.toLocaleString('en-IN')}`;
}
