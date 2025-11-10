import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  TrendingUp,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import useStore from '../store/useStore';

const Dashboard = () => {
  const { settings } = useStore();
  const [todaySummary, setTodaySummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [salesReport, setSalesReport] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch today's summary
      const summaryRes = await axios.get('/api/orders/today/summary');
      setTodaySummary(summaryRes.data);

      // Fetch revenue chart data
      const revenueRes = await axios.get('/api/reports/daily-revenue?days=7');
      setRevenueData(revenueRes.data);

      // Fetch sales report
      const reportRes = await axios.get('/api/reports/sales?period=today');
      setSalesReport(reportRes.data);

      // Fetch AI recommendations
      const aiRes = await axios.get('/api/ai/recommendations');
      setAiRecommendations(aiRes.data);

      // Fetch low stock items
      const inventoryRes = await axios.get('/api/inventory?lowStock=true');
      setLowStockItems(inventoryRes.data);

      // Fetch recent orders
      const ordersRes = await axios.get('/api/orders?status=pending');
      setRecentOrders(ordersRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const currency = settings?.currency || 'EUR';

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {todaySummary?.totalRevenue.toFixed(2) || '0.00'} {currency}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="text-primary-600 dark:text-primary-500" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-green-500">+12.5%</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">vs yesterday</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {todaySummary?.totalOrders || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-blue-600 dark:text-blue-500" size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {todaySummary?.completedOrders || 0} completed
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {todaySummary?.pendingOrders || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600 dark:text-yellow-500" size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Requires attention
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {salesReport?.summary.averageOrderValue.toFixed(2) || '0.00'} {currency}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600 dark:text-green-500" size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Per transaction
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">7-Day Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#f97316" 
                strokeWidth={3}
                dot={{ fill: '#f97316', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
          {salesReport?.categoryStats && Object.keys(salesReport.categoryStats).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={Object.entries(salesReport.categoryStats).map(([name, stats]) => ({
                    name,
                    value: stats.revenue
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.keys(salesReport.categoryStats).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              No sales data available
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Assistant */}
        {aiRecommendations && (
          <div className="card bg-gradient-to-br from-primary-50 to-orange-50 dark:from-primary-900/20 dark:to-orange-900/20 border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-primary-600 dark:text-primary-500" size={24} />
              <h3 className="text-lg font-semibold">AI Sales Assistant</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white dark:bg-dark-800 p-3 rounded-lg">
                <p className="text-sm font-medium text-primary-600 dark:text-primary-500">
                  {aiRecommendations.timeBasedSuggestion}
                </p>
              </div>

              {aiRecommendations.promotionIdeas && (
                <div>
                  <p className="text-sm font-medium mb-2">Promotion Ideas:</p>
                  <ul className="space-y-1">
                    {aiRecommendations.promotionIdeas.slice(0, 3).map((idea, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                        <span className="text-primary-600 mr-2">•</span>
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiRecommendations.trendingItems && aiRecommendations.trendingItems.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Trending Items:</p>
                  <div className="flex flex-wrap gap-2">
                    {aiRecommendations.trendingItems.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs font-medium">
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Low Stock Alert */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-red-600 dark:text-red-500" size={24} />
            <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
          </div>
          
          {lowStockItems.length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {lowStockItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Current: {item.currentStock} {item.unit}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
                    Low
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">All items are well stocked!</p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Pending Orders</h3>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Order #</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 dark:border-dark-700">
                    <td className="py-3 px-4 text-sm font-medium">{order.orderNumber}</td>
                    <td className="py-3 px-4 text-sm capitalize">{order.type}</td>
                    <td className="py-3 px-4 text-sm">{order.items.length} items</td>
                    <td className="py-3 px-4 text-sm font-medium">{order.total.toFixed(2)} {currency}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No pending orders</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
