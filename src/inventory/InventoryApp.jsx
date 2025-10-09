import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import StockRequests from './pages/StockRequests';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Layout from './components/Layout';
import './index.css';
import { DomainProvider } from './context/DomainContext';
import { Toaster } from 'react-hot-toast';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import SupplierPayments from './pages/SupplierPayments';
import Transactions from './pages/Transactions';
import Staff from './pages/Staff';
import Usage from './pages/Usage';
import MenuManagement from './pages/MenuManagement';
import OldKitchenDashboard from './pages/KitchenDashboard';
import MenuAnalytics from './pages/MenuAnalytics';
import CashierDashboard from './components/CashierDashboard';
import NewKitchenDashboard from './components/KitchenDashboard';
import WaiterDashboard from './components/WaiterDashboard';
import OrderAnalytics from './components/OrderAnalytics';
import WastageManagement from './components/WastageManagement';
import OutOfStockManagement from './components/OutOfStockManagement';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import { withRoleProtection } from './utils/roleProtection.jsx';

// Protected components with role restrictions
const ProtectedDashboard = withRoleProtection(Dashboard, ['admin', 'accountant']);
const ProtectedInventory = withRoleProtection(Inventory, ['admin', 'accountant']);
const ProtectedReports = withRoleProtection(Reports, ['admin', 'accountant']);
const ProtectedCategories = withRoleProtection(Categories, ['admin', 'accountant']);
const ProtectedSuppliers = withRoleProtection(Suppliers, ['admin', 'accountant']);
const ProtectedSupplierPayments = withRoleProtection(SupplierPayments, ['admin', 'accountant']);
const ProtectedTransactions = withRoleProtection(Transactions, ['admin', 'accountant']);
const ProtectedStaff = withRoleProtection(Staff, ['admin']);
const ProtectedMenuManagement = withRoleProtection(MenuManagement, ['admin', 'accountant']);
const ProtectedOldKitchenDashboard = withRoleProtection(OldKitchenDashboard, ['admin', 'accountant', 'kitchen']);
const ProtectedMenuAnalytics = withRoleProtection(MenuAnalytics, ['admin', 'accountant']);

// New Order Management Dashboards
const ProtectedCashierDashboard = withRoleProtection(CashierDashboard, ['admin', 'cashier']);
const ProtectedKitchenOrderDashboard = withRoleProtection(NewKitchenDashboard, ['admin', 'kitchen']);
const ProtectedWaiterDashboard = withRoleProtection(WaiterDashboard, ['admin', 'waiter']);
const ProtectedOrderAnalytics = withRoleProtection(OrderAnalytics, ['admin']);

// New Wastage and Stock Management
const ProtectedWastageManagement = withRoleProtection(WastageManagement, ['admin', 'cashier']);
const ProtectedOutOfStockManagement = withRoleProtection(OutOfStockManagement, ['admin', 'cashier']);

function InventoryApp() {
  const isAuthed = Boolean(localStorage.getItem('token'));
  
  return (
    <DomainProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f1f5f9',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f1f5f9',
            },
          },
        }}
      />
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          path="/*"
          element={
            isAuthed ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<RoleBasedRedirect />} />
                  <Route path="dashboard" element={<ProtectedDashboard />} />
                  <Route path="inventory" element={<ProtectedInventory />} />
                  <Route path="requests" element={<StockRequests />} />
                  <Route path="usage" element={<Usage />} />
                  <Route path="reports" element={<ProtectedReports />} />
                  <Route path="categories" element={<ProtectedCategories />} />
                  <Route path="suppliers" element={<ProtectedSuppliers />} />
                  <Route path="supplier-payments" element={<ProtectedSupplierPayments />} />
                  <Route path="transactions" element={<ProtectedTransactions />} />
                  <Route path="staff" element={<ProtectedStaff />} />
                  <Route path="menu-management" element={<ProtectedMenuManagement />} />
                  <Route path="kitchen-dashboard" element={<ProtectedOldKitchenDashboard />} />
                  <Route path="menu-analytics" element={<ProtectedMenuAnalytics />} />
                  
                  {/* New Order Management Dashboards */}
                  <Route path="cashier-dashboard" element={<ProtectedCashierDashboard />} />
                  <Route path="kitchen-orders" element={<ProtectedKitchenOrderDashboard />} />
                  <Route path="waiter-dashboard" element={<ProtectedWaiterDashboard />} />
                  <Route path="order-analytics" element={<ProtectedOrderAnalytics />} />
                  
                  {/* New Wastage and Stock Management */}
                  <Route path="wastage-management" element={<ProtectedWastageManagement />} />
                  <Route path="out-of-stock" element={<ProtectedOutOfStockManagement />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="login" replace />
            )
          }
        />
        <Route path="*" element={<div className="p-6">Not Found</div>} />
      </Routes>
    </DomainProvider>
  );
}

export default InventoryApp;