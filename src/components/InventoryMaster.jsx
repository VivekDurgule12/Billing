import React, { useState, useEffect } from 'react';
import { defaultInventory } from '../data/defaultInventory';

export default function InventoryMaster() {
  const [items, setItems] = useState([]);

  const [formData, setFormData] = useState({
    marathiName: '',
    englishName: '',
    type: '',
    category: '',
    costPrice: '',
    sellingPrice: '',
    unitType: 'Piece',
    weightPerUnit: '',
  });
  const INVENTORY_CATEGORIES = [
  'Grocery',
  'Pulses & Dals',
  'Rice & Grains',
  'Flours & Atta',
  'Oil & Ghee',
  'Spices & Masala',
  'Dry Fruits & Nuts',
  'Sugar & Salt',
  'Tea & Coffee',
  'Biscuits & Cookies',
  'Namkeen & Snacks',
  'Instant & Packaged Food',
  'Noodles & Pasta',
  'Breakfast & Cereals',
  'Sauces & Spreads',
  'Pickles & Chutneys',
  'Beverages',
  'Dairy Products',
  'Bakery Products',
  'Frozen Foods',
  'Fruits & Vegetables',
  'Personal Care',
  'Home Care & Cleaning',
  'Household Items',
  'Baby Care',
  'Pet Care',
  'Stationery',
  'Pooja & Religious Items',
  'Other'
];


  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');




const loadInventory = () => {
  const savedData = localStorage.getItem('inventoryData');

  const migrateInventory = (inventory) => {
    return inventory.map((item, index) => {
      let marathiName = item.marathiName || '';
      let englishName = item.englishName || '';

      // Convert old "item: Marathi / English" format
      if ((!marathiName || !englishName) && item.item) {
        const parts = item.item
          .split('/')
          .map(name => name.trim());

        marathiName = parts[0] || '';
        englishName = parts.slice(1).join(' / ') || '';
      }

      return {
        ...item,
        sn: index + 1,
        marathiName,
        englishName,
        profit:
          Number(item.sellingPrice || 0) -
          Number(item.costPrice || 0),
        unitType: item.unitType || item.type || 'Piece',
        weightPerUnit: item.weightPerUnit || 1,
      };
    });
  };

  if (savedData) {
    const inventory = JSON.parse(savedData);

    // Convert old inventory data to new Marathi/English structure
    const migratedInventory = migrateInventory(inventory);

    setItems(migratedInventory);

    // Save migrated structure back to localStorage
    localStorage.setItem(
      'inventoryData',
      JSON.stringify(migratedInventory)
    );
  } else {
    console.log("Using default inventory");

    const migratedInventory = migrateInventory(defaultInventory);

    setItems(migratedInventory);

    localStorage.setItem(
      'inventoryData',
      JSON.stringify(migratedInventory)
    );
  }
};

useEffect(() => {

  const uniqueCategories =
    [
      ...new Set(
        items.map(
          item => item.category
        )
      )
    ];

  setCategories(
    uniqueCategories
  );

}, [items]);


useEffect(() => {
  loadInventory();
}, []);

useEffect(() => {
  if (items.length > 0) {
    localStorage.setItem(
      'inventoryData',
      JSON.stringify(items)
    );
  }
}, [items]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEnterMove = (e) => {
    if (e.key !== 'Enter') {
      return;
    }

    const fields = Array.from(e.currentTarget.querySelectorAll('[data-enter-next]'));
    const currentIndex = fields.indexOf(e.target);
    if (currentIndex === -1) {
      return;
    }

    e.preventDefault();
    const nextField = fields[currentIndex + 1];
    if (nextField) {
      nextField.focus();
      nextField.select?.();
      return;
    }

    e.currentTarget.requestSubmit();
  };


  const handleAddOrUpdate = async (e) => {
  e.preventDefault();

  if (
  !formData.marathiName ||
  !formData.englishName ||
  !formData.type ||
  !formData.category ||
  !formData.costPrice ||
  !formData.sellingPrice
){
    setMessage('❌ Please fill all required fields');
    setTimeout(() => setMessage(''), 3000);
    return;
  }

  try {
    if (editingId) {
      setItems(prev =>
        prev.map(item =>
          item.sn === editingId
            ? {
                ...item,
                ...formData,
                costPrice: Number(formData.costPrice),
                sellingPrice: Number(formData.sellingPrice),
                profit:
                  Number(formData.sellingPrice) -
                  Number(formData.costPrice),
              }
            : item
        )
      );

      setMessage('✅ Item updated successfully');
      setEditingId(null);
    } else {
      const newItem = {
        sn: Math.max(...items.map(i => i.sn), 0) + 1,
        ...formData,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        profit:
          Number(formData.sellingPrice) -
          Number(formData.costPrice),
      };

      setItems(prev => [...prev, newItem]);

      setMessage('✅ Item added successfully');
    }

    setFormData({
      marathiName: '',
      englishName: '',
      type: '',
      category: '',
      costPrice: '',
      sellingPrice: '',
      unitType: 'Piece',
      weightPerUnit: '',
    });

    setTimeout(() => {
      document.querySelector('[name="marathiName"]')?.focus();
    }, 0);

    setTimeout(() => setMessage(''), 3000);
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

 const handleDelete = async (sn) => {
  if (window.confirm('Are you sure you want to delete this item?')) {
    setItems(prev => prev.filter(item => item.sn !== sn));

    setMessage('✅ Item deleted successfully');
    setTimeout(() => setMessage(''), 3000);
  }
};

const filteredItems = items.filter(item => {
  const marathiName = item.marathiName || item.item || '';
  const englishName = item.englishName || '';

  const search = searchTerm.toLowerCase();

  const matchesSearch =
    marathiName.toLowerCase().includes(search) ||
    englishName.toLowerCase().includes(search);

  const matchesCategory =
    !filterCategory || item.category === filterCategory;

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
        <form onSubmit={handleAddOrUpdate} onKeyDown={handleEnterMove} className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <input
  type="text"
  name="marathiName"
  data-enter-next
  placeholder="Marathi Name *"
  value={formData.marathiName}
  onChange={handleInputChange}
  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
/>

<input
  type="text"
  name="englishName"
  data-enter-next
  placeholder="English Name *"
  value={formData.englishName}
  onChange={handleInputChange}
  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
/>
          <select
  name="type"
  data-enter-next
  value={formData.type}
  onChange={handleInputChange}
  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
>
  <option value="">Select Type *</option>
  <option value="KG">KG</option>
  <option value="Gram">Gram</option>
  <option value="Litre">Litre</option>
  <option value="ML">ML</option>
  <option value="Piece">Piece</option>
  <option value="Packet">Packet</option>
  <option value="Box">Box</option>
  <option value="Bottle">Bottle</option>
  <option value="Dozen">Dozen</option>
</select>

          <select
  name="category"
  data-enter-next
  value={formData.category}
  onChange={handleInputChange}
  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
>
  <option value="">Select Category *</option>

  <option value="Grocery">Grocery</option>
  <option value="Pulses & Dals">Pulses & Dals</option>
  <option value="Rice & Grains">Rice & Grains</option>
  <option value="Flours & Atta">Flours & Atta</option>
  <option value="Sugar & Salt">Sugar & Salt</option>
  <option value="Oil & Ghee">Oil & Ghee</option>
  <option value="Spices & Masala">Spices & Masala</option>
  <option value="Dry Fruits & Nuts">Dry Fruits & Nuts</option>
  <option value="Tea & Coffee">Tea & Coffee</option>
  <option value="Biscuits & Cookies">Biscuits & Cookies</option>
  <option value="Namkeen & Snacks">Namkeen & Snacks</option>
  <option value="Instant & Packaged Food">Instant & Packaged Food</option>
  <option value="Noodles & Pasta">Noodles & Pasta</option>
  <option value="Breakfast & Cereals">Breakfast & Cereals</option>
  <option value="Sauces & Spreads">Sauces & Spreads</option>
  <option value="Pickles & Chutneys">Pickles & Chutneys</option>
  <option value="Beverages">Beverages</option>

  <option value="Dairy Products">Dairy Products</option>
  <option value="Bakery Products">Bakery Products</option>
  <option value="Frozen Foods">Frozen Foods</option>
  <option value="Fruits & Vegetables">Fruits & Vegetables</option>

  <option value="Personal Care">Personal Care</option>
  <option value="Home Care & Cleaning">Home Care & Cleaning</option>
  <option value="Household Items">Household Items</option>
  <option value="Baby Care">Baby Care</option>
  <option value="Pet Care">Pet Care</option>
  <option value="Stationery">Stationery</option>
  <option value="Pooja & Religious Items">Pooja & Religious Items</option>

  <option value="Other">Other</option>
</select>
          <input
            type="number"
            name="costPrice"
            data-enter-next
            placeholder="Cost Price (₹) *"
            value={formData.costPrice}
            onChange={handleInputChange}
            className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
          />
          <input
            type="number"
            name="sellingPrice"
            data-enter-next
            placeholder="Selling Price (₹) *"
            value={formData.sellingPrice}
            onChange={handleInputChange}
            className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
          />
         <select
  name="unitType"
  data-enter-next
  value={formData.unitType}
  onChange={handleInputChange}
  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
>

  <option value="KG">KG</option>
  <option value="Gram">Gram</option>
  <option value="Litre">Litre</option>
  <option value="ML">ML</option>
  <option value="Piece">Piece</option>
  <option value="Packet">Packet</option>
  <option value="Box">Box</option>
  <option value="Bottle">Bottle</option>
  <option value="Dozen">Dozen</option>
</select>

          <input
            type="number"
            name="weightPerUnit"
            data-enter-next
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
                 marathiName: '',
                  englishName: '',
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
      </div>

      {/* Items Table */}
      <div className="bg-gray-800 rounded-lg overflow-x-auto border border-gray-700">
        <table className="w-full text-white text-sm">
        
            {/* <tr>
              <th className="p-3 text-left">S.N</th>
              <th className="p-3 text-left">S.N</th>
<th className="p-3 text-left">Item</th>
<th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-right">Cost Price</th>
              <th className="p-3 text-right">Selling Price</th>
              <th className="p-3 text-right">Profit</th>
              <th className="p-3 text-right">Weight/Unit</th>
              <th className="p-3 text-center">Actions</th>
            </tr> */}
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
                // <tr key={item.sn} className="border-t border-gray-700 hover:bg-gray-700 transition-all">
                //   <td className="p-3">{item.sn}</td>
                //   <td className="p-3 font-semibold">{item.marathiName}</td>
                //   <td className="p-3 font-semibold">{item.englishName}</td>
                //   <td className="p-3">{item.type}</td>
                //   <td className="p-3">{item.category}</td>
                //   <td className="p-3 text-right">₹{item.costPrice.toFixed(2)}</td>
                //   <td className="p-3 text-right">₹{item.sellingPrice.toFixed(2)}</td>
                //   <td className="p-3 text-right text-green-400 font-semibold">₹{item.profit.toFixed(2)}</td>
                //   <td className="p-3 text-right">{item.weightPerUnit} {item.unitType}</td>
                //   <td className="p-3 text-center space-x-2">
                //     <button
                //       onClick={() => handleEdit(item)}
                //       className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-all"
                //     >
                //       ✏️ Edit
                //     </button>
                //     <button
                //       onClick={() => handleDelete(item.sn)}
                //       className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-all"
                //     >
                //       🗑️ Delete
                //     </button>
                //   </td>
                // </tr>
                <tr
  key={item.sn}
  className="border-t border-gray-700 hover:bg-gray-700 transition-all"
>
  <td className="p-3">{item.sn}</td>

  <td className="p-3 font-semibold">
    {item.marathiName} / {item.englishName}
  </td>

  <td className="p-3">{item.type}</td>

  <td className="p-3">{item.category}</td>

  <td className="p-3 text-right">
    ₹{item.costPrice.toFixed(2)}
  </td>

  <td className="p-3 text-right">
    ₹{item.sellingPrice.toFixed(2)}
  </td>

  <td className="p-3 text-right text-green-400 font-semibold">
    ₹{item.profit.toFixed(2)}
  </td>

  <td className="p-3 text-right">
    {item.weightPerUnit} {item.unitType}
  </td>

  <td className="p-3 text-center space-x-2">
    <button
      onClick={() => handleEdit(item)}
      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-all"
    >
      Edit
    </button>

    <button
      onClick={() => handleDelete(item.sn)}
      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-all"
    >
      Delete
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