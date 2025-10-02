import { useState, useEffect } from 'react';
import TableCard from './TableCard';
import OrderModal from './OrderModal';
import BillingModal from './BillingModal';
import ErrorBoundary from './ErrorBoundary';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';

// Utility function to safely format currency
const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const CashierDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [tableOrders, setTableOrders] = useState({});
  const [takeawayOrders, setTakeawayOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedOrderForBilling, setSelectedOrderForBilling] = useState(null);
  const [orderType, setOrderType] = useState('table'); // 'table' or 'takeaway'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayOrders: 0,
    activeOrders: 0
  });

  // Generate table numbers 1-10
  const tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  useEffect(() => {
    fetchDashboardData();
    fetchMenuItems();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/orders/dashboard');
      const { 
        orders: ordersData, 
        tables: tablesData, 
        allTakeawayOrders: takeawayData,
        ...statsData 
      } = response.data;
      
      setOrders(ordersData || []);
      setTableOrders(tablesData || {});
      setTakeawayOrders(takeawayData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu-items');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items: ' + (error.response?.data?.message || error.message));
    }
  };

  const getTableOrders = (tableNumber) => {
    const orders = tableOrders[`table${tableNumber}`] || [];
    return orders;
  };

  const getTakeawayOrders = () => {
    return takeawayOrders;
  };

  const handleNewOrder = (tableNumber) => {
    setSelectedTable(tableNumber);
    setOrderType(tableNumber === 'takeaway' ? 'takeaway' : 'table');
    setIsOrderModalOpen(true);
  };

  const handleNewTakeawayOrder = () => {
    setSelectedTable(null);
    setOrderType('takeaway');
    setIsOrderModalOpen(true);
  };

  const handleViewDetails = (tableNumber, orders) => {
    // You can implement a detailed view modal here
    toast.success(`Viewing ${orders.length} order(s) for Table ${tableNumber}`);
  };

  const handleViewTakeawayDetails = (orders) => {
    // You can implement a detailed view modal here
    toast.success(`Viewing ${orders.length} takeaway order(s)`);
  };

  const handlePlaceOrder = async (selectedItems) => {
    try {
      const orderData = {
        orderType,
        items: selectedItems,
        placedBy: 'cashier'
      };

      // Only include table for table orders
      if (orderType === 'table') {
        orderData.table = selectedTable;
      }

      await api.post('/orders', orderData);
      toast.success(`${orderType === 'takeaway' ? 'Takeaway' : 'Table'} order placed successfully!`, {
        icon: orderType === 'takeaway' ? '📦' : '🪑',
        style: {
          borderRadius: '10px',
          background: '#1f2937',
          color: '#fff',
        },
      });
      setIsOrderModalOpen(false);
      setSelectedTable(null);
      setOrderType('table');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error placing order:', error);
      
      // Handle inventory-specific errors
      if (error.response?.data?.error === 'Out of Stock') {
        toast.error(`Out of Stock: ${error.response.data.details}`, {
          duration: 6000,
          style: {
            borderRadius: '10px',
            background: '#7f1d1d',
            color: '#fff',
          },
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to place order', {
          style: {
            borderRadius: '10px',
            background: '#1f2937',
            color: '#fff',
          },
        });
      }
    }
  };

  const handleBillOrder = async (order) => {
    setSelectedOrderForBilling(order);
    setIsBillingModalOpen(true);
  };

  const handleBillComplete = () => {
    fetchDashboardData(); // Refresh data after billing
    setSelectedOrderForBilling(null);
  };

  const handleMarkDone = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/done`);
      toast.success('Order marked as done!', {
        icon: '✅',
        style: {
          borderRadius: '10px',
          background: '#1f2937',
          color: '#fff',
        },
      });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error marking order as done:', error);
      toast.error('Failed to mark order as done', {
        style: {
          borderRadius: '10px',
          background: '#1f2937',
          color: '#fff',
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cashier Dashboard</h1>
        <div className="flex space-x-6 text-sm">
          <div className="bg-slate-800 px-4 py-2 rounded">
            <span className="text-slate-400">Today's Revenue: </span>
            <span className="text-green-400 font-semibold">LKR {formatCurrency(stats.totalRevenue)}</span>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded">
            <span className="text-slate-400">Today's Orders: </span>
            <span className="text-blue-400 font-semibold">{stats.todayOrders || 0}</span>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded">
            <span className="text-slate-400">Active Orders: </span>
            <span className="text-yellow-400 font-semibold">{stats.activeOrders || 0}</span>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Restaurant Tables (1-10)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {tables.map(table => (
            <TableCard
              key={table}
              tableNumber={table}
              orders={getTableOrders(table)}
              onNewOrder={handleNewOrder}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </div>

      {/* Takeaway Orders Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white">Takeaway Orders</h2>
          <button
            onClick={handleNewTakeawayOrder}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            + New Takeaway Order
          </button>
        </div>
        
        {takeawayOrders.length === 0 ? (
          <div className="bg-slate-800 p-8 rounded-lg text-center">
            <p className="text-slate-400">No takeaway orders at the moment</p>
            <button
              onClick={handleNewTakeawayOrder}
              className="mt-4 bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition-colors"
            >
              Create First Takeaway Order
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {takeawayOrders.map(order => (
              <div key={order._id} className="bg-slate-800 p-4 rounded-lg border border-orange-500">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-white">{order.orderId}</h3>
                    <p className="text-sm text-slate-400">
                      📦 Takeaway • {order.placedBy === 'customer' ? 'Customer Order' : `${order.placedBy} Order`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span 
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                        order.status === 'done' ? 'bg-green-900 text-green-300' :
                        'bg-blue-900 text-blue-300'
                      }`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                    <div className="text-orange-400 font-bold mt-1">
                      LKR {formatCurrency(order.totalAmount)}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-slate-400 mb-3">
                  {order.items?.length || 0} items • {order.items?.map(item => `${item.qty}x ${item.dishName}`).join(', ')}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewTakeawayDetails([order])}
                    className="flex-1 bg-slate-700 text-slate-300 py-1 px-3 rounded text-sm hover:bg-slate-600 transition-colors"
                  >
                    View Details
                  </button>
                  {order.status === 'done' && (
                    <button
                      onClick={() => handleBillOrder(order)}
                      className="flex-1 bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Bill & Print
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kitchen Orders Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">🍳 Kitchen Orders - Live View</h2>
        {orders.filter(order => ['pending', 'done'].includes(order.status)).length === 0 ? (
          <div className="bg-slate-800 p-8 rounded-lg text-center">
            <p className="text-slate-400">No active orders in kitchen</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders
              .filter(order => ['pending', 'done'].includes(order.status))
              .sort((a, b) => {
                // Priority: pending first, then done
                if (a.status === 'pending' && b.status === 'done') return -1;
                if (a.status === 'done' && b.status === 'pending') return 1;
                return new Date(a.createdAt) - new Date(b.createdAt);
              })
              .map(order => (
                <div key={order._id} className={`bg-slate-800 p-4 rounded-lg border-2 transition-all ${
                  order.status === 'pending' 
                    ? 'border-yellow-500 bg-yellow-900/20' 
                    : 'border-green-500 bg-green-900/20'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{order.orderId}</h3>
                      <p className="text-sm text-slate-400">
                        {order.orderType === 'takeaway' ? '📦 Takeaway' : `🪑 Table ${order.table}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.placedBy} • {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span 
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'pending' 
                            ? 'bg-yellow-900 text-yellow-300' 
                            : 'bg-green-900 text-green-300'
                        }`}
                      >
                        {order.status === 'pending' ? '🔥 COOKING' : '✅ READY'}
                      </span>
                      <div className="text-orange-400 font-bold mt-1">
                        LKR {formatCurrency(order.totalAmount)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-400 mb-2">
                    📝 {order.items?.length || 0} items:
                  </div>
                  <div className="text-xs text-slate-300 mb-3 max-h-16 overflow-y-auto">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.qty}x {item.dishName}</span>
                        <span>LKR {((item.qty || 0) * (item.price || 0)).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-3">
                    <span>⏱️ {Math.floor((new Date() - new Date(order.createdAt)) / (1000 * 60))} min ago</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-3">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleMarkDone(order._id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
                      >
                        ✓ Mark Done
                      </button>
                    )}
                    {order.status === 'done' && (
                      <button
                        onClick={() => handleBillOrder(order)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
                      >
                        💰 Bill & Print
                      </button>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* Quick Actions for Active Orders */}
      {stats.activeOrders > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Ready to Bill</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders
              .filter(order => order.status === 'done')
              .slice(0, 6) // Show max 6 for quick access
              .map(order => (
                <div key={order._id} className="bg-slate-800 p-4 rounded-lg border border-green-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{order.orderId}</h3>
                      <p className="text-sm text-slate-400">
                        {order.table === 'takeaway' ? 'Takeaway' : `Table ${order.table}`}
                      </p>
                    </div>
                    <span className="text-green-400 font-bold">LKR {formatCurrency(order.totalAmount)}</span>
                  </div>
                  <button
                    onClick={() => handleBillOrder(order)}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Bill & Print
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Order Modal */}
      <ErrorBoundary>
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => {
            setIsOrderModalOpen(false);
            setSelectedTable(null);
            setOrderType('table');
          }}
          onSubmit={handlePlaceOrder}
          menuItems={menuItems}
          orderType={orderType}
          tableNumber={selectedTable}
        />
      </ErrorBoundary>

      {/* Billing Modal */}
      <ErrorBoundary>
        <BillingModal
          isOpen={isBillingModalOpen}
          onClose={() => {
            setIsBillingModalOpen(false);
            setSelectedOrderForBilling(null);
          }}
          order={selectedOrderForBilling}
          onBillComplete={handleBillComplete}
        />
      </ErrorBoundary>
    </div>
  );
};

export default CashierDashboard;