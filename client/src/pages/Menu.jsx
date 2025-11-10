import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import useStore from '../store/useStore';

const Menu = () => {
  const { menuItems, fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Beverages',
    price: '',
    description: '',
    image: '',
    available: true
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const categories = ['All', 'Beverages', 'Food', 'Pastries', 'Desserts', 'Appetizers', 'Main Course', 'Other'];
  const currency = settings?.currency || 'EUR';

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price)
    };

    if (editingItem) {
      await updateMenuItem(editingItem.id || editingItem._id, data);
    } else {
      await createMenuItem(data);
    }

    setShowModal(false);
    resetForm();
    fetchMenuItems(); // Refresh the list
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description,
      image: item.image || '',
      available: item.available
    });
    setImagePreview(item.image || '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteMenuItem(id);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setImagePreview('');
    setFormData({
      name: '',
      category: 'Beverages',
      price: '',
      description: '',
      image: '',
      available: true
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your restaurant menu items</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input md:w-48"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <div key={item.id || item._id} className="card">
            <div className="aspect-square bg-gray-100 dark:bg-dark-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              {item.image ? (
                item.image.startsWith('http') ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-6xl">{item.image}</span>
                )
              ) : (
                <span className="text-6xl">🍽️</span>
              )}
            </div>
            
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.available
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {item.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">Category: {item.category}</p>
              <p className="text-xl font-bold text-primary-600 dark:text-primary-500">
                {item.price.toFixed(2)} {currency}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(item)}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id || item._id)}
                className="flex-1 btn-danger flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No menu items found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
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

              <div>
                <label className="label">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  required
                >
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Price ({currency}) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>

              <div>
                <label className="label">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload an image (JPG, PNG, GIF) or use emoji in name field
                </p>
                {imagePreview && (
                  <div className="mt-3 relative w-32 h-32 bg-gray-100 dark:bg-dark-700 rounded-lg overflow-hidden">
                    {imagePreview.startsWith('data:image') || imagePreview.startsWith('http') ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        {imagePreview}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="available" className="text-sm font-medium">
                  Available for sale
                </label>
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
    </div>
  );
};

export default Menu;
