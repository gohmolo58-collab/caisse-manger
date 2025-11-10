import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useStore from './store/useStore';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';

// Layout
import Layout from './components/Layout';

function App() {
  const { isAuthenticated, darkMode, fetchCurrentUser } = useStore();

  useEffect(() => {
    // Apply dark mode on mount
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }

    // Fetch current user if authenticated
    if (isAuthenticated) {
      fetchCurrentUser();
    }
  }, []);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
