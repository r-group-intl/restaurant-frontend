/**
 * Utility functions for handling number precision and formatting in inventory management
 */

/**
 * Format a number to display with maximum 3 decimal places, removing unnecessary trailing zeros
 * @param {number} value - The number to format
 * @param {number} maxDecimals - Maximum decimal places (default: 3)
 * @returns {string} - Formatted number string
 */
export const formatQuantity = (value, maxDecimals = 3) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  // Round to max decimal places to avoid floating point precision issues
  const multiplier = Math.pow(10, maxDecimals);
  const rounded = Math.round(value * multiplier) / multiplier;
  
  // Format with up to maxDecimals places, removing trailing zeros
  return rounded.toFixed(maxDecimals).replace(/\.?0+$/, '');
};

/**
 * Format a price with 2 decimal places
 * @param {number} value - The price to format
 * @returns {string} - Formatted price string
 */
export const formatPrice = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00';
  }
  
  return Number(value).toFixed(2);
};

/**
 * Safe addition for floating point numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @param {number} precision - Decimal places to round to (default: 3)
 * @returns {number} - Sum rounded to specified precision
 */
export const safeAdd = (a, b, precision = 3) => {
  const multiplier = Math.pow(10, precision);
  return Math.round((a + b) * multiplier) / multiplier;
};

/**
 * Safe subtraction for floating point numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @param {number} precision - Decimal places to round to (default: 3)
 * @returns {number} - Difference rounded to specified precision
 */
export const safeSubtract = (a, b, precision = 3) => {
  const multiplier = Math.pow(10, precision);
  return Math.round((a - b) * multiplier) / multiplier;
};

/**
 * Safe multiplication for floating point numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @param {number} precision - Decimal places to round to (default: 3)
 * @returns {number} - Product rounded to specified precision
 */
export const safeMultiply = (a, b, precision = 3) => {
  const multiplier = Math.pow(10, precision);
  return Math.round((a * b) * multiplier) / multiplier;
};

/**
 * Safe division for floating point numbers
 * @param {number} a - Dividend
 * @param {number} b - Divisor
 * @param {number} precision - Decimal places to round to (default: 3)
 * @returns {number} - Quotient rounded to specified precision
 */
export const safeDivide = (a, b, precision = 3) => {
  if (b === 0) return 0;
  const multiplier = Math.pow(10, precision);
  return Math.round((a / b) * multiplier) / multiplier;
};

/**
 * Round a number to specified precision
 * @param {number} value - Number to round
 * @param {number} precision - Decimal places (default: 3)
 * @returns {number} - Rounded number
 */
export const roundToPrecision = (value, precision = 3) => {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
};

/**
 * Check if two floating point numbers are equal within a tolerance
 * @param {number} a - First number
 * @param {number} b - Second number
 * @param {number} tolerance - Tolerance for comparison (default: 0.001)
 * @returns {boolean} - True if numbers are approximately equal
 */
export const isApproximatelyEqual = (a, b, tolerance = 0.001) => {
  return Math.abs(a - b) < tolerance;
};

/**
 * Parse a string input to a safe number for inventory calculations
 * @param {string|number} input - Input value
 * @param {number} precision - Decimal places to round to (default: 3)
 * @returns {number} - Parsed and rounded number
 */
export const parseInventoryNumber = (input, precision = 3) => {
  const parsed = parseFloat(input);
  if (isNaN(parsed)) return 0;
  return roundToPrecision(parsed, precision);
};