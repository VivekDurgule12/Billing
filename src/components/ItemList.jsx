import React from 'react';

function ItemList({ items, removeItem, updateItem, addItem, onKeyPress }) {
  return (
    <div className="bg-gray-700/50 rounded-xl p-6 shadow-md">
      <h2 className="text-2xl font-semibold text-teal-300 mb-4">Items</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row gap-3 items-center bg-gray-600/30 p-4 rounded-lg"
          >
            <input
              type="text"
              placeholder="Item Name"
              value={item.name}
              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
              onKeyPress={(e) => onKeyPress(e, 'name', item.id)}
              className="flex-1 bg-gray-500/50 text-white p-2 rounded-lg border border-gray-400 focus:border-teal-400 focus:outline-none transition-all duration-200"
            />
            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
              onKeyPress={(e) => onKeyPress(e, 'quantity', item.id)}
              min="0"
              step="1"
              className="w-20 bg-gray-500/50 text-white p-2 rounded-lg border border-gray-400 focus:border-teal-400 focus:outline-none transition-all duration-200"
            />
            <input
              type="number"
              placeholder="Price (₹)"
              value={item.price}
              onChange={(e) => updateItem(item.id, 'price', e.target.value)}
              onKeyPress={(e) => onKeyPress(e, 'price', item.id)}
              min="0"
              step="0.01"
              className="w-24 bg-gray-500/50 text-white p-2 rounded-lg border border-gray-400 focus:border-teal-400 focus:outline-none transition-all duration-200"
            />
            <span className="text-sm">= ₹{item.total.toFixed(2)}</span>
            <button
              onClick={() => removeItem(item.id)}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all duration-200"
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