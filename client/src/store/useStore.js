import { create } from 'zustand';
import axios from 'axios';

const API_URL = '/api';

// Configure axios defaults
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const useStore = create((set, get) => ({
  // Auth state
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  // Settings state
  settings: null,
  darkMode: localStorage.getItem('darkMode') === 'true',

  // Data state
  menuItems: [],
  orders: [],
  inventory: [],
  users: [],

  // UI state
  loading: false,
  error: null,

  // Auth actions
  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({ token, user, isAuthenticated: true, loading: false });
      
      // Fetch initial data
      get().fetchSettings();
      get().fetchMenuItems();
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        loading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      menuItems: [],
      orders: [],
      inventory: []
    });
  },

  fetchCurrentUser: async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      set({ user: response.data });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      get().logout();
    }
  },

  // Settings actions
  fetchSettings: async () => {
    try {
      const response = await axios.get(`${API_URL}/settings`);
      set({ settings: response.data });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  },

  updateSettings: async (data) => {
    try {
      const response = await axios.put(`${API_URL}/settings`, data);
      set({ settings: response.data });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update settings' });
      return false;
    }
  },

  toggleDarkMode: () => {
    const newMode = !get().darkMode;
    localStorage.setItem('darkMode', newMode);
    set({ darkMode: newMode });
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  // Menu actions
  fetchMenuItems: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`${API_URL}/menu?${params}`);
      set({ menuItems: response.data });
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
  },

  createMenuItem: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/menu`, data);
      set({ menuItems: [...get().menuItems, response.data] });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create menu item' });
      return null;
    }
  },

  updateMenuItem: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/menu/${id}`, data);
      set({ 
        menuItems: get().menuItems.map(item => 
          item._id === id ? response.data : item
        )
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update menu item' });
      return null;
    }
  },

  deleteMenuItem: async (id) => {
    try {
      await axios.delete(`${API_URL}/menu/${id}`);
      set({ menuItems: get().menuItems.filter(item => item._id !== id) });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete menu item' });
      return false;
    }
  },

  // Order actions
  fetchOrders: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`${API_URL}/orders?${params}`);
      set({ orders: response.data });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  },

  createOrder: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, data);
      set({ orders: [response.data, ...get().orders] });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create order' });
      return null;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const response = await axios.patch(`${API_URL}/orders/${id}/status`, { status });
      set({ 
        orders: get().orders.map(order => 
          order._id === id ? response.data : order
        )
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update order' });
      return null;
    }
  },

  processPayment: async (orderId, paymentData) => {
    try {
      const response = await axios.post(`${API_URL}/payments/${orderId}`, paymentData);
      set({ 
        orders: get().orders.map(order => 
          order._id === orderId ? response.data.order : order
        )
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to process payment' });
      return null;
    }
  },

  // Inventory actions
  fetchInventory: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`${API_URL}/inventory?${params}`);
      set({ inventory: response.data });
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  },

  createIngredient: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/inventory`, data);
      set({ inventory: [...get().inventory, response.data] });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create ingredient' });
      return null;
    }
  },

  updateIngredient: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/inventory/${id}`, data);
      set({ 
        inventory: get().inventory.map(item => 
          item._id === id ? response.data : item
        )
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update ingredient' });
      return null;
    }
  },

  restockIngredient: async (id, quantity) => {
    try {
      const response = await axios.patch(`${API_URL}/inventory/${id}/restock`, { quantity });
      set({ 
        inventory: get().inventory.map(item => 
          item._id === id ? response.data : item
        )
      });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to restock ingredient' });
      return null;
    }
  },

  // User management
  fetchUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      set({ users: response.data });
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  },

  clearError: () => set({ error: null })
}));

export default useStore;
