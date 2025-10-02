import { Badge } from '../../components/ui/badge';

// Utility function to safely format currency
const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const OrderCard = ({ order, onDone, onBill, showActions = true, variant = 'default' }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'done': return 'bg-green-600';
      case 'billed': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getTableDisplay = (order) => {
    if (order.orderType === 'takeaway' || order.table === 'takeaway' || order.table === null) {
      return '📦 Takeaway';
    }
    return `🪑 Table ${order.table}`;
  };

  return (
    <div className={`bg-slate-800 rounded-lg p-4 border border-slate-700 ${
      variant === 'compact' ? 'min-h-[200px]' : 'min-h-[250px]'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{order.orderId}</h3>
          <p className="text-sm text-slate-400">{getTableDisplay(order)}</p>
          <p className="text-xs text-slate-500">
            {order.placedById ? 
              `by ${order.placedById.name} (${order.placedBy})` : 
              order.placedBy === 'customer' ? 'Customer Order' : `by ${order.placedBy}`
            }
          </p>
        </div>
        <Badge className={`${getStatusColor(order.status)} text-white`}>
          {order.status.toUpperCase()}
        </Badge>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <div className="flex-1">
              <span className={`${
                item.category === 'Beverage' ? 'text-blue-400 font-medium' : 'text-white'
              }`}>
                {item.dishName}
              </span>
              {item.category === 'Beverage' && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Beverage
                </Badge>
              )}
            </div>
            <div className="text-slate-300">
              {item.qty}x LKR {item.price}
            </div>
          </div>
        ))}
      </div>

      {/* Customer Notes */}
      {order.customerNotes && order.customerNotes.trim() && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-3 mb-3 shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
              🍽️ Customer Request
            </div>
          </div>
          <p className="text-yellow-50 text-sm font-medium italic bg-black/20 p-2 rounded">
            "{order.customerNotes}"
          </p>
        </div>
      )}

      {/* Total */}
      <div className="border-t border-slate-600 pt-2 mb-3">
        <div className="flex justify-between items-center font-semibold text-white">
          <span>Total:</span>
          <span>LKR {formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      {/* Time */}
      <div className="text-xs text-slate-500 mb-3">
        {new Date(order.createdAt).toLocaleString()}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2">
          {order.status === 'pending' && onDone && (
            <button
              onClick={() => onDone(order._id)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-sm"
            >
              Mark Done
            </button>
          )}
          {(order.status === 'done' || order.status === 'pending') && onBill && (
            <button
              onClick={() => onBill(order._id)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              Bill & Print
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;