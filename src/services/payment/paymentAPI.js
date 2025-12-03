/**
 * Payment API Service
 * Handles communication with payment backend endpoints
 */

import api from '../../../inventory/services/api';

class PaymentAPI {
  /**
   * Get payment configuration from backend
   * @returns {Promise<Object>} Payment configuration
   */
  static async getConfig() {
    try {
      const response = await api.get('/payments/config');
      return response.data;
    } catch (error) {
      console.error('Failed to get payment config:', error);
      throw new Error(error.response?.data?.error || 'Failed to load payment configuration');
    }
  }

  /**
   * Create payment intent
   * @param {Object} paymentData - Payment data
   * @param {string} paymentData.orderId - Order ID
   * @param {number} paymentData.amount - Amount in smallest currency unit
   * @param {string} paymentData.currency - Currency code
   * @param {Object} paymentData.customerInfo - Customer information
   * @param {Object} paymentData.metadata - Additional metadata
   * @returns {Promise<Object>} Payment intent response
   */
  static async createPaymentIntent(paymentData) {
    try {
      const response = await api.post('/payments/create-intent', paymentData);
      return response.data;
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw new Error(error.response?.data?.error || 'Failed to create payment intent');
    }
  }

  /**
   * Confirm payment success
   * @param {string} paymentIntentId - Payment intent ID
   * @param {Object} paymentData - Additional payment data
   * @returns {Promise<Object>} Confirmation response
   */
  static async confirmPayment(paymentIntentId, paymentData = {}) {
    try {
      const response = await api.post('/payments/confirm', {
        paymentIntentId,
        paymentData
      });
      return response.data;
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      throw new Error(error.response?.data?.error || 'Failed to confirm payment');
    }
  }

  /**
   * Get payment status
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Payment status
   */
  static async getPaymentStatus(paymentIntentId) {
    try {
      const response = await api.get(`/payments/status/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get payment status:', error);
      throw new Error(error.response?.data?.error || 'Failed to get payment status');
    }
  }

  /**
   * Cancel payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Cancellation response
   */
  static async cancelPayment(paymentIntentId) {
    try {
      const response = await api.post('/payments/cancel', {
        paymentIntentId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      throw new Error(error.response?.data?.error || 'Failed to cancel payment');
    }
  }

  /**
   * Process refund
   * @param {string} orderId - Order ID
   * @param {number} amount - Refund amount (optional)
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} Refund response
   */
  static async processRefund(orderId, amount = null, reason = '') {
    try {
      const response = await api.post('/payments/refund', {
        orderId,
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Failed to process refund:', error);
      throw new Error(error.response?.data?.error || 'Failed to process refund');
    }
  }

  /**
   * Check payment service health
   * @returns {Promise<Object>} Health status
   */
  static async checkHealth() {
    try {
      const response = await api.get('/payments/health');
      return response.data;
    } catch (error) {
      console.error('Payment service health check failed:', error);
      throw new Error(error.response?.data?.error || 'Payment service unavailable');
    }
  }
}

export default PaymentAPI;