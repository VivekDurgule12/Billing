import React, { useState, useEffect } from 'react';
import { storageManager } from '../utils/storageManager';

export default function InventoryMaster() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    item: '',
    type: '',
    category: '',
    costPrice: '',
    sellingPrice: '',
    unitType: 'Piece',
    weightPerUnit: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = () => {
    const inventory = storageManager.getInventory();
    setItems(inventory);
    setCategories(storageManager.getCategories());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    
    if (!formData.item || !formData.type || !formData.category || 
        !formData.costPrice || !formData.sellingPrice) {
      setMessage('❌ Please fill all required fields');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      if (editingId) {
        storageManager.updateItem(editingId, formData);
        setMessage('✅ Item updated successfully');
        setEditingId(null);
      } else {
        storageManager.addItem(formData);
        setMessage('✅ Item added successfully');
      }

      setFormData({
        item: '',
        type: '',
        category: '',
        costPrice: '',
        sellingPrice: '',
        unitType: 'Piece',
        weightPerUnit: '',
      });
      
      setTimeout(() => setMessage(''), 3000);
      loadInventory();
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.sn);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (sn) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      storageManager.deleteItem(sn);
      setMessage('✅ Item deleted successfully');
      setTimeout(() => setMessage(''), 3000);
      loadInventory();
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      storageManager.importInventory(file).then(() => {
        setMessage('✅ Inventory imported successfully');
        setTimeout(() => setMessage(''), 3000);
        loadInventory();
      }).catch((error) => {
        setMessage('❌ Import failed: ' + error.message);
        setTimeout(() => setMessage(''), 3000);
      });
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-teal-300 mb-6">📦 Inventory Master</h1>

      {message && (
        <div className="fixed top-4 right-4 bg-gray-800 border-l-4 border-teal-500 p-4 rounded shadow-lg z-50">
          {message}
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-teal-300 mb-4">
          {editingId ? '✏️ Edit Item' : '➕ Add New Item'}
        </h2>
        <form onSubmit={handleAddOrUpdate} className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <input
            type="text"
            name="item"
            placeholder="Item Name *"
            value={formData.item}
            onChange={handleInputChange}
            className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
          />
          <input
            type="text"
            name="type"
            placeholder="Type *"
            value={formData.type}
            onChange={handleInputChange}
            className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
          />
          <input
            type="text"
            name="category"
            placeholder="Category *"
            value={formData.category}
            onChange={handleInputChange}
            className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
          />
          <input
            type="number"
            name="costPrice"
            placeholder="Cost Price (₹) *"
            value={formData.costPrice}
            onChange={handleInputChange}
            className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
          />
          <input
            type="number"
            name="sellingPrice"
            placeholder="Selling Price (₹) *"
            value={formData.sellingPrice}
            onChange={handleInputChange}
            className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
          />
          <input
            type="text"
            name="unitType"
            placeholder="Unit Type (KG, Gram, etc.)"
            value={formData.unitType}
            onChange={handleInputChange}
            className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
          />
          <input
            type="number"
            name="weightPerUnit"
            placeholder="Weight Per Unit"
            value={formData.weightPerUnit}
            onChange={handleInputChange}
            className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
          />
          <button
            type="submit"
            className="md:col-span-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded transition-all"
          >
            {editingId ? '💾 Update Item' : '➕ Add Item'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  item: '',
                  type: '',
                  category: '',
                  costPrice: '',
                  sellingPrice: '',
                  unitType: 'Piece',
                  weightPerUnit: '',
                });
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded transition-all"
            >
              ❌ Cancel
            </button>
          )}
        </form>
      </div>

      {/* Search & Filter & Export */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
        >
          <option value="">📂 All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={() => storageManager.exportInventory()}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-all"
        >
          📥 Export JSON
        </button>
        <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all cursor-pointer">
          📤 Import JSON
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      {/* Items Table */}
      <div className="bg-gray-800 rounded-lg overflow-x-auto border border-gray-700">
        <table className="w-full text-white text-sm">
          <thead className="bg-gray-700 sticky top-0">
            <tr>
              <th className="p-3 text-left">S.N</th>
              <th className="p-3 text-left">Item</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-right">Cost Price</th>
              <th className="p-3 text-right">Selling Price</th>
              <th className="p-3 text-right">Profit</th>
              <th className="p-3 text-right">Weight/Unit</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <tr key={item.sn} className="border-t border-gray-700 hover:bg-gray-700 transition-all">
                  <td className="p-3">{item.sn}</td>
                  <td className="p-3 font-semibold">{item.item}</td>
                  <td className="p-3">{item.type}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3 text-right">₹{item.costPrice.toFixed(2)}</td>
                  <td className="p-3 text-right">₹{item.sellingPrice.toFixed(2)}</td>
                  <td className="p-3 text-right text-green-400 font-semibold">₹{item.profit.toFixed(2)}</td>
                  <td className="p-3 text-right">{item.weightPerUnit} {item.unitType}</td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-all"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.sn)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-all"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="p-6 text-center text-gray-400">
                  No items found. Add your first item to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <p className="text-gray-400 text-sm">Total Items</p>
            <p className="text-2xl font-bold text-teal-300">{items.length}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <p className="text-gray-400 text-sm">Total Cost Value</p>
            <p className="text-2xl font-bold text-blue-300">₹{items.reduce((sum, i) => sum + i.costPrice, 0).toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <p className="text-gray-400 text-sm">Total Selling Value</p>
            <p className="text-2xl font-bold text-purple-300">₹{items.reduce((sum, i) => sum + i.sellingPrice, 0).toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <p className="text-gray-400 text-sm">Total Profit Potential</p>
            <p className="text-2xl font-bold text-green-300">₹{items.reduce((sum, i) => sum + i.profit, 0).toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}