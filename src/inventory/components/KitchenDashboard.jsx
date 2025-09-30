import { useState, useEffect } from 'react';
import OrderCard from './OrderCard';
import { api } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { Clock, ChefHat, AlertTriangle } from 'lucide-react';

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, urgent
  const [stats, setStats] = useState({
    pendingOrders: 0,
    completedToday: 0,
    averageTime: 0
  });

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 15 seconds for kitchen
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/orders/dashboard');
      const { orders: ordersData, ...statsData } = response.data;
      setOrders(ordersData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/done`);
      toast.success('Order marked as done!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error marking order as done:', error);
      toast.error('Failed to mark order as done');
    }
  };

  const getOrderAge = (createdAt) => {
    const now = new Date();
    const orderTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60));
    return diffInMinutes;
  };

  const isOrderUrgent = (createdAt) => {
    return getOrderAge(createdAt) > 20; // More than 20 minutes
  };

  const getFilteredOrders = () => {
    let filtered = orders.filter(order => order.status === 'pending');
    
    if (filter === 'urgent') {
      filtered = filtered.filter(order => isOrderUrgent(order.createdAt));
    }
    
    // Sort by creation time (oldest first)
    return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  const getBeverageOrders = () => {
    return orders.filter(order => 
      order.status === 'pending' && 
      order.items.some(item => item.category === 'Beverage')
    );
  };

  const getFoodOrders = () => {
    return orders.filter(order => 
      order.status === 'pending' && 
      order.items.some(item => item.category !== 'Beverage')
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading kitchen dashboard...</div>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();
  const beverageOrders = getBeverageOrders();
  const foodOrders = getFoodOrders();

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <ChefHat className="text-orange-400" size={32} />
          <h1 className="text-3xl font-bold text-white">Kitchen Dashboard</h1>
        </div>
        
        <div className="flex space-x-6 text-sm mb-4">
          <div className="bg-slate-800 px-4 py-2 rounded">
            <span className="text-slate-400">Pending Orders: </span>
            <span className="text-orange-400 font-semibold">{stats.pendingOrders || 0}</span>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded">
            <span className="text-slate-400">Completed Today: </span>
            <span className="text-green-400 font-semibold">{stats.completedToday || 0}</span>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded">
            <span className="text-slate-400">Avg. Time: </span>
            <span className="text-blue-400 font-semibold">{stats.averageTime || 0} min</span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded text-sm ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            All Orders ({filteredOrders.length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded text-sm flex items-center space-x-1 ${
              filter === 'urgent'
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <AlertTriangle size={16} />
            <span>Urgent ({filteredOrders.filter(order => isOrderUrgent(order.createdAt)).length})</span>
          </button>
        </div>
      </div>

      {/* Priority Section - Urgent Orders */}
      {filteredOrders.some(order => isOrderUrgent(order.createdAt)) && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center space-x-2">
            <AlertTriangle size={20} />
            <span>Urgent Orders (20+ minutes)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders
              .filter(order => isOrderUrgent(order.createdAt))
              .map(order => (
                <div key={order._id} className="relative">
                  <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full z-10">
                    {getOrderAge(order.createdAt)} min
                  </div>
                  <OrderCard
                    order={order}
                    onDone={handleMarkDone}
                    variant="compact"
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Main Orders Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Food Orders */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <span>🍽️</span>
            <span>Food Orders ({foodOrders.length})</span>
          </h2>
          <div className="space-y-4">
            {foodOrders.length === 0 ? (
              <div className="bg-slate-800 p-8 rounded-lg text-center">
                <p className="text-slate-500">No food orders pending</p>
              </div>
            ) : (
              foodOrders.map(order => (
                <div key={order._id} className="relative">
                  <div className="absolute top-2 right-2 flex items-center space-x-1 text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                    <Clock size={12} />
                    <span>{getOrderAge(order.createdAt)} min ago</span>
                  </div>
                  <OrderCard
                    order={order}
                    onDone={handleMarkDone}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Beverage Orders */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <span>🥤</span>
            <span>Beverage Orders ({beverageOrders.length})</span>
          </h2>
          <div className="space-y-4">
            {beverageOrders.length === 0 ? (
              <div className="bg-slate-800 p-8 rounded-lg text-center">
                <p className="text-slate-500">No beverage orders pending</p>
              </div>
            ) : (
              beverageOrders.map(order => (
                <div key={order._id} className="relative">
                  <div className="absolute top-2 right-2 flex items-center space-x-1 text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                    <Clock size={12} />
                    <span>{getOrderAge(order.createdAt)} min ago</span>
                  </div>
                  <OrderCard
                    order={order}
                    onDone={handleMarkDone}
                    variant="compact"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* No Orders State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-16">
          <ChefHat className="mx-auto mb-4 text-slate-600" size={64} />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">All caught up!</h3>
          <p className="text-slate-500">No pending orders in the kitchen.</p>
        </div>
      )}
    </div>
  );
};

export default KitchenDashboard;