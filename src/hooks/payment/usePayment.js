/**
 * usePayment Hook
 * React hook for managing payment state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import PaymentAPI from '../../services/payment/paymentAPI';

/**
 * Payment processing hook
 * @param {Object} options - Hook options
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Object} Payment state and methods
 */
export const usePayment = (options = {}) => {
  const { onSuccess, onError } = options;

  // Payment state
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, pending, processing, succeeded, failed

  /**
   * Initialize payment configuration
   */
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsLoading(true);
        const config = await PaymentAPI.getConfig();
        setPaymentConfig(config.config);
      } catch (err) {
        setError(err.message);
        onError?.(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [onError]);

  /**
   * Create payment intent
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Payment intent result
   */
  const createPaymentIntent = useCallback(async (paymentData) => {
    try {
      setIsProcessing(true);
      setError(null);
      setPaymentStatus('pending');

      const result = await PaymentAPI.createPaymentIntent(paymentData);
      
      if (result.success) {
        setPaymentIntent(result.paymentIntent);
        setPaymentStatus('pending');
        return result;
      } else {
        throw new Error(result.error || 'Failed to create payment intent');
      }
    } catch (err) {
      setError(err.message);
      setPaymentStatus('failed');
      onError?.(err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [onError]);

  /**
   * Confirm payment success
   * @param {string} paymentIntentId - Payment intent ID
   * @param {Object} paymentData - Additional payment data
   * @returns {Promise<Object>} Confirmation result
   */
  const confirmPayment = useCallback(async (paymentIntentId, paymentData = {}) => {
    try {
      setIsProcessing(true);
      setError(null);
      setPaymentStatus('processing');

      const result = await PaymentAPI.confirmPayment(paymentIntentId, paymentData);
      
      if (result.success) {
        setPaymentStatus('succeeded');
        onSuccess?.(result);
        return result;
      } else {
        throw new Error(result.error || 'Failed to confirm payment');
      }
    } catch (err) {
      setError(err.message);
      setPaymentStatus('failed');
      onError?.(err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [onSuccess, onError]);

  /**
   * Get payment status
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Payment status
   */
  const getPaymentStatus = useCallback(async (paymentIntentId) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await PaymentAPI.getPaymentStatus(paymentIntentId);
      
      if (result.success) {
        const status = result.status.status;
        setPaymentStatus(status);
        return result.status;
      } else {
        throw new Error(result.error || 'Failed to get payment status');
      }
    } catch (err) {
      setError(err.message);
      onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  /**
   * Cancel payment
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Promise<Object>} Cancellation result
   */
  const cancelPayment = useCallback(async (paymentIntentId) => {
    try {
      setIsProcessing(true);
      setError(null);

      const result = await PaymentAPI.cancelPayment(paymentIntentId);
      
      if (result.success) {
        setPaymentStatus('canceled');
        return result;
      } else {
        throw new Error(result.error || 'Failed to cancel payment');
      }
    } catch (err) {
      setError(err.message);
      onError?.(err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [onError]);

  /**
   * Process refund
   * @param {string} orderId - Order ID
   * @param {number} amount - Refund amount
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} Refund result
   */
  const processRefund = useCallback(async (orderId, amount = null, reason = '') => {
    try {
      setIsProcessing(true);
      setError(null);

      const result = await PaymentAPI.processRefund(orderId, amount, reason);
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || 'Failed to process refund');
      }
    } catch (err) {
      setError(err.message);
      onError?.(err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [onError]);

  /**
   * Reset payment state
   */
  const resetPayment = useCallback(() => {
    setIsProcessing(false);
    setError(null);
    setPaymentIntent(null);
    setPaymentStatus('idle');
  }, []);

  /**
   * Check if payment service is healthy
   * @returns {Promise<Boolean>} Service health status
   */
  const checkHealthStatus = useCallback(async () => {
    try {
      const result = await PaymentAPI.checkHealth();
      return result.success && result.status === 'healthy';
    } catch (err) {
      console.error('Payment service health check failed:', err);
      return false;
    }
  }, []);

  return {
    // State
    isLoading,
    isProcessing,
    error,
    paymentConfig,
    paymentIntent,
    paymentStatus,
    
    // Methods
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
    cancelPayment,
    processRefund,
    resetPayment,
    checkHealthStatus,
    
    // Helper getters
    isReady: paymentConfig !== null,
    canProcess: paymentConfig !== null && !isProcessing && !isLoading,
    isSuccessful: paymentStatus === 'succeeded',
    isFailed: paymentStatus === 'failed',
    isPending: paymentStatus === 'pending' || paymentStatus === 'processing'
  };
};