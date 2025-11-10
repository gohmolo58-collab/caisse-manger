import { useEffect, useState } from 'react';
import { Eye, Download, Filter } from 'lucide-react';
import useStore from '../store/useStore';
import axios from 'axios';

const Orders = () => {
  const { orders, fetchOrders, updateOrderStatus, settings, user } = useStore();
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const currency = settings?.currency || 'EUR';

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
  };

  const downloadReceipt = (orderId) => {
    window.open(`/api/payments/${orderId}/receipt`, '_blank');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      preparing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      ready: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      completed: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
      cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    };
    return colors[status] || colors.pending;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      unpaid: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      refunded: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
    };
    return colors[status] || colors.unpaid;
  };

  const canChangeStatus = user?.role === 'admin' || user?.role === 'cashier' || user?.role === 'kitchen';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track all orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-400" />
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'preparing', 'ready', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  filterStatus === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map(order => (
          <div key={order._id} className="card">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Order Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-600 dark:text-primary-500">
                      {order.total.toFixed(2)} {currency}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {order.type}
                      {order.tableNumber && ` - ${order.tableNumber}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                  {order.paymentMethod && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 capitalize">
                      {order.paymentMethod}
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="font-medium mb-1">Items:</p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded">
                        {item.quantity}x {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col gap-2">
                {canChangeStatus && order.status !== 'completed' && order.status !== 'cancelled' && (
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="input text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                )}
                
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="btn-secondary flex items-center gap-2 whitespace-nowrap"
                >
                  <Eye size={16} />
                  View
                </button>
                
                {order.paymentStatus === 'paid' && (
                  <button
                    onClick={() => downloadReceipt(order._id)}
                    className="btn-primary flex items-center gap-2 whitespace-nowrap"
                  >
                    <Download size={16} />
                    Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No orders found</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Order Number</p>
                  <p className="font-semibold">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                  <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                  <p className="font-semibold capitalize">{selectedOrder.type}</p>
                </div>
                {selectedOrder.tableNumber && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Table</p>
                    <p className="font-semibold">{selectedOrder.tableNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Payment</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.quantity} × {item.price.toFixed(2)} {currency}
                        </p>
                      </div>
                      <p className="font-semibold">{item.subtotal.toFixed(2)} {currency}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-dark-700 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{selectedOrder.subtotal.toFixed(2)} {currency}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-500">
                    <span>Discount:</span>
                    <span className="font-medium">-{selectedOrder.discount.toFixed(2)} {currency}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-medium">{selectedOrder.tax.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-dark-700">
                  <span>Total:</span>
                  <span className="text-primary-600 dark:text-primary-500">{selectedOrder.total.toFixed(2)} {currency}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes</p>
                  <p className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
