import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import {
  TrashIcon,
  CalendarIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

const WastageManagement = () => {
  const [wastageEntries, setWastageEntries] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWastage, setNewWastage] = useState({
    itemName: '',
    quantity: '',
    unit: 'kg',
    pricePerKg: '',
    notes: ''
  });
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    fetchWastageData();
    fetchMenuItems();
  }, []);

  const fetchWastageData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wastage');
      setWastageEntries(response.data.wastage || []);
      setTodayTotal(response.data.todayTotal || 0);
    } catch (error) {
      console.error('Error fetching wastage data:', error);
      toast.error('Failed to load wastage data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu-items');
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleAddWastage = async (e) => {
    e.preventDefault();
    
    if (!newWastage.itemName || !newWastage.quantity) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await api.post('/wastage', {
        ...newWastage,
        quantity: parseFloat(newWastage.quantity),
        pricePerKg: parseFloat(newWastage.pricePerKg) || 0
      });
      
      toast.success('Wastage entry added successfully');
      setNewWastage({
        itemName: '',
        quantity: '',
        unit: 'kg',
        pricePerKg: '',
        notes: ''
      });
      setShowAddForm(false);
      fetchWastageData();
    } catch (error) {
      console.error('Error adding wastage:', error);
      toast.error('Failed to add wastage entry');
    }
  };

  const handleDeleteWastage = async (wastageId) => {
    if (!confirm('Are you sure you want to delete this wastage entry?')) {
      return;
    }

    try {
      await api.delete(`/wastage/${wastageId}`);
      toast.success('Wastage entry deleted');
      fetchWastageData();
    } catch (error) {
      console.error('Error deleting wastage:', error);
      toast.error('Failed to delete wastage entry');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading wastage data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <TrashIcon className="w-8 h-8 text-red-400" />
              Wastage Management
            </h1>
            <p className="text-slate-400 mt-1">Track daily wastage and manage garbage sales</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            {showAddForm ? <MinusIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
            {showAddForm ? 'Cancel' : 'Add Wastage'}
          </button>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 p-4 rounded-lg border border-red-500">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-red-400" />
              <div>
                <h3 className="text-white font-semibold">Today's Date</h3>
                <p className="text-slate-300">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-lg border border-yellow-500">
            <div className="flex items-center gap-3">
              <ScaleIcon className="w-8 h-8 text-yellow-400" />
              <div>
                <h3 className="text-white font-semibold">Today's Wastage</h3>
                <p className="text-slate-300">{todayTotal.toFixed(2)} kg</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 p-4 rounded-lg border border-green-500">
            <div className="flex items-center gap-3">
              <CurrencyDollarIcon className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="text-white font-semibold">Potential Revenue</h3>
                <p className="text-slate-300">
                  LKR {wastageEntries
                    .filter(entry => new Date(entry.createdAt).toDateString() === new Date().toDateString())
                    .reduce((sum, entry) => sum + (entry.quantity * entry.pricePerKg), 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Wastage Form */}
        {showAddForm && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Add New Wastage Entry</h2>
            <form onSubmit={handleAddWastage} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={newWastage.itemName}
                  onChange={(e) => setNewWastage({...newWastage, itemName: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  placeholder="Enter item name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Quantity * ({newWastage.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newWastage.quantity}
                  onChange={(e) => setNewWastage({...newWastage, quantity: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  placeholder="Enter quantity"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Unit
                </label>
                <select
                  value={newWastage.unit}
                  onChange={(e) => setNewWastage({...newWastage, unit: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="pieces">Pieces</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Price per Kg (LKR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newWastage.pricePerKg}
                  onChange={(e) => setNewWastage({...newWastage, pricePerKg: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  placeholder="Price garbage collectors pay"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={newWastage.notes}
                  onChange={(e) => setNewWastage({...newWastage, notes: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  rows="3"
                  placeholder="Additional notes (optional)"
                />
              </div>
              
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Add Wastage Entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-600 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Wastage Entries List */}
        <div className="bg-slate-800 rounded-lg border border-slate-700">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">Wastage Entries</h2>
          </div>
          
          {wastageEntries.length === 0 ? (
            <div className="p-8 text-center">
              <TrashIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No wastage entries found</p>
              <p className="text-slate-500 text-sm">Add your first wastage entry to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Price/Kg
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {wastageEntries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-slate-700">
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {new Date(entry.createdAt).toLocaleDateString()}<br />
                        <span className="text-xs text-slate-400">
                          {new Date(entry.createdAt).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white font-medium">
                        {entry.itemName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {entry.quantity} {entry.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        LKR {entry.pricePerKg?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-400 font-medium">
                        LKR {((entry.quantity || 0) * (entry.pricePerKg || 0)).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {entry.notes || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDeleteWastage(entry._id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete entry"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WastageManagement;