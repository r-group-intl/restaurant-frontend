import { Badge } from '../../components/ui/badge';

// Utility function to safely format currency
const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const TableCard = ({ tableNumber, orders = [], onNewOrder, onViewDetails }) => {
  const activeOrders = orders.filter(order => order.status !== 'billed');
  const totalAmount = activeOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const hasActiveOrders = activeOrders.length > 0;

  return (
    <div className={`bg-slate-800 rounded-lg p-4 border-2 transition-all duration-200 ${
      hasActiveOrders 
        ? 'border-yellow-500 bg-slate-800/80' 
        : 'border-slate-700 hover:border-slate-600'
    } min-h-[200px]`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">
            {tableNumber === 'takeaway' ? 'Takeaway' : `Table ${tableNumber}`}
          </h3>
          {hasActiveOrders && (
            <Badge className="bg-yellow-600 text-white mt-1">
              {activeOrders.length} Active Order{activeOrders.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="text-right">
          {hasActiveOrders && (
            <div className="text-lg font-semibold text-green-400">
              LKR {formatCurrency(totalAmount)}
            </div>
          )}
        </div>
      </div>

      {/* Active Orders Summary */}
      {hasActiveOrders ? (
        <div className="space-y-2 mb-4 max-h-24 overflow-y-auto">
          {activeOrders.map((order, index) => (
            <div key={order._id} className="text-sm bg-slate-700/50 rounded p-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">{order.orderId}</span>
                <Badge className={`text-xs ${
                  order.status === 'pending' ? 'bg-yellow-600' : 'bg-green-600'
                } text-white`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div className="text-slate-300 text-xs mt-1">
                {order.items.length} item{order.items.length > 1 ? 's' : ''} • 
                LKR {formatCurrency(order.totalAmount)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm mb-4">
          No active orders
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onNewOrder(tableNumber)}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + New Order
        </button>
        {hasActiveOrders && (
          <button
            onClick={() => onViewDetails(tableNumber, activeOrders)}
            className="bg-slate-600 text-white py-2 px-4 rounded hover:bg-slate-500 transition-colors text-sm"
          >
            View
          </button>
        )}
      </div>
    </div>
  );
};

export default TableCard;