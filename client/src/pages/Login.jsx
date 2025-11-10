import { useState } from 'react';
import { Coffee } from 'lucide-react';
import useStore from '../store/useStore';

const Login = () => {
  const { login, loading, error } = useStore();

  const handleLogin = async (role) => {
    const credentials = {
      admin: { email: 'admin@caisse.com', password: 'admin123' },
      cashier: { email: 'cashier@caisse.com', password: 'cashier123' },
      kitchen: { email: 'kitchen@caisse.com', password: 'kitchen123' }
    };
    await login(credentials[role].email, credentials[role].password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <Coffee size={40} className="text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Caisse Manager Pro</h1>
          <p className="text-primary-100">Smart POS System for Restaurants</p>
        </div>

        {/* Login Options */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Choose Your Role</h2>
          <p className="text-gray-600 text-center mb-8">Select your role to access the system</p>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => handleLogin('admin')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-lg">👑 Admin</div>
                  <div className="text-xs opacity-90">Full system access</div>
                </div>
                <div className="text-2xl">→</div>
              </div>
            </button>

            <button
              onClick={() => handleLogin('cashier')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-lg">💰 Cashier</div>
                  <div className="text-xs opacity-90">POS & order management</div>
                </div>
                <div className="text-2xl">→</div>
              </div>
            </button>

            <button
              onClick={() => handleLogin('kitchen')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-lg">👨‍🍳 Kitchen</div>
                  <div className="text-xs opacity-90">View & manage orders</div>
                </div>
                <div className="text-2xl">→</div>
              </div>
            </button>
          </div>

          {loading && (
            <div className="mt-4 text-center text-gray-600 text-sm">
              Signing in...
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-primary-100 text-sm mt-6">
          © 2024 Caisse Manager Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
