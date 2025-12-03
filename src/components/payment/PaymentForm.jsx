/**
 * PaymentForm Component
 * Stripe Elements payment form with card input
 */

import React, { useState, useEffect } from 'react';
import { 
  useStripe, 
  useElements, 
  PaymentElement,
  CardElement 
} from '@stripe/react-stripe-js';
import { usePayment } from '../../hooks/payment/usePayment';

// Card element styling to match your app
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false
};

/**
 * PaymentForm Component
 * @param {Object} props
 * @param {string} props.clientSecret - Stripe client secret
 * @param {Object} props.orderDetails - Order information
 * @param {Function} props.onSuccess - Success callback
 * @param {Function} props.onError - Error callback
 * @param {boolean} props.disabled - Disable form
 * @param {string} props.className - Additional CSS classes
 */
export const PaymentForm = ({ 
  clientSecret, 
  orderDetails, 
  onSuccess, 
  onError, 
  disabled = false,
  className = '' 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { confirmPayment, isProcessing } = usePayment({ onSuccess, onError });

  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const isLoading = isProcessing || !stripe || !elements;

  /**
   * Handle card input changes
   */
  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : null);
  };

  /**
   * Handle billing details changes
   */
  const handleBillingChange = (field, value) => {
    setBillingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      onError?.({ message: 'Payment system not ready' });
      return;
    }

    if (!cardComplete) {
      onError?.({ message: 'Please complete card details' });
      return;
    }

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingDetails.name || 'Restaurant Customer',
            email: billingDetails.email,
            phone: billingDetails.phone
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment with your backend
        await confirmPayment(paymentIntent.id, {
          paymentMethod: 'card',
          billingDetails,
          orderDetails
        });
      }

    } catch (error) {
      console.error('Payment submission error:', error);
      onError?.(error);
    }
  };

  return (
    <div className={`payment-form ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Billing Details */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Billing Details</h3>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={billingDetails.name}
              onChange={(e) => handleBillingChange('name', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your full name"
              disabled={disabled || isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={billingDetails.email}
              onChange={(e) => handleBillingChange('email', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your email"
              disabled={disabled || isLoading}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              value={billingDetails.phone}
              onChange={(e) => handleBillingChange('phone', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your phone number"
              disabled={disabled || isLoading}
            />
          </div>
        </div>

        {/* Card Details */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Card Details</h3>
          
          <div className="p-3 border border-gray-300 rounded-md">
            <CardElement 
              options={cardElementOptions}
              onChange={handleCardChange}
              disabled={disabled || isLoading}
            />
          </div>

          {cardError && (
            <div className="text-red-600 text-sm">
              {cardError}
            </div>
          )}
        </div>

        {/* Order Summary */}
        {orderDetails && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Order #{orderDetails.orderId}</span>
                <span>{orderDetails.currency?.toUpperCase()} {(orderDetails.amount / 100).toFixed(2)}</span>
              </div>
              {orderDetails.tableNumber && (
                <div>Table: {orderDetails.tableNumber}</div>
              )}
              {orderDetails.customerInfo?.email && (
                <div>Email: {orderDetails.customerInfo.email}</div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={disabled || isLoading || !cardComplete}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Pay ${orderDetails?.currency?.toUpperCase()} ${orderDetails ? (orderDetails.amount / 100).toFixed(2) : ''}`
          )}
        </button>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 text-center">
          <div className="flex items-center justify-center space-x-1">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secured by Stripe</span>
          </div>
        </div>
      </form>
    </div>
  );
};