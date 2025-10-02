import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';

const BillingModal = ({ isOpen, onClose, order, onBillComplete }) => {
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('fixed');
  const [discountReason, setDiscountReason] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  // Calculate amounts
  const subtotal = order?.totalAmount || 0;
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discount) / 100 
    : discount;
  const finalAmount = Math.max(0, subtotal - discountAmount);
  const balance = Math.max(0, amountPaid - finalAmount);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && order) {
      setDiscount(0);
      setDiscountType('fixed');
      setDiscountReason('');
      setAmountPaid(finalAmount);
      setPaymentMethod('cash');
    }
  }, [isOpen, order, finalAmount]);

  // Update amount paid when final amount changes
  useEffect(() => {
    if (paymentMethod === 'card' || paymentMethod === 'mobile') {
      setAmountPaid(finalAmount); // Exact amount for card/mobile payments
    }
  }, [finalAmount, paymentMethod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!order) return;

    // Validation
    if (amountPaid < finalAmount && paymentMethod === 'cash') {
      toast.error('Amount paid cannot be less than final amount for cash payments');
      return;
    }

    setLoading(true);
    try {
      const billData = {
        discount: parseFloat(discount) || 0,
        discountType,
        discountReason: discountReason.trim(),
        amountPaid: parseFloat(amountPaid) || 0,
        paymentMethod
      };

      await api.patch(`/orders/${order._id}/bill`, billData);
      
      toast.success('Order billed successfully!', {
        icon: '💰',
        style: {
          borderRadius: '10px',
          background: '#1f2937',
          color: '#fff',
        },
      });

      // Trigger bill printing
      printBill({
        ...order,
        discount: parseFloat(discount) || 0,
        discountType,
        discountReason: discountReason.trim(),
        subtotal,
        finalAmount,
        amountPaid: parseFloat(amountPaid) || 0,
        balance,
        paymentMethod
      });

      onBillComplete();
      onClose();
    } catch (error) {
      console.error('Error billing order:', error);
      toast.error('Failed to bill order');
    } finally {
      setLoading(false);
    }
  };

  const printBill = (orderData) => {
    const currentDate = new Date();
    const billDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const billTime = currentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const billHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Restaurant Bill - ${orderData.orderId}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            
            body {
              font-family: 'Courier New', monospace;
              max-width: 350px;
              margin: 0 auto;
              padding: 20px;
              background: white;
              color: black;
              line-height: 1.4;
            }
            
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            
            .restaurant-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .restaurant-info {
              font-size: 12px;
              margin-bottom: 3px;
            }
            
            .bill-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #666;
            }
            
            .bill-info div {
              font-size: 14px;
            }
            
            .items-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            
            .item-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            }
            
            .item-name {
              flex: 1;
              margin-right: 10px;
            }
            
            .item-qty {
              width: 30px;
              text-align: center;
            }
            
            .item-price {
              width: 80px;
              text-align: right;
            }
            
            .totals {
              border-top: 1px solid #000;
              padding-top: 10px;
              margin-top: 15px;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 14px;
            }
            
            .final-total {
              font-weight: bold;
              font-size: 16px;
              border-top: 2px solid #000;
              padding-top: 5px;
              margin-top: 10px;
            }

            .payment-info {
              background: #f5f5f5;
              padding: 10px;
              margin-top: 15px;
              border-radius: 5px;
              border: 1px solid #ddd;
            }
            
            .footer {
              text-align: center;
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px dashed #666;
              font-size: 12px;
            }
            
            .print-button {
              background: #007bff;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              margin: 10px;
            }
            
            .print-button:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: center; margin-bottom: 20px;">
            <button class="print-button" onclick="window.print()">🖨️ Print Bill</button>
            <button class="print-button" onclick="window.close()">❌ Close</button>
          </div>
          
          <div class="header">
            <div class="restaurant-name">🍽️ RESTAURANTS BY RONAN</div>
            <div class="restaurant-info">📍 Your Restaurant Address</div>
            <div class="restaurant-info">📞 +94 777 66 9191</div>
            <div class="restaurant-info">✉️ info@wowrestaurant.com</div>
          </div>
          
          <div class="bill-info">
            <div>
              <strong>Bill No:</strong> ${orderData.orderId}<br>
              <strong>Table:</strong> ${orderData.table === 'takeaway' || !orderData.table ? '🥡 Takeaway' : `🪑 Table ${orderData.table}`}<br>
              <strong>Order Type:</strong> ${orderData.placedBy === 'customer' ? '👤 Customer' : `👨‍💼 ${orderData.placedBy}`}
            </div>
            <div style="text-align: right;">
              <strong>Date:</strong> ${billDate}<br>
              <strong>Time:</strong> ${billTime}<br>
              <strong>Cashier:</strong> Cashier
            </div>
          </div>
          
          <div class="items-header">
            <span>Item</span>
            <span>Qty</span>
            <span>Amount</span>
          </div>
          
          ${orderData.items.map(item => `
            <div class="item-row">
              <span class="item-name">${item.dishName}</span>
              <span class="item-qty">${item.qty}</span>
              <span class="item-price">LKR ${(item.price * item.qty).toFixed(2)}</span>
            </div>
          `).join('')}
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>LKR ${orderData.subtotal.toFixed(2)}</span>
            </div>
            ${orderData.discount > 0 ? `
              <div class="total-row">
                <span>Discount ${orderData.discountType === 'percentage' ? `(${orderData.discount}%)` : '(Fixed)'}:</span>
                <span>- LKR ${(orderData.discountType === 'percentage' ? (orderData.subtotal * orderData.discount) / 100 : orderData.discount).toFixed(2)}</span>
              </div>
              ${orderData.discountReason ? `
                <div class="total-row" style="font-size: 12px; color: #666;">
                  <span>Reason: ${orderData.discountReason}</span>
                  <span></span>
                </div>
              ` : ''}
            ` : ''}
            <div class="total-row final-total">
              <span>TOTAL AMOUNT:</span>
              <span>LKR ${orderData.finalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div class="payment-info">
            <div class="total-row">
              <span><strong>Payment Method:</strong></span>
              <span><strong>${orderData.paymentMethod.toUpperCase()}</strong></span>
            </div>
            <div class="total-row">
              <span>Amount Paid:</span>
              <span>LKR ${orderData.amountPaid.toFixed(2)}</span>
            </div>
            ${orderData.balance > 0 ? `
              <div class="total-row" style="font-weight: bold; color: #28a745;">
                <span>Balance (Change):</span>
                <span>LKR ${orderData.balance.toFixed(2)}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <div style="margin-bottom: 10px;">
              <strong>🙏 Thank you for dining with us!</strong>
            </div>
            <div style="margin-bottom: 10px;">
              ⭐ Rate your experience: www.wowrestaurant.com/feedback
            </div>
            <div style="margin-bottom: 10px;">
              📱 Follow us on social media @WowRestaurant
            </div>
          </div>
          
          <script>
            // Auto print when page loads (optional)
            // window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(billHTML);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
    }, 500);
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Bill Order - {order.orderId}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Summary */}
          <div className="bg-slate-700 p-4 rounded">
            <h3 className="text-white font-semibold mb-2">Order Summary</h3>
            <div className="text-sm text-slate-300">
              <p>Table: {order.table === 'takeaway' || !order.table ? 'Takeaway' : `Table ${order.table}`}</p>
              <p>Items: {order.items?.length || 0}</p>
              <p>Subtotal: LKR {subtotal.toFixed(2)}</p>
            </div>
          </div>

          {/* Discount Section */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Discount (Optional)</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full p-2 bg-slate-700 text-white rounded border border-slate-600"
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  {discountType === 'percentage' ? 'Discount %' : 'Discount Amount'}
                </label>
                <input
                  type="number"
                  min="0"
                  max={discountType === 'percentage' ? '100' : subtotal}
                  step={discountType === 'percentage' ? '0.1' : '0.01'}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-700 text-white rounded border border-slate-600"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Discount Reason (Optional)</label>
              <input
                type="text"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                className="w-full p-2 bg-slate-700 text-white rounded border border-slate-600"
                placeholder="e.g., Customer complaint, Staff discount..."
              />
            </div>
          </div>

          {/* Amount Calculation */}
          <div className="bg-slate-700 p-4 rounded space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal:</span>
              <span>LKR {subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-400">
                <span>Discount:</span>
                <span>- LKR {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold text-lg border-t border-slate-600 pt-2">
              <span>Total Amount:</span>
              <span>LKR {finalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Payment Details</h3>
            
            <div>
              <label className="block text-sm text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 bg-slate-700 text-white rounded border border-slate-600"
              >
                <option value="cash">💵 Cash</option>
                <option value="card">💳 Card</option>
                <option value="mobile">📱 Mobile Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1">Amount Paid</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-700 text-white rounded border border-slate-600"
                placeholder="Enter amount paid"
                disabled={paymentMethod !== 'cash'}
              />
              {paymentMethod !== 'cash' && (
                <p className="text-xs text-slate-400 mt-1">
                  Exact amount required for card/mobile payments
                </p>
              )}
            </div>

            {balance > 0 && (
              <div className="bg-green-900 p-3 rounded">
                <div className="flex justify-between text-green-300 font-semibold">
                  <span>Balance (Change):</span>
                  <span>LKR {balance.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 text-white py-2 px-4 rounded hover:bg-slate-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (amountPaid < finalAmount && paymentMethod === 'cash')}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Bill & Print'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingModal;