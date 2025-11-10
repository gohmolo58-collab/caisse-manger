import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import useStore from '../store/useStore';

const Settings = () => {
  const { settings, fetchSettings, updateSettings } = useStore();
  const [formData, setFormData] = useState({
    restaurantName: '',
    currency: 'EUR',
    taxRate: 20,
    address: '',
    phone: '',
    email: '',
    theme: 'light'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setFormData({
        restaurantName: settings.restaurantName || '',
        currency: settings.currency || 'EUR',
        taxRate: settings.taxRate || 20,
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        theme: settings.theme || 'light'
      });
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const success = await updateSettings(formData);
    
    if (success) {
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Failed to save settings');
    }
    
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your restaurant settings</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restaurant Information */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Restaurant Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">Restaurant Name *</label>
                <input
                  type="text"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input"
                  placeholder="123 Main Street, City, Country"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="contact@restaurant.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Financial Settings</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Currency *</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>

                <div>
                  <label className="label">Tax Rate (%) *</label>
                  <input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                    className="input"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Note:</strong> Tax rate will be applied to all new orders. Existing orders will not be affected.
                </p>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            
            <div>
              <label className="label">Theme</label>
              <select
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="input"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                You can also toggle dark mode from the sidebar
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>

            {message && (
              <p className={`text-sm font-medium ${
                message.includes('success') 
                  ? 'text-green-600 dark:text-green-500' 
                  : 'text-red-600 dark:text-red-500'
              }`}>
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
