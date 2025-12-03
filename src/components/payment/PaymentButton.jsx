/**
 * PaymentButton Component
 * Reusable button component to initiate payment process
 */

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentForm } from './PaymentForm';
import { usePayment } from '../../hooks/payment/usePayment';

// Initialize Stripe (will be loaded dynamically based on config)
let stripePromise = null;

/**
 * PaymentButton Component
 * @param {Object} props
 * @param {string} props.orderId - Order ID
 * @param {number} props.amount - Amount in smallest currency unit (cents)
 * @param {string} props.currency - Currency code (USD, HUF, etc.)
 * @param {Object} props.customerInfo - Customer information
 * @param {Object} props.metadata - Additional metadata
 * @param {Function} props.onSuccess - Success callback
 * @param {Function} props.onError - Error callback
 * @param {Function} props.onCancel - Cancel callback
 * @param {string} props.buttonText - Custom button text
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Disable button
 * @param {string} props.size - Button size ('sm', 'md', 'lg')
 * @param {string} props.variant - Button variant ('primary', 'secondary')
 */
export const PaymentButton = ({ 
  orderId, 
  amount, 
  currency = 'usd',
  customerInfo = {},
  metadata = {},
  onSuccess, 
  onError, 
  onCancel,
  buttonText,
  className = '',
  disabled = false,
  size = 'md',
  variant = 'primary'
}) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  
  const { 
    createPaymentIntent, 
    isProcessing, 
    paymentConfig, 
    isReady 
  } = usePayment({
    onSuccess: (result) => {
      setShowPaymentForm(false);
      onSuccess?.(result);
    },
    onError: (error) => {
      onError?.(error);
    }
  });

  // Initialize Stripe with public key from config
  React.useEffect(() => {
    if (paymentConfig?.stripePublicKey && !stripePromise) {
      stripePromise = loadStripe(paymentConfig.stripePublicKey);
    }
  }, [paymentConfig]);

  /**
   * Handle payment button click
   */
  const handlePaymentClick = async () => {
    if (!isReady || !orderId || !amount) {
      onError?.({ message: 'Payment configuration not ready or missing required data' });
      return;
    }

    try {
      // Create payment intent
      const result = await createPaymentIntent({
        orderId,
        amount,
        currency,
        customerInfo,
        metadata
      });

      if (result.success) {
        setPaymentIntent(result.paymentIntent);
        setShowPaymentForm(true);
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      onError?.(error);
    }
  };

  /**
   * Handle payment form close
   */
  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
    setPaymentIntent(null);
    onCancel?.();
  };

  // Button size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Button variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600'
  };

  const buttonClasses = `
    inline-flex items-center justify-center 
    border rounded-md font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  // Format amount for display
  const formatAmount = () => {
    if (!amount || !paymentConfig?.currency) return '';
    const displayAmount = (amount / 100).toFixed(2);
    return `${paymentConfig.currency.toUpperCase()} ${displayAmount}`;
  };

  const defaultButtonText = buttonText || `Pay ${formatAmount()}`;

  return (
    <>
      {/* Payment Button */}
      <button
        onClick={handlePaymentClick}
        disabled={disabled || !isReady || isProcessing}
        className={buttonClasses}
        type="button"
      >
        {isProcessing ? (
          <>
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          defaultButtonText
        )}
      </button>

      {/* Payment Form Modal */}
      {showPaymentForm && paymentIntent && stripePromise && (
        <PaymentModal 
          stripePromise={stripePromise}
          clientSecret={paymentIntent.clientSecret}
          orderDetails={{
            orderId,
            amount,
            currency,
            customerInfo,
            tableNumber: metadata.tableNumber
          }}
          onClose={handleClosePaymentForm}
          onSuccess={onSuccess}
          onError={onError}
        />
      )}
    </>
  );
};

/**
 * PaymentModal Component
 * Modal wrapper for payment form
 */
const PaymentModal = ({ 
  stripePromise, 
  clientSecret, 
  orderDetails, 
  onClose, 
  onSuccess, 
  onError 
}) => {
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2563eb',
    }
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Complete Payment
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {stripePromise && clientSecret && (
                  <Elements stripe={stripePromise} options={options}>
                    <PaymentForm
                      clientSecret={clientSecret}
                      orderDetails={orderDetails}
                      onSuccess={(result) => {
                        onClose();
                        onSuccess?.(result);
                      }}
                      onError={(error) => {
                        onError?.(error);
                      }}
                    />
                  </Elements>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};