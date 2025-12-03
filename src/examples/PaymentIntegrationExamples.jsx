/**
 * Payment Integration Examples
 * Shows how to integrate payment components into existing checkout flows
 * WITHOUT modifying existing components
 */

import React, { useState } from 'react';
import { PaymentButton, usePayment } from '../../components/payment';

/**
 * Example 1: Simple Payment Button Integration
 * Add this to any existing checkout page
 */
export const SimplePaymentExample = ({ order, onOrderComplete }) => {
  const handlePaymentSuccess = (result) => {
    console.log('Payment successful!', result);
    // Your existing order completion logic
    onOrderComplete?.(result.order);
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    alert(`Payment failed: ${error.message}`);
  };

  return (
    <div className="payment-integration">
      {/* Your existing order summary */}
      <div className="order-summary mb-4">
        <h3 className="text-lg font-semibold">Order Summary</h3>
        <p>Total: ${(order?.total || 0).toFixed(2)}</p>
      </div>

      {/* Just add this single component - no other changes needed */}
      <PaymentButton
        orderId={order?.id}
        amount={Math.round((order?.total || 0) * 100)} // Convert to cents
        currency="usd"
        customerInfo={{
          email: order?.customerEmail,
          name: order?.customerName,
          id: order?.customerId
        }}
        metadata={{
          tableNumber: order?.tableNumber,
          orderType: order?.type || 'dine-in'
        }}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        buttonText={`Pay $${(order?.total || 0).toFixed(2)}`}
        className="w-full bg-green-600 hover:bg-green-700"
        size="lg"
      />
    </div>
  );
};

/**
 * Example 2: Website Order Integration
 * For customer-facing website orders
 */
export const WebsiteOrderPayment = ({ cartItems, customerInfo, tableNumber }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate total from cart items
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePaymentSuccess = async (result) => {
    setIsProcessing(false);
    
    // Show success message
    alert('Payment successful! Your order has been confirmed.');
    
    // Clear cart or redirect
    window.location.href = '/order-confirmation?orderId=' + result.order._id;
  };

  const handlePaymentError = (error) => {
    setIsProcessing(false);
    alert('Payment failed: ' + error.message);
  };

  // Generate temporary order ID (you might do this differently)
  const tempOrderId = `temp_${Date.now()}`;

  return (
    <div className="website-payment">
      <div className="cart-summary bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">Your Order</h3>
        {cartItems.map((item, index) => (
          <div key={index} className="flex justify-between mb-2">
            <span>{item.name} × {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t pt-2 font-semibold">
          <div className="flex justify-between">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="customer-info mb-4">
        <p><strong>Name:</strong> {customerInfo.name}</p>
        <p><strong>Email:</strong> {customerInfo.email}</p>
        {tableNumber && <p><strong>Table:</strong> {tableNumber}</p>}
      </div>

      <PaymentButton
        orderId={tempOrderId}
        amount={Math.round(total * 100)}
        currency="usd"
        customerInfo={customerInfo}
        metadata={{
          tableNumber,
          orderType: tableNumber ? 'dine-in' : 'takeaway',
          cartItems: JSON.stringify(cartItems)
        }}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        buttonText="Complete Order & Pay"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
        size="lg"
        disabled={isProcessing}
      />
    </div>
  );
};

/**
 * Example 3: Admin Refund Interface
 * For restaurant staff to process refunds
 */
export const AdminRefundExample = ({ order }) => {
  const { processRefund, isProcessing } = usePayment();
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const handleRefund = async () => {
    try {
      const amount = refundAmount ? Math.round(parseFloat(refundAmount) * 100) : null;
      
      const result = await processRefund(order._id, amount, refundReason);
      
      if (result.success) {
        alert('Refund processed successfully!');
        // Refresh order data or redirect
      }
    } catch (error) {
      alert('Refund failed: ' + error.message);
    }
  };

  // Only show if order has been paid
  if (order.paymentStatus !== 'completed') {
    return null;
  }

  return (
    <div className="refund-interface bg-red-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-red-800 mb-3">Process Refund</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Refund Amount (leave empty for full refund)
        </label>
        <input
          type="number"
          step="0.01"
          value={refundAmount}
          onChange={(e) => setRefundAmount(e.target.value)}
          placeholder={`Max: $${(order.total || 0).toFixed(2)}`}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reason
        </label>
        <input
          type="text"
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
          placeholder="Enter refund reason"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={handleRefund}
        disabled={isProcessing || !refundReason.trim()}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : 'Process Refund'}
      </button>
    </div>
  );
};

/**
 * Example 4: Payment Status Checker
 * For checking payment status of existing orders
 */
export const PaymentStatusChecker = ({ orderId }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getPaymentStatus } = usePayment();

  const checkStatus = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      // This would need the payment intent ID, not order ID
      // You'd typically store this in your order record
      const paymentIntentId = 'pi_example'; // Get this from your order
      const statusResult = await getPaymentStatus(paymentIntentId);
      setStatus(statusResult);
    } catch (error) {
      console.error('Failed to check payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      case 'canceled': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="payment-status">
      <button
        onClick={checkStatus}
        disabled={loading || !orderId}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
      >
        {loading ? 'Checking...' : 'Check Payment Status'}
      </button>

      {status && (
        <div className="mt-2">
          <span className={`font-medium ${getStatusColor(status.status)}`}>
            Status: {status.status.toUpperCase()}
          </span>
          {status.amount && (
            <span className="ml-2 text-gray-600">
              Amount: ${(status.amount / 100).toFixed(2)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Example 5: Conditional Payment Button
 * Shows different buttons based on order status
 */
export const ConditionalPaymentButton = ({ order }) => {
  const handlePaymentSuccess = (result) => {
    console.log('Payment completed:', result);
    // Update UI or redirect
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  // Different states
  if (!order) {
    return <div className="text-gray-500">No order selected</div>;
  }

  if (order.paymentStatus === 'completed') {
    return (
      <div className="flex items-center text-green-600">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Payment Completed
      </div>
    );
  }

  if (order.paymentStatus === 'failed') {
    return (
      <div className="space-y-2">
        <div className="text-red-600">Previous payment failed</div>
        <PaymentButton
          orderId={order._id}
          amount={Math.round(order.total * 100)}
          currency="usd"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          buttonText="Retry Payment"
          className="w-full bg-red-600 hover:bg-red-700"
        />
      </div>
    );
  }

  // Default: show payment button
  return (
    <PaymentButton
      orderId={order._id}
      amount={Math.round(order.total * 100)}
      currency="usd"
      customerInfo={{
        email: order.customerEmail,
        name: order.customerName
      }}
      onSuccess={handlePaymentSuccess}
      onError={handlePaymentError}
      buttonText={`Pay $${order.total.toFixed(2)}`}
      className="w-full"
    />
  );
};