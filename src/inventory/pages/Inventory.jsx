import { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { useDomain } from '../context/DomainContext';
import { ShoppingCart, Edit, Trash2, RefreshCw } from "lucide-react";
import { formatQuantity, formatPrice, parseInventoryNumber, safeMultiply } from '../utils/numberUtils';
import { 
  getPurchaseUnitsForBaseUnit, 
  convertPurchaseToBaseUnit, 
  calculateTotalCost, 
  getConversionDisplay,
  getSuggestedPurchaseUnits 
} from '../utils/purchaseUnitConverter';

export default function Inventory() {
  const { domain } = useDomain();
  const [items, setItems] = useState([]);
  const [packingItems, setPackingItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredPackingItems, setFilteredPackingItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [packingSearchTerm, setPackingSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all, low-stock, in-stock
  const [activeTab, setActiveTab] = useState('inventory'); // inventory, packing
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [purchasingItem, setPurchasingItem] = useState(null);
  const [selectedItemBatches, setSelectedItemBatches] = useState([]);
  const [batchAnalytics, setBatchAnalytics] = useState(null);
  const [expiredBatches, setExpiredBatches] = useState([]);
  const [nearExpiryBatches, setNearExpiryBatches] = useState([]);
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
    supplierId: '',
    itemType: 'inventory', // inventory or packing
    isPackingItem: false,
    // Batch tracking fields
    trackExpiry: false,
    defaultShelfLife: 7, // days
    expiryDate: '',
    batchNumber: ''
  });

  const [purchaseFormData, setPurchaseFormData] = useState({
    quantity: 0,
    unitPrice: 0,
    purchaseUnit: '', // New field for purchase unit selection
    totalPrice: 0, // New field for total price of purchase
    supplier: '',
    notes: '',
    expiryDate: '',
    batchNumber: ''
  });

  const loadData = async () => {
    try {
      const [itemsRes, packingItemsRes, categoriesRes, suppliersRes, valueRes, batchAnalyticsRes, expiredRes, nearExpiryRes] = await Promise.all([
        api.get('/items?itemType=inventory'),
        api.get('/items?itemType=packing'),
        api.get('/categories'),
        api.get('/suppliers'),
        api.get('/analytics/inventory/value'),
        api.get('/batches/analytics'),
        api.get('/batches/expired'),
        api.get('/batches/near-expiry')
      ]);
      setItems(itemsRes.data);
      setPackingItems(packingItemsRes.data);
      setCategories(categoriesRes.data);
      setSuppliers(suppliersRes.data);
      setInventoryValue(valueRes.data);
      setBatchAnalytics(batchAnalyticsRes.data);
      setExpiredBatches(expiredRes.data);
      setNearExpiryBatches(nearExpiryRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [domain]);

  // Real-time updates - refresh every 30 seconds to show KOT deductions
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [domain]);

  // Filter items based on search term, category, and stock status
  useEffect(() => {
    let filtered = items;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unit.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.categoryId === categoryFilter);
    }

    // Stock filter
    if (stockFilter === 'low-stock') {
      filtered = filtered.filter(item => item.quantity <= (item.reorderLevel || 0));
    } else if (stockFilter === 'in-stock') {
      filtered = filtered.filter(item => item.quantity > (item.reorderLevel || 0));
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, categoryFilter, stockFilter]);

  // Filter packing items separately
  useEffect(() => {
    let filtered = packingItems;

    // Search filter for packing items
    if (packingSearchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(packingSearchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(packingSearchTerm.toLowerCase()) ||
        item.unit.toLowerCase().includes(packingSearchTerm.toLowerCase())
      );
    }

    // Stock filter for packing items
    if (stockFilter === 'low-stock') {
      filtered = filtered.filter(item => item.quantity <= (item.reorderLevel || 0));
    } else if (stockFilter === 'in-stock') {
      filtered = filtered.filter(item => item.quantity > (item.reorderLevel || 0));
    }

    setFilteredPackingItems(filtered);
  }, [packingItems, packingSearchTerm, stockFilter]);

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...itemFormData,
        isPackingItem: itemFormData.itemType === 'packing',
        itemType: itemFormData.itemType || 'inventory'
      };

      if (editingItem) {
        await api.put(`/items/${editingItem._id}`, submitData);
      } else {
        await api.post('/items', submitData);
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
        supplierId: '',
        itemType: 'inventory',
        isPackingItem: false,
        trackExpiry: false,
        defaultShelfLife: 7,
        expiryDate: '',
        batchNumber: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert purchase unit to base unit
      const conversionResult = convertPurchaseToBaseUnit(
        purchaseFormData.quantity,
        purchaseFormData.totalPrice,
        purchaseFormData.purchaseUnit,
        purchasingItem.unit
      );

      // Create purchase transaction with proper precision
      const transactionData = {
        item: purchasingItem.name,
        type: 'purchase',
        quantity: conversionResult.baseQuantity,
        unitPrice: conversionResult.baseUnitPrice,
        supplier: purchaseFormData.supplier,
        notes: purchaseFormData.notes || `Purchase - ${purchasingItem.name} (${purchaseFormData.quantity} ${purchaseFormData.purchaseUnit})`,
        expiryDate: purchaseFormData.expiryDate,
        batchNumber: purchaseFormData.batchNumber,
        // Add purchase metadata for reference
        purchaseMetadata: {
          purchaseQuantity: purchaseFormData.quantity,
          purchaseUnit: purchaseFormData.purchaseUnit,
          totalPrice: purchaseFormData.totalPrice,
          conversionFactor: conversionResult.conversionFactor
        }
      };

      await api.post('/transactions', transactionData);

      // If item has expiry tracking enabled or expiry date provided, create batch
      if (purchaseFormData.expiryDate || purchasingItem.trackExpiry) {
        const batchData = {
          itemId: purchasingItem._id,
          quantity: conversionResult.baseQuantity,
          expiryDate: purchaseFormData.expiryDate || new Date(Date.now() + (purchasingItem.defaultShelfLife || 7) * 24 * 60 * 60 * 1000),
          unitPrice: conversionResult.baseUnitPrice,
          supplierId: purchaseFormData.supplier,
          batchNumber: purchaseFormData.batchNumber,
          notes: purchaseFormData.notes,
          // Add purchase metadata to batch as well
          purchaseMetadata: {
            purchaseQuantity: purchaseFormData.quantity,
            purchaseUnit: purchaseFormData.purchaseUnit,
            totalPrice: purchaseFormData.totalPrice,
            conversionFactor: conversionResult.conversionFactor
          }
        };

        await api.post('/batches', batchData);
      }
      
      setShowPurchaseModal(false);
      setPurchasingItem(null);
      setPurchaseFormData({
        quantity: 0,
        unitPrice: 0,
        purchaseUnit: '',
        totalPrice: 0,
        supplier: '',
        notes: '',
        expiryDate: '',
        batchNumber: ''
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
      supplierId: item.supplierId?._id || '',
      itemType: item.isPackingItem ? 'packing' : 'inventory',
      isPackingItem: item.isPackingItem || false,
      trackExpiry: item.trackExpiry || false,
      defaultShelfLife: item.defaultShelfLife || 7,
      expiryDate: '',
      batchNumber: ''
    });
    setShowItemModal(true);
  };

  const handleBuyItem = (item) => {
    setPurchasingItem(item);
    
    // Calculate default expiry date if item has default shelf life
    let defaultExpiryDate = '';
    if (item.trackExpiry || item.defaultShelfLife) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + (item.defaultShelfLife || 7));
      defaultExpiryDate = futureDate.toISOString().split('T')[0];
    }

    // Get suggested purchase units for this item
    const suggestedUnits = getSuggestedPurchaseUnits(item.name, item.unit);
    const defaultPurchaseUnit = suggestedUnits[0] || item.unit;
    
    setPurchaseFormData({
      quantity: 0,
      unitPrice: 0,
      purchaseUnit: defaultPurchaseUnit,
      totalPrice: 0,
      supplier: item.supplierId?._id || '',
      notes: '',
      expiryDate: defaultExpiryDate,
      batchNumber: ''
    });
    setShowPurchaseModal(true);
  };

  const handleViewBatches = async (item) => {
    try {
      const response = await api.get(`/batches/item/${item._id}`);
      setSelectedItemBatches(response.data);
      setShowBatchModal(true);
    } catch (error) {
      console.error('Error fetching batches:', error);
      alert('Error loading batches');
    }
  };

  const handleMarkExpiredAsWastage = async () => {
    if (confirm('Are you sure you want to mark all expired batches as wastage? This action cannot be undone.')) {
      try {
        const response = await api.post('/batches/mark-expired-wastage', {
          userId: null, // Add user context if available
          role: 'admin'
        });
        
        alert(`Successfully marked ${response.data.expiredCount} expired batches as wastage`);
        loadData();
      } catch (error) {
        console.error('Error marking expired batches:', error);
        alert('Error processing expired batches');
      }
    }
  };

  const handleSyncInventory = async () => {
    if (confirm('This will synchronize all inventory quantities with their batch totals. Continue?')) {
      try {
        const response = await api.post('/inventory/repair');
        
        if (response.data.success) {
          alert(`Inventory synchronized successfully! ${response.data.message}`);
          loadData(); // Refresh the data
        } else {
          alert('Failed to synchronize inventory');
        }
      } catch (error) {
        console.error('Error synchronizing inventory:', error);
        alert('Error synchronizing inventory. Please try again.');
      }
    }
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
        <div className="flex flex-col">
          <span className={`${item.quantity <= (item.reorderLevel || 0) ? 'text-red-400' : 'text-white'}`}>
            {formatQuantity(item.quantity)} {item.unit}
          </span>
          {item.trackExpiry && (
            <div className="text-xs text-slate-400">
              {item.totalBatches > 0 ? `${item.totalBatches} batches` : 'No batches'}
              {item.nearExpiryCount > 0 && (
                <span className="text-yellow-400 ml-1">
                  ({item.nearExpiryCount} near expiry)
                </span>
              )}
              {item.expiredCount > 0 && (
                <span className="text-red-400 ml-1">
                  ({item.expiredCount} expired)
                </span>
              )}
            </div>
          )}
        </div>
      )
    },
    { 
      key: 'unitPrice', 
      label: 'Unit Price',
      render: (_, item) => `LKR ${formatPrice(item.price || 0)}`
    },
    { 
      key: 'value', 
      label: 'Total Value',
      render: (_, item) => (
        <span className="font-medium text-green-400">
          LKR {formatPrice(safeMultiply(item.quantity || 0, item.price || 0))}
        </span>
      )
    },

    { 
      key: 'reorderLevel', 
      label: 'Reorder Level',
      render: (_, item) => `${formatQuantity(item.reorderLevel || 0)} ${item.unit}`
    },
    { 
      key: 'lastPurchasedQty', 
      label: 'Last Purchased Qty',
      render: (_, item) => (
        <span className="text-blue-400">
          {formatQuantity(item.lastPurchasedQty || 0)} {item.unit}
        </span>
      )
    },
{
  key: "actions",
  label: "Actions",
  render: (_, item) => (
    <div className="flex space-x-1">
      <button
        onClick={() => handleBuyItem(item)}
        className="p-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
        title="Purchase"
      >
        <ShoppingCart className="w-3 h-3" />
      </button>

      {item.trackExpiry && (
        <button
          onClick={() => handleViewBatches(item)}
          className="p-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs"
          title="View Batches"
        >
          📦
        </button>
      )}

      <button
        onClick={() => handleEditItem(item)}
        className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
        title="Edit"
      >
        <Edit className="w-3 h-3" />
      </button>

      <button
        onClick={() => handleDeleteItem(item._id)}
        className="p-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
        title="Delete"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  ),
}
  ];

  const lowStockItems = [...items, ...packingItems].filter(item => item.quantity <= (item.reorderLevel || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="flex space-x-2">
          <button 
            onClick={loadData}
            className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-700 flex items-center space-x-2"
            title="Refresh inventory data"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button 
            onClick={handleSyncInventory}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
            title="Synchronize inventory quantities with batch totals"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Quantities</span>
          </button>
          <button 
            onClick={() => {
              setItemFormData(prev => ({
                ...prev,
                itemType: activeTab === 'packing' ? 'packing' : 'inventory',
                isPackingItem: activeTab === 'packing'
              }));
              setShowItemModal(true);
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Add New {activeTab === 'packing' ? 'Packing Item' : 'Item'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === 'inventory'
              ? 'bg-primary-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          Inventory Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('packing')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === 'packing'
              ? 'bg-primary-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          Packing Items ({packingItems.length})
        </button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <div className="text-slate-400 text-sm">Total Items</div>
          <div className="text-2xl font-bold">{(inventoryValue?.totalItems || 0) + packingItems.length}</div>
          <div className="text-xs text-slate-500">
            {items.length} inventory + {packingItems.length} packing
          </div>
        </Card>
        <Card>
          <div className="text-slate-400 text-sm">Total Value</div>
          <div className="text-2xl font-bold text-primary">LKR {((inventoryValue?.totalValue || 0) + packingItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)).toLocaleString()}</div>
        </Card>
        <Card>
          <div className="text-slate-400 text-sm">Low Stock Items</div>
          <div className="text-2xl font-bold text-red-400">{lowStockItems.length}</div>
        </Card>
        <Card>
          <div className="text-slate-400 text-sm">Near Expiry</div>
          <div className="text-2xl font-bold text-yellow-400">{nearExpiryBatches.length}</div>
          <div className="text-xs text-slate-400">batches</div>
        </Card>
        <Card>
          <div className="text-slate-400 text-sm">Expired</div>
          <div className="text-2xl font-bold text-red-400">{expiredBatches.length}</div>
          <div className="text-xs text-slate-400">batches</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card title="Search & Filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search {activeTab === 'packing' ? 'Packing Items' : 'Items'}
            </label>
            <input
              type="text"
              placeholder="Search by name, description, or unit..."
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-400"
              value={activeTab === 'packing' ? packingSearchTerm : searchTerm}
              onChange={(e) => activeTab === 'packing' ? setPackingSearchTerm(e.target.value) : setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Category Filter - Only for inventory items */}
          {activeTab === 'inventory' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Placeholder for alignment when packing tab is active */}
          {activeTab === 'packing' && <div></div>}
          
          {/* Stock Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Stock Status</label>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">All Items</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
            </select>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="mt-4 text-sm text-slate-400">
          {activeTab === 'inventory' ? (
            <>
              Showing {filteredItems.length} of {items.length} inventory items
              {searchTerm && <span> matching "{searchTerm}"</span>}
            </>
          ) : (
            <>
              Showing {filteredPackingItems.length} of {packingItems.length} packing items
              {packingSearchTerm && <span> matching "{packingSearchTerm}"</span>}
            </>
          )}
        </div>
      </Card>

      {/* Expiry Alerts */}
      {(expiredBatches.length > 0 || nearExpiryBatches.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Expired Batches */}
          {expiredBatches.length > 0 && (
            <Card title="🚨 Expired Batches">
              <div className="space-y-2 mb-4">
                {expiredBatches.slice(0, 5).map((batch) => (
                  <div key={batch._id} className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                    <div className="font-medium text-red-400">{batch.itemId?.name}</div>
                    <div className="text-sm text-slate-300">
                      Batch: {batch.batchNumber} • Qty: {formatQuantity(batch.quantity)} {batch.itemId?.unit}
                    </div>
                    <div className="text-xs text-red-300">
                      Expired: {new Date(batch.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {expiredBatches.length > 5 && (
                  <div className="text-sm text-slate-400">
                    +{expiredBatches.length - 5} more expired batches
                  </div>
                )}
              </div>
              <button 
                onClick={handleMarkExpiredAsWastage}
                className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Mark All as Wastage
              </button>
            </Card>
          )}

          {/* Near Expiry Batches */}
          {nearExpiryBatches.length > 0 && (
            <Card title="⚠️ Near Expiry Batches">
              <div className="space-y-2">
                {nearExpiryBatches.slice(0, 5).map((batch) => (
                  <div key={batch._id} className="p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                    <div className="font-medium text-yellow-400">{batch.itemId?.name}</div>
                    <div className="text-sm text-slate-300">
                      Batch: {batch.batchNumber} • Qty: {formatQuantity(batch.quantity)} {batch.itemId?.unit}
                    </div>
                    <div className="text-xs text-yellow-300">
                      Expires: {new Date(batch.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {nearExpiryBatches.length > 5 && (
                  <div className="text-sm text-slate-400">
                    +{nearExpiryBatches.length - 5} more batches expiring soon
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card title="⚠️ Low Stock Alerts">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.map((item) => (
              <div key={item._id} className="p-3 rounded-md bg-red-500/10 border border-red-500/20 flex justify-between items-center">
                <div>
                  <div className="font-medium text-red-400">{item.name}</div>
                  <div className="text-sm text-slate-300">
                    Stock: {formatQuantity(item.quantity)} {item.unit} • Reorder: {formatQuantity(item.reorderLevel)} {item.unit}
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
      <Card title={activeTab === 'packing' ? 'Packing Items' : 'Inventory Items'}>
        <Table 
          data={activeTab === 'packing' ? filteredPackingItems : filteredItems} 
          columns={columns} 
        />
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
            supplierId: '',
            itemType: 'inventory',
            isPackingItem: false
          });
        }}
        title={editingItem ? `Edit ${editingItem.isPackingItem ? 'Packing Item' : 'Item'}` : `Add New ${itemFormData.itemType === 'packing' ? 'Packing Item' : 'Item'}`}
      >
        <form onSubmit={handleItemSubmit} className="space-y-4">
          {/* Item Type Selection - Only for new items */}
          {!editingItem && (
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-3">Item Type</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-3 border border-slate-600 rounded cursor-pointer hover:bg-slate-700">
                  <input
                    type="radio"
                    name="itemType"
                    value="inventory"
                    checked={itemFormData.itemType === 'inventory'}
                    onChange={(e) => setItemFormData({
                      ...itemFormData,
                      itemType: e.target.value,
                      isPackingItem: false
                    })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-slate-200">Inventory Item</div>
                    <div className="text-sm text-slate-400">Food ingredients and supplies</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-slate-600 rounded cursor-pointer hover:bg-slate-700">
                  <input
                    type="radio"
                    name="itemType"
                    value="packing"
                    checked={itemFormData.itemType === 'packing'}
                    onChange={(e) => setItemFormData({
                      ...itemFormData,
                      itemType: e.target.value,
                      isPackingItem: true,
                      unit: itemFormData.unit || 'pcs' // Default unit for packing items
                    })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-slate-200">Packing Item</div>
                    <div className="text-sm text-slate-400">Cups, containers, cutlery, etc.</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Item Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                value={itemFormData.name}
                onChange={(e) => setItemFormData({...itemFormData, name: e.target.value})}
                placeholder={itemFormData.isPackingItem ? "e.g., Soup Cup, Cutlery Set" : "e.g., Onions, Rice"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Unit</label>
              <input
                type="text"
                required
                placeholder={itemFormData.isPackingItem ? "pcs, sets, boxes" : "kg, pieces, liters, etc."}
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
                onChange={(e) => setItemFormData({...itemFormData, quantity: parseInventoryNumber(e.target.value)})}
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
                onChange={(e) => setItemFormData({...itemFormData, price: parseInventoryNumber(e.target.value, 2)})}
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
                onChange={(e) => setItemFormData({...itemFormData, reorderLevel: parseInventoryNumber(e.target.value)})}
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
                onChange={(e) => setItemFormData({...itemFormData, maxOrderLevel: parseInventoryNumber(e.target.value)})}
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
                onChange={(e) => setItemFormData({...itemFormData, lastPurchasedQty: parseInventoryNumber(e.target.value)})}
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

          {/* Expiry Tracking */}
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Expiry Tracking</h4>
            
            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={itemFormData.trackExpiry}
                  onChange={(e) => setItemFormData({...itemFormData, trackExpiry: e.target.checked})}
                />
                <span className="text-sm text-slate-300">Track expiry dates for this item</span>
              </label>
            </div>

            {itemFormData.trackExpiry && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Default Shelf Life (days)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                    value={itemFormData.defaultShelfLife}
                    onChange={(e) => setItemFormData({...itemFormData, defaultShelfLife: parseInt(e.target.value) || 1})}
                  />
                </div>
                
                {!editingItem && itemFormData.quantity > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Initial Expiry Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                      value={itemFormData.expiryDate}
                      onChange={(e) => setItemFormData({...itemFormData, expiryDate: e.target.value})}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

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
                  maxOrderLevel: 0,
                  lastPurchasedQty: 0,
                  categoryId: '',
                  supplierId: '',
                  itemType: 'inventory',
                  isPackingItem: false,
                  trackExpiry: false,
                  defaultShelfLife: 7,
                  expiryDate: '',
                  batchNumber: ''
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
            purchaseUnit: '',
            totalPrice: 0,
            supplier: '',
            notes: '',
            expiryDate: '',
            batchNumber: ''
          });
        }}
        title={`Purchase: ${purchasingItem?.name}`}
      >
        <form onSubmit={handlePurchaseSubmit} className="space-y-4">
          <div className="p-3 bg-slate-800 rounded">
            <div className="text-sm text-slate-400">Current Stock</div>
            <div className="text-lg font-semibold">{formatQuantity(purchasingItem?.quantity)} {purchasingItem?.unit}</div>
          </div>

          {/* Purchase Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Purchase Unit</label>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
              value={purchaseFormData.purchaseUnit}
              onChange={(e) => {
                const newPurchaseUnit = e.target.value;
                setPurchaseFormData({
                  ...purchaseFormData, 
                  purchaseUnit: newPurchaseUnit,
                  // Reset quantities when unit changes
                  quantity: 0,
                  totalPrice: 0,
                  unitPrice: 0
                });
              }}
              required
            >
              <option value="">Select Purchase Unit</option>
              {purchasingItem && Object.entries(getPurchaseUnitsForBaseUnit(purchasingItem.unit)).map(([key, unit]) => (
                <option key={key} value={key}>{unit.label}</option>
              ))}
            </select>
            {purchaseFormData.purchaseUnit && (
              <div className="text-xs text-slate-400 mt-1">
                This unit will be converted to {purchasingItem?.unit} for inventory tracking
              </div>
            )}
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
                onChange={(e) => {
                  const newQuantity = parseInventoryNumber(e.target.value);
                  setPurchaseFormData({...purchaseFormData, quantity: newQuantity});
                }}
              />
              {purchaseFormData.purchaseUnit && purchaseFormData.quantity > 0 && (
                <div className="text-xs text-green-400 mt-1">
                  {getConversionDisplay(purchaseFormData.purchaseUnit, purchasingItem?.unit, purchaseFormData.quantity)?.conversionText}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Total Price (LKR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
                value={purchaseFormData.totalPrice}
                onChange={(e) => {
                  const newTotalPrice = parseInventoryNumber(e.target.value, 2);
                  setPurchaseFormData({...purchaseFormData, totalPrice: newTotalPrice});
                }}
              />
              <div className="text-xs text-slate-400 mt-1">
                Total cost for {purchaseFormData.quantity} {purchaseFormData.purchaseUnit ? getPurchaseUnitsForBaseUnit(purchasingItem?.unit)?.[purchaseFormData.purchaseUnit]?.label : 'units'}
              </div>
            </div>
          </div>

          {/* Calculated Unit Price Display */}
          {purchaseFormData.quantity > 0 && purchaseFormData.totalPrice > 0 && purchaseFormData.purchaseUnit && (
            <div className="p-3 bg-blue-600/10 border border-blue-600/20 rounded">
              <div className="text-sm text-slate-400 mb-2">Price Calculation</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Price per {getPurchaseUnitsForBaseUnit(purchasingItem?.unit)?.[purchaseFormData.purchaseUnit]?.label}:</span>
                  <div className="font-medium">LKR {formatPrice(purchaseFormData.totalPrice / purchaseFormData.quantity)}</div>
                </div>
                <div>
                  <span className="text-slate-400">Price per {purchasingItem?.unit}:</span>
                  <div className="font-medium text-blue-400">
                    LKR {(() => {
                      try {
                        const conversion = convertPurchaseToBaseUnit(
                          purchaseFormData.quantity,
                          purchaseFormData.totalPrice,
                          purchaseFormData.purchaseUnit,
                          purchasingItem?.unit
                        );
                        return formatPrice(conversion.baseUnitPrice);
                      } catch (error) {
                        return '0.00';
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

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

          {/* Expiry Date Section */}
          <div className="p-3 bg-slate-800 rounded border border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Batch Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Expiry Date</label>
                <input
                  type="date"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                  value={purchaseFormData.expiryDate}
                  onChange={(e) => setPurchaseFormData({...purchaseFormData, expiryDate: e.target.value})}
                />
                {purchasingItem?.defaultShelfLife && (
                  <div className="text-xs text-slate-400 mt-1">
                    Default shelf life: {purchasingItem.defaultShelfLife} days
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Batch Number (Optional)</label>
                <input
                  type="text"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2"
                  placeholder="Auto-generated if empty"
                  value={purchaseFormData.batchNumber}
                  onChange={(e) => setPurchaseFormData({...purchaseFormData, batchNumber: e.target.value})}
                />
              </div>
            </div>
          </div>

          {purchaseFormData.totalPrice > 0 && (
            <div className="p-3 bg-primary-600/10 border border-primary-600/20 rounded">
              <div className="text-sm text-slate-400">Total Purchase Cost</div>
              <div className="text-xl font-bold text-primary">
                LKR {formatPrice(purchaseFormData.totalPrice)}
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
                  purchaseUnit: '',
                  totalPrice: 0,
                  supplier: '',
                  notes: '',
                  expiryDate: '',
                  batchNumber: ''
                });
              }}
              className="px-4 py-2 border border-slate-600 rounded text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={!purchaseFormData.quantity || !purchaseFormData.totalPrice || !purchaseFormData.purchaseUnit}
            >
              Record Purchase
            </button>
          </div>
        </form>
      </Modal>

      {/* Batch View Modal */}
      <Modal 
        isOpen={showBatchModal} 
        onClose={() => {
          setShowBatchModal(false);
          setSelectedItemBatches([]);
        }}
        title="Batch Information"
      >
        <div className="space-y-4">
          {selectedItemBatches.length > 0 ? (
            <>
              <div className="text-sm text-slate-400 mb-4">
                Showing {selectedItemBatches.length} active batches (FIFO order)
              </div>
              
              <div className="space-y-3">
                {selectedItemBatches.map((batch, index) => {
                  const daysUntilExpiry = Math.ceil((new Date(batch.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  const isExpired = daysUntilExpiry <= 0;
                  const isNearExpiry = daysUntilExpiry > 0 && daysUntilExpiry <= 7;
                  
                  return (
                    <div 
                      key={batch._id} 
                      className={`p-3 rounded border ${
                        isExpired ? 'bg-red-500/10 border-red-500/20' :
                        isNearExpiry ? 'bg-yellow-500/10 border-yellow-500/20' :
                        'bg-slate-800 border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">#{index + 1}</span>
                            <span className="text-sm text-slate-400">Batch: {batch.batchNumber}</span>
                            {isExpired && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">EXPIRED</span>}
                            {isNearExpiry && <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">NEAR EXPIRY</span>}
                          </div>
                          
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-400">Quantity:</span>
                              <span className="ml-1 font-medium">{formatQuantity(batch.quantity)} {batch.itemId?.unit || 'units'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Purchase Date:</span>
                              <span className="ml-1">{new Date(batch.purchaseDate).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Expiry Date:</span>
                              <span className={`ml-1 ${isExpired ? 'text-red-400' : isNearExpiry ? 'text-yellow-400' : ''}`}>
                                {new Date(batch.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400">Unit Price:</span>
                              <span className="ml-1">LKR {formatPrice(batch.unitPrice)}</span>
                            </div>
                          </div>
                          
                          {batch.supplierId && (
                            <div className="mt-2 text-sm">
                              <span className="text-slate-400">Supplier:</span>
                              <span className="ml-1">{batch.supplierId.name}</span>
                            </div>
                          )}
                          
                          {batch.notes && (
                            <div className="mt-2 text-sm">
                              <span className="text-slate-400">Notes:</span>
                              <span className="ml-1 text-slate-300">{batch.notes}</span>
                            </div>
                          )}
                          
                          <div className="mt-2 text-xs text-slate-500">
                            {isExpired ? 
                              `Expired ${Math.abs(daysUntilExpiry)} days ago` :
                              `${daysUntilExpiry} days until expiry`
                            }
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">
                            LKR {formatPrice(safeMultiply(batch.quantity, batch.unitPrice))}
                          </div>
                          <div className="text-xs text-slate-400">Total Value</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 p-3 bg-slate-800 rounded">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Total Quantity:</span>
                    <div className="font-medium">{formatQuantity(selectedItemBatches.reduce((sum, b) => sum + b.quantity, 0))} units</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Value:</span>
                    <div className="font-medium text-green-400">
                      LKR {formatPrice(selectedItemBatches.reduce((sum, b) => safeMultiply(sum, safeMultiply(b.quantity, b.unitPrice)), 0))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Avg. Price:</span>
                    <div className="font-medium">
                      LKR {formatPrice(selectedItemBatches.reduce((sum, b) => sum + safeMultiply(b.quantity, b.unitPrice), 0) / 
                            selectedItemBatches.reduce((sum, b) => sum + b.quantity, 0))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-slate-400">No active batches found for this item</div>
              <div className="text-sm text-slate-500 mt-2">
                Enable expiry tracking and make a purchase to create batches
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
