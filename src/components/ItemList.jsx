import React from 'react';

function ItemList({ items, removeItem, updateItem, addItem, onKeyPress }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-teal-400 mb-4 text-center">Item List</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap gap-3 items-center bg-gray-700 p-3 rounded-lg"
          >
            <input
              type="text"
              placeholder="Item Name"
              value={item.name}
              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
              onKeyPress={(e) => onKeyPress(e, 'name', item.id)}
              className="flex-1 bg-gray-600 text-white p-2 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
            />
            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
              onKeyPress={(e) => onKeyPress(e, 'quantity', item.id)}
              min="0"
              step="1"
              className="w-16 bg-gray-600 text-white p-2 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
            />
            <input
              type="number"
              placeholder="Price (₹)"
              value={item.price}
              onChange={(e) => updateItem(item.id, 'price', e.target.value)}
              onKeyPress={(e) => onKeyPress(e, 'price', item.id)}
              min="0"
              step="0.01"
              className="w-20 bg-gray-600 text-white p-2 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
            />
            <span className="text-white font-medium">= ₹{item.total.toFixed(2)}</span>
            <button
              onClick={() => removeItem(item.id)}
              className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ItemList;
