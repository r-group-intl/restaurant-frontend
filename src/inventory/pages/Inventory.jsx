import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { useDomain } from '../context/DomainContext';
import { ShoppingCart, Edit, Trash2 } from "lucide-react";

export default function Inventory() {
  const { domain } = useDomain();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [purchasingItem, setPurchasingItem] = useState(null);
  const [inventoryValue, setInventoryValue] = useState(null);
  
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    unit: '',
    price: 0,
    reorderLevel: 0,
    maxOrderLevel: 0,
    lastPurchasedQty: 0,
    categoryId: '',
    supplierId: ''
  });

  const [purchaseFormData, setPurchaseFormData] = useState({
    quantity: 0,
    unitPrice: 0,
    supplier: '',
    notes: ''
  });

  const loadData = async () => {
    try {
      const [itemsRes, categoriesRes, suppliersRes, valueRes] = await Promise.all([
        api.get('/items'),
        api.get('/categories'),
        api.get('/suppliers'),
        api.get('/analytics/inventory/value')
      ]);
      setItems(itemsRes.data);
      setCategories(categoriesRes.data);
      setSuppliers(suppliersRes.data);
      setInventoryValue(valueRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [domain]);

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/items/${editingItem._id}`, itemFormData);
      } else {
        await api.post('/items', itemFormData);
      }
      setShowItemModal(false);
      setEditingItem(null);
      setItemFormData({
        name: '',
        description: '',
        quantity: 0,
        unit: '',
        price: 0,
        reorderLevel: 0,
        maxOrderLevel: 0,
        lastPurchasedQty: 0,
        categoryId: '',
        supplierId: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create purchase transaction
      await api.post('/transactions', {
        item: purchasingItem.name,
        type: 'purchase',
        quantity: parseFloat(purchaseFormData.quantity),
        unitPrice: parseFloat(purchaseFormData.unitPrice),
        supplier: purchaseFormData.supplier,
        notes: purchaseFormData.notes || `Purchase - ${purchasingItem.name}`
      });
      
      setShowPurchaseModal(false);
      setPurchasingItem(null);
      setPurchaseFormData({
        quantity: 0,
        unitPrice: 0,
        supplier: '',
        notes: ''
      });
      loadData();
      alert('Purchase recorded successfully!');
    } catch (error) {
      console.error('Error recording purchase:', error);
      alert('Error recording purchase. Please try again.');
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      unit: item.unit,
      price: item.price || 0,
      reorderLevel: item.reorderLevel || 0,
      maxOrderLevel: item.maxOrderLevel || 0,
      lastPurchasedQty: item.lastPurchasedQty || 0,
      categoryId: item.categoryId?._id || '',
      supplierId: item.supplierId?._id || ''
    });
    setShowItemModal(true);
  };

  const handleBuyItem = (item) => {
    setPurchasingItem(item);
    setPurchaseFormData({
      quantity: 0,
      unitPrice: 0,
      supplier: item.supplierId?._id || '',
      notes: ''
    });
    setShowPurchaseModal(true);
  };

  const handleDeleteItem = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/items/${id}`);
        loadData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Item Name' },
    { 
      key: 'category', 
      label: 'Category',
      render: (_, item) => item.categoryId?.name || 'Uncategorized'
    },
    { 
      key: 'supplier', 
      label: 'Supplier',
      render: (_, item) => item.supplierId?.name || 'No Supplier'
    },
    { 
      key: 'stock', 
      label: 'Current Stock',
      render: (_, item) => (
        <span className={`${item.quantity <= (item.reorderLevel || 0) ? 'text-red-400' : 'text-white'}`}>
          {item.quantity} {item.unit}
        </span>
      )
    },
    { 
      key: 'unitPrice', 
      label: 'Unit Price',
      render: (_, item) => `LKR ${(item.price || 0).toFixed(2)}`
    },
    { 
      key: 'value', 
      label: 'Total Value',
      render: (_, item) => (
        <span className="font-medium text-green-400">
          LKR {((item.quantity || 0) * (item.price || 0)).toFixed(2)}
        </span>
      )
    },
    { 
      key: 'reorderLevel', 
      label: 'Reorder Level',
      render: (_, item) => `${item.reorderLevel || 0} ${item.unit}`
    },
    { 
      key: 'maxOrderLevel', 
      label: 'Max Order Level',
      render: (_, item) => `${item.maxOrderLevel || 0} ${item.unit}`
    },
    { 
      key: 'lastPurchased', 
      label: 'Last Purchased',
      render: (_, item) => `${item.lastPurchasedQty || 0} ${item.unit}`
    },
{
  key: "actions",
  label: "Actions",
  render: (_, item) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleBuyItem(item)}
        className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
        title="Buy"
      >
        <ShoppingCart className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleEditItem(item)}
        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        title="Edit"
      >
        <Edit className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleDeleteItem(item._id)}
        className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  ),
}
  ];

  const lowStockItems = items.filter(item => item.quantity <= (item.reorderLevel || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <button 
          onClick={() => setShowItemModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Add New Item
        </button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-slate-400 text-sm">Total Items</div>
          <div className="text-2xl font-bold">{inventoryValue?.totalItems || 0}</div>
        </Card>
        <Card>
          <div className="text-slate-400 text-sm">Total Value</div>
          <div className="text-2xl font-bold text-primary">LKR {inventoryValue?.totalValue?.toLocaleString() || '0'}</div>
        </Card>
        <Card>
          <div className="text-slate-400 text-sm">Low Stock Items</div>
          <div className="text-2xl font-bold text-red-400">{lowStockItems.length}</div>
        </Card>
        <Card>
          <div className="text-slate-400 text-sm">Categories</div>
          <div className="text-2xl font-bold">{categories.length}</div>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card title="⚠️ Low Stock Alerts">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.map((item) => (
              <div key={item._id} className="p-3 rounded-md bg-red-500/10 border border-red-500/20 flex justify-between items-center">
                <div>
                  <div className="font-medium text-red-400">{item.name}</div>
                  <div className="text-sm text-slate-300">
                    Stock: {item.quantity} {item.unit} • Reorder: {item.reorderLevel} {item.unit}
                  </div>
                </div>
                <button 
                  onClick={() => handleBuyItem(item)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Items Table */}
      <Card title="Inventory Items">
        <Table data={items} columns={columns} />
      </Card>

      {/* Add/Edit Item Modal */}
      <Modal 
        isOpen={showItemModal} 
        onClose={() => {
          setShowItemModal(false);
          setEditingItem(null);
          setItemFormData({
            name: '',
            description: '',
            quantity: 0,
            unit: '',
            price: 0,
            reorderLevel: 0,
            maxOrderLevel: 0,
            lastPurchasedQty: 0,
            categoryId: '',
            supplierId: ''
          });
        }}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      >
        <form onSubmit={handleItemSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Item Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                value={itemFormData.name}
                onChange={(e) => setItemFormData({...itemFormData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Unit</label>
              <input
                type="text"
                required
                placeholder="kg, pieces, liters, etc."
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                value={itemFormData.unit}
                onChange={(e) => setItemFormData({...itemFormData, unit: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
              rows="2"
              value={itemFormData.description}
              onChange={(e) => setItemFormData({...itemFormData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Initial Quantity</label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                value={itemFormData.quantity}
                onChange={(e) => setItemFormData({...itemFormData, quantity: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Unit Price (LKR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                value={itemFormData.price}
                onChange={(e) => setItemFormData({...itemFormData, price: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Reorder Level</label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                value={itemFormData.reorderLevel}
                onChange={(e) => setItemFormData({...itemFormData, reorderLevel: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Max Order Level</label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                value={itemFormData.maxOrderLevel}
                onChange={(e) => setItemFormData({...itemFormData, maxOrderLevel: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Last Purchased Qty</label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                value={itemFormData.lastPurchasedQty}
                onChange={(e) => setItemFormData({...itemFormData, lastPurchasedQty: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          {domain === 'restaurant' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                  value={itemFormData.categoryId}
                  onChange={(e) => {
                    const selectedCategoryId = e.target.value;
                    const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
                    setItemFormData({
                      ...itemFormData, 
                      categoryId: selectedCategoryId,
                      unit: selectedCategory ? selectedCategory.unit : itemFormData.unit
                    });
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Supplier</label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                  value={itemFormData.supplierId}
                  onChange={(e) => setItemFormData({...itemFormData, supplierId: e.target.value})}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(sup => (
                    <option key={sup._id} value={sup._id}>{sup.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button 
              type="button"
              onClick={() => {
                setShowItemModal(false);
                setEditingItem(null);
                setItemFormData({
                  name: '',
                  description: '',
                  quantity: 0,
                  unit: '',
                  price: 0,
                  reorderLevel: 0,
                  categoryId: '',
                  supplierId: ''
                });
              }}
              className="px-4 py-2 border border-slate-600 rounded text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              {editingItem ? 'Update' : 'Add'} Item
            </button>
          </div>
        </form>
      </Modal>

      {/* Purchase Modal */}
      <Modal 
        isOpen={showPurchaseModal} 
        onClose={() => {
          setShowPurchaseModal(false);
          setPurchasingItem(null);
          setPurchaseFormData({
            quantity: 0,
            unitPrice: 0,
            supplier: '',
            notes: ''
          });
        }}
        title={`Purchase: ${purchasingItem?.name}`}
      >
        <form onSubmit={handlePurchaseSubmit} className="space-y-4">
          <div className="p-3 bg-slate-800 rounded">
            <div className="text-sm text-slate-400">Current Stock</div>
            <div className="text-lg font-semibold">{purchasingItem?.quantity} {purchasingItem?.unit}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Quantity to Buy</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                value={purchaseFormData.quantity}
                onChange={(e) => setPurchaseFormData({...purchaseFormData, quantity: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Unit Price (LKR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                value={purchaseFormData.unitPrice}
                onChange={(e) => setPurchaseFormData({...purchaseFormData, unitPrice: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Supplier</label>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
              value={purchaseFormData.supplier}
              onChange={(e) => setPurchaseFormData({...purchaseFormData, supplier: e.target.value})}
            >
              <option value="">Select Supplier</option>
              {suppliers.map(sup => (
                <option key={sup._id} value={sup._id}>{sup.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
              rows="2"
              placeholder="Purchase notes..."
              value={purchaseFormData.notes}
              onChange={(e) => setPurchaseFormData({...purchaseFormData, notes: e.target.value})}
            />
          </div>

          {purchaseFormData.quantity > 0 && purchaseFormData.unitPrice > 0 && (
            <div className="p-3 bg-primary-600/10 border border-primary-600/20 rounded">
              <div className="text-sm text-slate-400">Total Cost</div>
              <div className="text-xl font-bold text-primary">
                LKR {(parseFloat(purchaseFormData.quantity) * parseFloat(purchaseFormData.unitPrice)).toLocaleString()}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button 
              type="button"
              onClick={() => {
                setShowPurchaseModal(false);
                setPurchasingItem(null);
                setPurchaseFormData({
                  quantity: 0,
                  unitPrice: 0,
                  supplier: '',
                  notes: ''
                });
              }}
              className="px-4 py-2 border border-slate-600 rounded text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Record Purchase
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
