import { useEffect, useState } from 'react';
import { Plus, Minus, Trash2, Search, CreditCard, Banknote, Smartphone, X } from 'lucide-react';
import useStore from '../store/useStore';
import axios from 'axios';

const POS = () => {
  const { menuItems, fetchMenuItems, settings } = useStore();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderType, setOrderType] = useState('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const currency = settings?.currency || 'EUR';
  const taxRate = settings?.taxRate || 20;

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item._id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item._id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setTableNumber('');
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = discount;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const tax = (subtotalAfterDiscount * taxRate) / 100;
    const total = subtotalAfterDiscount + tax;
    return { subtotal, discountAmount, tax, total };
  };

  const { subtotal, discountAmount, tax, total } = calculateTotals();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPayment(true);
    if (paymentMethod === 'cash') {
      setAmountPaid(total.toFixed(2));
    }
  };

  const processPayment = async () => {
    if (processing) return;
    
    setProcessing(true);
    try {
      // Create order
      const orderData = {
        type: orderType,
        tableNumber: orderType === 'dine-in' ? tableNumber : '',
        items: cart.map(item => ({
          menuItem: item._id,
          quantity: item.quantity
        })),
        discount: discountAmount,
        notes: ''
      };

      const orderResponse = await axios.post('/api/orders', orderData);
      const order = orderResponse.data;

      // Process payment
      const paymentData = {
        paymentMethod,
        amountPaid: parseFloat(amountPaid) || total
      };

      const paymentResponse = await axios.post(`/api/payments/${order._id}`, paymentData);
      
      // Download receipt
      const receiptUrl = `/api/payments/${order._id}/receipt`;
      window.open(receiptUrl, '_blank');

      // Show success and reset
      alert(`Payment successful! Change: ${paymentResponse.data.change.toFixed(2)} ${currency}`);
      clearCart();
      setShowPayment(false);
      setAmountPaid('');
    } catch (error) {
      alert('Payment failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="flex gap-6 h-full">
        {/* Left: Menu Items */}
        <div className="flex-1 flex flex-col">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Point of Sale</h1>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <button
                  key={item._id}
                  onClick={() => addToCart(item)}
                  className="card hover:shadow-lg transition-shadow cursor-pointer text-left p-4"
                >
                  <div className="aspect-square bg-gray-100 dark:bg-dark-700 rounded-lg mb-3 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-4xl">🍽️</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">{item.description}</p>
                  <p className="text-lg font-bold text-primary-600 dark:text-primary-500">
                    {item.price.toFixed(2)} {currency}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="w-96 flex flex-col card">
          <h2 className="text-xl font-bold mb-4">Current Order</h2>

          {/* Order Type */}
          <div className="mb-4">
            <label className="label">Order Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['dine-in', 'takeout', 'delivery'].map(type => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                    orderType === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {orderType === 'dine-in' && (
            <div className="mb-4">
              <label className="label">Table Number</label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="input"
                placeholder="e.g., T-12"
              />
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p>Cart is empty</p>
                <p className="text-sm mt-2">Add items from the menu</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.price.toFixed(2)} {currency} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item._id, -1)}
                      className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-dark-600 hover:bg-gray-300 dark:hover:bg-dark-500 flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, 1)}
                      className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-dark-600 hover:bg-gray-300 dark:hover:bg-dark-500 flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Discount */}
          <div className="mb-4">
            <label className="label">Discount ({currency})</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="input"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          {/* Totals */}
          <div className="space-y-2 mb-4 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">{subtotal.toFixed(2)} {currency}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600 dark:text-green-500">
                <span>Discount:</span>
                <span className="font-medium">-{discountAmount.toFixed(2)} {currency}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Tax ({taxRate}%):</span>
              <span className="font-medium">{tax.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-dark-600">
              <span>Total:</span>
              <span className="text-primary-600 dark:text-primary-500">{total.toFixed(2)} {currency}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={clearCart}
              className="flex-1 btn-secondary"
              disabled={cart.length === 0}
            >
              Clear
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 btn-primary"
              disabled={cart.length === 0}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Payment</h2>
              <button onClick={() => setShowPayment(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-3xl font-bold text-center text-primary-600 dark:text-primary-500">
                {total.toFixed(2)} {currency}
              </p>
            </div>

            <div className="mb-6">
              <label className="label">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-dark-600'
                  }`}
                >
                  <Banknote className="mx-auto mb-2" size={24} />
                  <p className="text-sm font-medium">Cash</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-dark-600'
                  }`}
                >
                  <CreditCard className="mx-auto mb-2" size={24} />
                  <p className="text-sm font-medium">Card</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('digital-wallet')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'digital-wallet'
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-dark-600'
                  }`}
                >
                  <Smartphone className="mx-auto mb-2" size={24} />
                  <p className="text-sm font-medium">Wallet</p>
                </button>
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div className="mb-6">
                <label className="label">Amount Paid</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="input text-lg"
                  placeholder="0.00"
                  step="0.01"
                  min={total}
                />
                {parseFloat(amountPaid) >= total && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-500">
                    Change: {(parseFloat(amountPaid) - total).toFixed(2)} {currency}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={processPayment}
              disabled={processing || (paymentMethod === 'cash' && parseFloat(amountPaid) < total)}
              className="w-full btn-primary py-3 text-lg"
            >
              {processing ? 'Processing...' : 'Complete Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
