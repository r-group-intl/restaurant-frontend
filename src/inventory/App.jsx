import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import StockRequests from './pages/StockRequests';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Layout from './components/Layout';
import './index.css';
import { DomainProvider } from './context/DomainContext';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import SupplierPayments from './pages/SupplierPayments';
import Transactions from './pages/Transactions';
import Staff from './pages/Staff';
import Usage from './pages/Usage';
import MenuManagement from './pages/MenuManagement';
import KitchenDashboard from './pages/KitchenDashboard';
import MenuAnalytics from './pages/MenuAnalytics';
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
const ProtectedKitchenDashboard = withRoleProtection(KitchenDashboard, ['admin', 'accountant', 'kitchen']);
const ProtectedMenuAnalytics = withRoleProtection(MenuAnalytics, ['admin', 'accountant']);

function App() {
  const isAuthed = Boolean(localStorage.getItem('token'));
  return (
    <BrowserRouter>
      <DomainProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              isAuthed ? (
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/usage" replace />} />
                    <Route path="/dashboard" element={<ProtectedDashboard />} />
                    <Route path="/inventory" element={<ProtectedInventory />} />
                    <Route path="/requests" element={<StockRequests />} />
                    <Route path="/usage" element={<Usage />} />
                    <Route path="/reports" element={<ProtectedReports />} />
                    <Route path="/categories" element={<ProtectedCategories />} />
                    <Route path="/suppliers" element={<ProtectedSuppliers />} />
                    <Route path="/supplier-payments" element={<ProtectedSupplierPayments />} />
                    <Route path="/transactions" element={<ProtectedTransactions />} />
                    <Route path="/staff" element={<ProtectedStaff />} />
                    <Route path="/menu-management" element={<ProtectedMenuManagement />} />
                    <Route path="/kitchen-dashboard" element={<ProtectedKitchenDashboard />} />
                    <Route path="/menu-analytics" element={<ProtectedMenuAnalytics />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<div className="p-6">Not Found</div>} />
        </Routes>
      </DomainProvider>
    </BrowserRouter>
  );
}

export default App
