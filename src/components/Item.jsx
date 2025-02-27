import React, { useState } from 'react';

function Item({ item, index, removeItem, updateItem }) {
  const [isEditing, setIsEditing] = useState(item.isEditing || false);

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => {
    if (!item.name || Number(item.quantity) < 0 || Number(item.price) < 0) {
      alert('Please fill all fields correctly before saving.');
      return;
    }
    setIsEditing(false);
    updateItem(item.id, 'isEditing', false); // Persist edit state
  };
  const handleRemove = () => removeItem(item.id);

  const formatINR = (number) => Number(number).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="relative mb-4 p-4 bg-gray-700 rounded-xl border border-purple-600 hover:border-purple-500 transition-all duration-200 shadow-md">
      {isEditing ? (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={item.name}
            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
            placeholder="Enter item name"
            className="border border-gray-500 p-2 rounded-lg w-full sm:w-2/5 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-200"
          />
          <input
            type="number"
            min="1"
            step="1"
            value={item.quantity}
            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
            placeholder="Qty (min 1)"
            className="border border-gray-500 p-2 rounded-lg w-full sm:w-1/5 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-200"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.price}
            onChange={(e) => updateItem(item.id, 'price', e.target.value)}
            placeholder="Price (₹)"
            className="border border-gray-500 p-2 rounded-lg w-full sm:w-1/5 bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-200"
          />
          <span className="w-full sm:w-1/5 text-center text-orange-400 font-semibold">
            ₹{formatINR(Number(item.quantity) * Number(item.price))}
          </span>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto hover:bg-green-700 hover:scale-105 transition-all duration-300 shadow-sm"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between text-gray-200">
          <span className="w-full sm:w-1/12 font-medium text-teal-400">{index + 1}.</span>
          <span className="w-full sm:w-2/5 truncate">{item.name || 'Unnamed'}</span>
          <span className="w-full sm:w-1/5">{item.quantity || 0}</span>
          <span className="w-full sm:w-1/5">₹{formatINR(item.price)}</span>
          <span className="w-full sm:w-1/5 text-orange-400 font-semibold">
            ₹{formatINR(item.total)}
          </span>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              onClick={handleEdit}
              className="bg-teal-500 text-white px-3 py-1 rounded-lg hover:bg-teal-600 hover:scale-105 transition-all duration-200"
            >
              Edit
            </button>
            <button
              onClick={handleRemove}
              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 hover:scale-105 transition-all duration-200"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Item;