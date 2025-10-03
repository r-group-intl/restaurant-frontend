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

  // Function to determine item highlight style
  const getItemHighlightStyle = (item) => {
    // Highlight beverages differently
    if (item.category === 'Beverage') {
      return 'bg-blue-900/40 border-l-4 border-blue-500';
    }
    
    // Highlight items with special requests or modifications
    if (item.specialRequest || item.modifications) {
      return 'bg-orange-900/40 border-l-4 border-orange-500';
    }
    
    // Default highlight for regular food items
    return 'bg-slate-700/40 border-l-4 border-green-500';
  };

  return (
    <div className={`bg-slate-800 rounded-lg p-4 border-2 ${
      order.status === 'pending' ? 'border-yellow-500/50' : 'border-slate-700'
    } ${variant === 'compact' ? 'min-h-[200px]' : 'min-h-[250px]'} shadow-lg hover:shadow-xl transition-all`}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-white bg-slate-900/50 px-2 py-1 rounded inline-block">
            {order.orderId}
          </h3>
          <p className="text-sm text-slate-300 mt-1 font-medium">{getTableDisplay(order)}</p>
          <p className="text-xs text-slate-400">
            {order.placedById ? 
              `by ${order.placedById.name} (${order.placedBy})` : 
              order.placedBy === 'customer' ? 'Customer Order' : `by ${order.placedBy}`
            }
          </p>
        </div>
        <Badge className={`${getStatusColor(order.status)} text-white font-bold px-3 py-1`}>
          {order.status.toUpperCase()}
        </Badge>
      </div>

      {/* Items - Enhanced with better highlighting */}
      <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
        {order.items.map((item, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-lg ${getItemHighlightStyle(item)} transition-colors`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold ${
                    item.category === 'Beverage' ? 'text-blue-300' : 'text-white'
                  }`}>
                    {item.dishName}
                  </span>
                  {item.category === 'Beverage' && (
                    <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                      🥤 Beverage
                    </Badge>
                  )}
                  {item.specialRequest && (
                    <Badge variant="secondary" className="bg-orange-600 text-white text-xs">
                      ✨ Special
                    </Badge>
                  )}
                </div>
                
                {/* Quantity and Price */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 font-medium">
                    {item.qty}x 
                  </span>
                  <span className="text-slate-300 font-bold">
                    LKR {formatCurrency(item.price)}
                  </span>
                </div>

                {/* Special Requests for this item */}
                {item.specialRequest && (
                  <div className="mt-2 p-2 bg-orange-800/30 rounded border border-orange-500/50">
                    <p className="text-orange-200 text-xs font-medium">
                      <span className="font-bold">Note:</span> {item.specialRequest}
                    </p>
                  </div>
                )}

                {/* Modifications */}
                {item.modifications && item.modifications.length > 0 && (
                  <div className="mt-1">
                    <p className="text-orange-200 text-xs font-semibold">Modifications:</p>
                    <ul className="text-orange-200 text-xs list-disc list-inside">
                      {item.modifications.map((mod, modIndex) => (
                        <li key={modIndex}>{mod}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Notes - Enhanced visibility */}
      {order.customerNotes && order.customerNotes.trim() && (
        <div className="bg-gradient-to-r from-yellow-600/40 to-orange-600/40 border-2 border-yellow-400/50 rounded-lg p-3 mb-3 shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
              🍽️ <span>Customer Request</span>
            </div>
          </div>
          <p className="text-yellow-50 text-sm font-semibold bg-black/30 p-3 rounded border border-yellow-400/30">
            "{order.customerNotes}"
          </p>
        </div>
      )}

      {/* Time */}
      <div className="text-xs text-slate-400 mb-3 bg-slate-900/50 p-2 rounded text-center">
        🕒 {new Date(order.createdAt).toLocaleString()}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2">
          {order.status === 'pending' && onDone && (
            <button
              onClick={() => onDone(order._id)}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-bold text-sm shadow-lg hover:shadow-green-500/25"
            >
              ✅ Mark Done
            </button>
          )}
          {(order.status === 'done' || order.status === 'pending') && onBill && (
            <button
              onClick={() => onBill(order._id)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-sm shadow-lg hover:shadow-blue-500/25"
            >
              🧾 Bill & Print
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;