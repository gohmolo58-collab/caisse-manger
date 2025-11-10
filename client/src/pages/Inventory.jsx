import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package, AlertTriangle, X } from 'lucide-react';
import useStore from '../store/useStore';

const Inventory = () => {
  const { inventory, fetchInventory, createIngredient, updateIngredient, restockIngredient } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [restockingItem, setRestockingItem] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    unit: 'kg',
    currentStock: '',
    minStock: '',
    cost: '',
    supplier: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      currentStock: parseFloat(formData.currentStock),
      minStock: parseFloat(formData.minStock),
      cost: parseFloat(formData.cost) || 0
    };

    if (editingItem) {
      await updateIngredient(editingItem._id, data);
    } else {
      await createIngredient(data);
    }

    setShowModal(false);
    resetForm();
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    await restockIngredient(restockingItem._id, parseFloat(restockQuantity));
    setShowRestockModal(false);
    setRestockingItem(null);
    setRestockQuantity('');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      unit: item.unit,
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      cost: item.cost.toString(),
      supplier: item.supplier
    });
    setShowModal(true);
  };

  const openRestockModal = (item) => {
    setRestockingItem(item);
    setRestockQuantity('');
    setShowRestockModal(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      unit: 'kg',
      currentStock: '',
      minStock: '',
      cost: '',
      supplier: ''
    });
  };

  const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Control</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage ingredient stock levels</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Ingredient
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="text-red-600 dark:text-red-500" size={24} />
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              {lowStockItems.length} Item{lowStockItems.length > 1 ? 's' : ''} Low on Stock
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map(item => (
              <span key={item._id} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
                {item.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-dark-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Ingredient</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Current Stock</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Min Stock</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Unit</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Cost</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Supplier</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => {
              const isLowStock = item.currentStock <= item.minStock;
              return (
                <tr key={item._id} className="border-b border-gray-100 dark:border-dark-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Package size={18} className="text-gray-400" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={isLowStock ? 'text-red-600 dark:text-red-500 font-semibold' : ''}>
                      {item.currentStock}
                    </span>
                  </td>
                  <td className="py-3 px-4">{item.minStock}</td>
                  <td className="py-3 px-4">{item.unit}</td>
                  <td className="py-3 px-4">{item.cost.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{item.supplier || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isLowStock
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {isLowStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openRestockModal(item)}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 text-sm font-medium"
                      >
                        Restock
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {inventory.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No inventory items found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingItem ? 'Edit Ingredient' : 'Add Ingredient'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="l">Liter (l)</option>
                    <option value="ml">Milliliter (ml)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="units">Units</option>
                  </select>
                </div>

                <div>
                  <label className="label">Cost</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="input"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Current Stock *</label>
                  <input
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    className="input"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="label">Min Stock *</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="input"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && restockingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Restock Ingredient</h2>
              <button onClick={() => setShowRestockModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Ingredient: <span className="font-semibold text-gray-900 dark:text-white">{restockingItem.name}</span></p>
              <p className="text-gray-600 dark:text-gray-400">Current Stock: <span className="font-semibold text-gray-900 dark:text-white">{restockingItem.currentStock} {restockingItem.unit}</span></p>
            </div>

            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <label className="label">Quantity to Add ({restockingItem.unit}) *</label>
                <input
                  type="number"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  className="input"
                  step="0.01"
                  min="0.01"
                  required
                  autoFocus
                />
              </div>

              {restockQuantity && (
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">New Stock Level:</p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-500">
                    {(restockingItem.currentStock + parseFloat(restockQuantity)).toFixed(2)} {restockingItem.unit}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
