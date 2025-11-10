import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  ClipboardList,
  Package,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Menu as MenuIcon,
  X,
  Moon,
  Sun
} from 'lucide-react';
import useStore from '../store/useStore';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, darkMode, toggleDarkMode, settings } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'cashier', 'kitchen'] },
    { path: '/pos', icon: ShoppingCart, label: 'POS', roles: ['admin', 'cashier'] },
    { path: '/menu', icon: UtensilsCrossed, label: 'Menu', roles: ['admin', 'cashier'] },
    { path: '/orders', icon: ClipboardList, label: 'Orders', roles: ['admin', 'cashier', 'kitchen'] },
    { path: '/inventory', icon: Package, label: 'Inventory', roles: ['admin', 'cashier'] },
    { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'cashier'] },
    { path: '/users', icon: Users, label: 'Users', roles: ['admin'] },
    { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-dark-700">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-500">
              {settings?.restaurantName || 'Caisse Manager'}
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
          >
            {sidebarOpen ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-500 border-r-4 border-primary-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 dark:border-dark-700 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={toggleDarkMode}
              className="flex-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
