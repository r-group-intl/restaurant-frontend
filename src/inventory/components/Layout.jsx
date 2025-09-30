import { NavLink } from 'react-router-dom';
import { useDomain } from '../context/DomainContext';
import { useAuth } from '../hooks/useAuth';
import RoleGuard from './RoleGuard';
import {
  HomeModernIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  TagIcon,
  TruckIcon,
  BanknotesIcon,
  CurrencyRupeeIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  WrenchScrewdriverIcon,
  BookOpenIcon,
  BeakerIcon,
  PresentationChartLineIcon,
  ComputerDesktopIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

const SidebarItem = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-red-600 text-white shadow-lg' 
          : 'text-slate-300 hover:text-white hover:bg-slate-700'
      }`
    }
  >
    {icon && <span className="mr-3 flex-shrink-0">{icon}</span>}
    <span className="truncate">{label}</span>
  </NavLink>
);

export default function Layout({ children }) {
  const { domain, setDomain } = useDomain();
  const { user } = useAuth();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };
  
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-400';
      case 'accountant': return 'text-blue-400';
      case 'kitchen': return 'text-green-400';
      case 'cashier': return 'text-purple-400';
      case 'waiter': return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };
  
  return (
    <div className="inventory-app flex h-screen bg-slate-900">
      {/* Sidebar */}
      <div className="inventory-sidebar">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-red-400">RIMS</h1>
            <div className="text-xs text-slate-400">v2.0</div>
          </div>
          <div className="mt-2">
            <select
              className="form-select text-sm"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            >
              <option value="office">Office Inventory</option>
              <option value="restaurant">Restaurant Inventory</option>
            </select>
          </div>
        </div>

        {/* Navigation - Now Scrollable */}
        <nav className="inventory-sidebar-nav p-4 space-y-2">
          {/* Role-specific navigation */}
          {user?.role === 'kitchen' ? (
            <>
              <SidebarItem to="kitchen-orders" label="Kitchen Orders" icon={<BeakerIcon className="w-5 h-5" />} />
              <SidebarItem to="kitchen-dashboard" label="Menu Preparation" icon={<ClipboardDocumentCheckIcon className="w-5 h-5" />} />
              <SidebarItem to="usage" label="Kitchen Usage" icon={<WrenchScrewdriverIcon className="w-5 h-5" />} />
              <SidebarItem to="requests" label="Stock Requests" icon={<ClipboardDocumentListIcon className="w-5 h-5" />} />
            </>
          ) : user?.role === 'cashier' ? (
            <>
              <SidebarItem to="cashier-dashboard" label="Cashier Dashboard" icon={<ComputerDesktopIcon className="w-5 h-5" />} />
            </>
          ) : user?.role === 'waiter' ? (
            <>
              <SidebarItem to="waiter-dashboard" label="Waiter Dashboard" icon={<ClipboardDocumentCheckIcon className="w-5 h-5" />} />
            </>
          ) : (
            <>
              <SidebarItem to="dashboard" label="Dashboard" icon={<ChartBarIcon className="w-5 h-5" />} />
              <SidebarItem to="inventory" label="Inventory" icon={<CubeIcon className="w-5 h-5" />} />
              
              {/* Kitchen Staff specific features */}
              <RoleGuard allowedRoles={['kitchen', 'admin', 'accountant']}>
                <SidebarItem to="kitchen-dashboard" label="Kitchen Dashboard" icon={<BeakerIcon className="w-5 h-5" />} />
                <SidebarItem to="usage" label="Kitchen Usage" icon={<WrenchScrewdriverIcon className="w-5 h-5" />} />
                <SidebarItem to="requests" label="Stock Requests" icon={<ClipboardDocumentListIcon className="w-5 h-5" />} />
              </RoleGuard>
              
              {/* Admin/Accountant only features */}
              <RoleGuard allowedRoles={['admin', 'accountant']}>
                <SidebarItem to="reports" label="Reports & Analytics" icon={<ChartBarIcon className="w-5 h-5" />} />
                
                {domain === 'restaurant' && (
                  <>
                    <div className="pt-4 pb-2">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Order Management
                      </div>
                    </div>
                    <SidebarItem to="cashier-dashboard" label="Cashier Dashboard" icon={<ComputerDesktopIcon className="w-5 h-5" />} />
                    <SidebarItem to="kitchen-orders" label="Kitchen Orders" icon={<BeakerIcon className="w-5 h-5" />} />
                    <SidebarItem to="waiter-dashboard" label="Waiter Dashboard" icon={<ClipboardDocumentCheckIcon className="w-5 h-5" />} />
                    <SidebarItem to="order-analytics" label="Order Analytics" icon={<PresentationChartLineIcon className="w-5 h-5" />} />
                    
                    <div className="pt-4 pb-2">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Restaurant Management
                      </div>
                    </div>
                    <SidebarItem to="menu-management" label="Menu & Recipes" icon={<BookOpenIcon className="w-5 h-5" />} />
                    <SidebarItem to="menu-analytics" label="Menu Analytics" icon={<PresentationChartLineIcon className="w-5 h-5" />} />
                    <SidebarItem to="categories" label="Categories" icon={<TagIcon className="w-5 h-5" />} />
                    <SidebarItem to="suppliers" label="Suppliers" icon={<TruckIcon className="w-5 h-5" />} />
                    <SidebarItem to="supplier-payments" label="Supplier Payments" icon={<BanknotesIcon className="w-5 h-5" />} />
                  </>
                )}
                
                <div className="pt-4 pb-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Operations
                  </div>
                </div>
                <SidebarItem to="transactions" label="All Transactions" icon={<BanknotesIcon className="w-5 h-5" />} />
              </RoleGuard>
              
              {/* Admin only features */}
              <RoleGuard allowedRoles={['admin']}>
                <SidebarItem to="staff" label="Staff Management" icon={<UsersIcon className="w-5 h-5" />} />
              </RoleGuard>
            </>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-700 flex-shrink-0">
          <div className="text-xs text-slate-400">
            <div>Sri Lanka • LKR</div>
            <div className="mt-1">
              Logged in as{' '}
              <span className={`font-medium ${getRoleColor(user?.role)}`}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
            </div>
            <div className="mt-1 text-slate-500">{user?.name}</div>
            <button 
              onClick={handleLogout}
              className="mt-2 inline-flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="inventory-main">
        {/* Top Bar */}
        <header className="inventory-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-lg font-semibold text-white capitalize">
              {domain} Inventory Management
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2 sm:gap-0">
              <div className="text-sm text-slate-400">
                {new Date().toLocaleDateString('en-LK', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{user?.name}</div>
                  <div className={`text-xs ${getRoleColor(user?.role)}`}>
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </div>
                </div>
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="inventory-content">
          {children}
        </main>
      </div>
    </div>
  );
}
