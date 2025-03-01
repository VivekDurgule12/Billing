import React, { useEffect, useRef } from 'react';

const ItemList = ({ items, removeItem, updateItem, handleKeyDown, handleBlur, handleChange, focusedItemId, focusedField }) => {
  const inputRefs = useRef({});

  useEffect(() => {
    // Move focus logic to a separate function
    const setFocus = () => {
      if (focusedItemId && focusedField && inputRefs.current[focusedItemId] && inputRefs.current[focusedItemId][focusedField]) {
        const input = inputRefs.current[focusedItemId][focusedField];
        input.focus();
        // Only select text on the initial focus, not on every re-render
        if (!input.hasAttribute('data-selected')) {
          input.select();
          input.setAttribute('data-selected', 'true'); // Mark as selected
        }
      } else {
        // If no focus, clear all "data-selected" attributes to allow re-selection
        Object.values(inputRefs.current).forEach(itemRefs => {
          Object.values(itemRefs).forEach(input => {
            input?.removeAttribute('data-selected');
          });
        });
      }
    };

    // Delay focus to after the component has fully rendered
    setTimeout(setFocus, 50);
  }, [focusedItemId, focusedField, items]);

  const handleInputClick = (field, itemId) => {
    // Trigger focus
    if (inputRefs.current[itemId] && inputRefs.current[itemId][field]) {
      const input = inputRefs.current[itemId][field];
      input.focus(); // Focus the input
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-teal-400 mb-4 text-center">Item List</h2>
      <div className="space-y-3 overflow-x-auto">
        {items.map((item, index) => {
          if (!inputRefs.current[item.id]) {
            inputRefs.current[item.id] = {};
          }
          return (
            <div key={item.id} className="flex flex-wrap gap-3 items-center bg-gray-700 p-3 rounded-lg">
              <span className="text-white font-medium w-6 text-right">{index + 1}.</span>

              {/* Name Input */}
              <input
                type="text"
                value={item.name || ''} // Ensure default value is a string
                onChange={(e) => handleChange(e, "name", item.id)}
                onKeyDown={(e) => handleKeyDown(e, "name", item.id)}
                onBlur={(e) => handleBlur("name", item.id)}
                ref={(el) => {
                  if (el) inputRefs.current[item.id]["name"] = el;
                }}
                placeholder="Item Name"
                className="flex-1 bg-gray-600 text-white p-3 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200 min-w-40"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                inputMode="text"
                onClick={() => handleInputClick("name", item.id)}
              />

              {/* Quantity Input */}
              <input
                type="number"
                value={item.quantity || ''} // Ensure default value is a string
                onChange={(e) => handleChange(e, "quantity", item.id)}
                onKeyDown={(e) => handleKeyDown(e, "quantity", item.id)}
                onBlur={(e) => handleBlur("quantity", item.id)}
                ref={(el) => {
                  if (el) inputRefs.current[item.id]["quantity"] = el;
                }}
                placeholder="Qty"
                className="w-24 bg-gray-600 text-white p-3 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
                min="0"
                inputMode="numeric"
              />

              {/* Price Input */}
              <input
                type="number"
                value={item.price || ''}  // Ensure default value is a string
                onChange={(e) => handleChange(e, "price", item.id)}
                onKeyDown={(e) => handleKeyDown(e, "price", item.id)}
                onBlur={(e) => handleBlur("price", item.id)}
                ref={(el) => {
                  if (el) inputRefs.current[item.id]["price"] = el
                }}
                placeholder="Price (₹)"
                className="w-24 bg-gray-600 text-white p-3 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
                min="0"
                inputMode="decimal"
              />

              {/* Remove Button */}
              <button onClick={() => removeItem(item.id)} className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-all duration-200" aria-label="Remove Item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItemList;