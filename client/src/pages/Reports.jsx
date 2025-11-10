import { useEffect, useState } from 'react';
import { Calendar, Download, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import axios from 'axios';
import useStore from '../store/useStore';

const Reports = () => {
  const { settings } = useStore();
  const [period, setPeriod] = useState('today');
  const [salesReport, setSalesReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/reports/sales?period=${period}`);
      setSalesReport(response.data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const currency = settings?.currency || 'EUR';
  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const categoryData = salesReport?.categoryStats
    ? Object.entries(salesReport.categoryStats).map(([name, stats]) => ({
        name,
        revenue: stats.revenue,
        quantity: stats.quantity
      }))
    : [];

  const paymentMethodData = salesReport?.paymentMethods
    ? Object.entries(salesReport.paymentMethods).map(([name, stats]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: stats.revenue
      }))
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive sales insights and performance metrics</p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <Calendar size={20} className="text-gray-400" />
          <div className="flex gap-2 flex-wrap">
            {['today', 'week', 'month'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  period === p
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600'
                }`}
              >
                {p === 'today' ? 'Today' : p === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Loading report...</p>
        </div>
      ) : salesReport ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {salesReport.summary.totalRevenue.toFixed(2)} {currency}
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                <TrendingUp className="text-blue-500" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {salesReport.summary.totalOrders}
              </p>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Order Value</p>
                <TrendingUp className="text-primary-500" size={20} />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {salesReport.summary.averageOrderValue.toFixed(2)} {currency}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sales by Category */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Payment Methods Distribution</h3>
              {paymentMethodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
            {salesReport.topItems && salesReport.topItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-dark-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Item</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Quantity Sold</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesReport.topItems.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-dark-700">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            index === 1 ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400' :
                            index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                            'bg-gray-50 dark:bg-dark-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="py-3 px-4">{item.quantity}</td>
                        <td className="py-3 px-4 font-semibold text-primary-600 dark:text-primary-500">
                          {item.revenue.toFixed(2)} {currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No sales data available</p>
            )}
          </div>

          {/* Category Details */}
          {categoryData.length > 0 && (
            <div className="card mt-6">
              <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryData.map((cat, index) => (
                  <div key={cat.name} className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{cat.name}</h4>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                    </div>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-500 mb-1">
                      {cat.revenue.toFixed(2)} {currency}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {cat.quantity} items sold
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No report data available</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
