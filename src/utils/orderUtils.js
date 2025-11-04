/**
 * Utility functions for order display and calculations
 */

/**
 * Get the correct amount to display for an order considering discounts
 * @param {Object} order - The order object
 * @returns {number} - The amount to display
 */
export const getDisplayAmount = (order) => {
  if (!order) return 0;
  
  // For billed orders with discount, use finalAmount
  if (order.status === 'billed' && order.discount > 0 && order.finalAmount !== undefined) {
    return order.finalAmount;
  }
  
  // For virtual field from backend (if available)
  if (order.displayAmount !== undefined) {
    return order.displayAmount;
  }
  
  // For all other cases, use totalAmount
  return order.totalAmount || 0;
};

/**
 * Check if an order has a discount applied
 * @param {Object} order - The order object
 * @returns {boolean} - True if order has discount
 */
export const hasDiscount = (order) => {
  if (!order) return false;
  
  // Check virtual field from backend (if available)
  if (order.hasDiscount !== undefined) {
    return order.hasDiscount;
  }
  
  // Manual check
  return order.status === 'billed' && order.discount > 0;
};

/**
 * Get discount information for display
 * @param {Object} order - The order object
 * @returns {Object} - Discount information object
 */
export const getDiscountInfo = (order) => {
  if (!order || !hasDiscount(order)) {
    return {
      hasDiscount: false,
      discountAmount: 0,
      discountType: null,
      discountReason: null
    };
  }
  
  const subtotal = order.subtotal || order.totalAmount || 0;
  const discountValue = order.discount || 0;
  
  let discountAmount = 0;
  if (order.discountType === 'percentage') {
    discountAmount = (subtotal * discountValue) / 100;
  } else {
    discountAmount = discountValue;
  }
  
  return {
    hasDiscount: true,
    discountAmount,
    discountType: order.discountType,
    discountReason: order.discountReason,
    originalAmount: subtotal,
    finalAmount: order.finalAmount || (subtotal - discountAmount)
  };
};

/**
 * Format currency for display
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted amount
 */
export const formatDisplayAmount = (amount) => {
  return (amount || 0).toFixed(2);
};

/**
 * Calculate total revenue from orders considering discounts
 * @param {Array} orders - Array of order objects
 * @returns {number} - Total revenue after discounts
 */
export const calculateTotalRevenue = (orders) => {
  if (!Array.isArray(orders)) return 0;
  
  return orders.reduce((total, order) => total + getDisplayAmount(order), 0);
};

/**
 * Get order amount with discount details for analytics
 * @param {Object} order - The order object
 * @returns {Object} - Amount details for analytics
 */
export const getOrderAmountDetails = (order) => {
  const displayAmount = getDisplayAmount(order);
  const discountInfo = getDiscountInfo(order);
  
  return {
    displayAmount,
    originalAmount: order.totalAmount || 0,
    hasDiscount: discountInfo.hasDiscount,
    discountAmount: discountInfo.discountAmount,
    discountType: discountInfo.discountType,
    discountReason: discountInfo.discountReason
  };
};