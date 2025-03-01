import React, { useEffect, useRef } from 'react';

const ItemList = ({ items, removeItem, addItem, handleKeyDown, handleBlur, handleChange, focusedItemId, focusedField }) => {
    const inputRefs = useRef({});
    const enterPressCount = useRef(0); // Tracks number of Enter presses
    const enterPressTimer = useRef(null); // Timer to reset the counter

    // Focus management: Automatically focus an input when specified by the parent
    useEffect(() => {
        if (focusedItemId && focusedField && inputRefs.current[focusedItemId]?.[focusedField]) {
            inputRefs.current[focusedItemId][focusedField].focus();
        }
    }, [focusedItemId, focusedField, items]);

    // Handle double Enter press in the price field
    const handleDoubleEnter = (e, field, itemId) => {
        if (e.key === 'Enter' && field === 'price') {
            enterPressCount.current += 1;

            if (enterPressCount.current === 2) {
                addItem(); // Add a new item
                enterPressCount.current = 0; // Reset the counter
                clearTimeout(enterPressTimer.current); // Clear the timer
            } else {
                // Reset counter after 500ms if no second Enter press
                enterPressTimer.current = setTimeout(() => {
                    enterPressCount.current = 0;
                }, 500);
            }
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg w-full max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold text-teal-400 mb-4 text-center">Item List</h2>
            <div className="space-y-3 overflow-x-auto">
                {items.map((item, index) => {
                    // Initialize input refs for this item
                    if (!inputRefs.current[item.id]) {
                        inputRefs.current[item.id] = {};
                    }

                    // Calculate the total: qty * price
                    const qty = Number(item.quantity) || 0; // Default to 0 if not a number
                    const price = Number(item.price) || 0;  // Default to 0 if not a number
                    const total = qty * price;

                    // Create the display string (not used in UI but kept for consistency)
                    const displayText = `${item.name || 'Unnamed'} - Qty:${qty} * ₹${price.toFixed(2)} = ₹${total.toFixed(2)}`;

                    return (
                        <div key={item.id} className="flex flex-wrap gap-3 items-center bg-gray-700 p-3 rounded-lg">
                            {/* Item Number */}
                            <span className="text-white font-medium w-6 text-right">{index + 1}.</span>

                            {/* Name Input */}
                            <input
                                type="text"
                                id={`${item.id}-name`}
                                value={item.name || ''}
                                onChange={(e) => handleChange(e, "name", item.id)}
                                onKeyDown={(e) => handleKeyDown(e, "name", item.id)}
                                onBlur={() => handleBlur("name", item.id)}
                                ref={(el) => (inputRefs.current[item.id]["name"] = el)}
                                placeholder="Item Name"
                                className="flex-1 bg-gray-600 text-white p-3 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200 min-w-40"
                                inputMode="text"
                            />

                            {/* Quantity Input */}
                            <input
                                type="number"
                                id={`${item.id}-quantity`}
                                value={item.quantity || ''}
                                onChange={(e) => handleChange(e, "quantity", item.id)}
                                onKeyDown={(e) => handleKeyDown(e, "quantity", item.id)}
                                onBlur={() => handleBlur("quantity", item.id)}
                                ref={(el) => (inputRefs.current[item.id]["quantity"] = el)}
                                placeholder="Qty"
                                className="w-24 bg-gray-600 text-white p-3 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
                                min="0"
                                inputMode="numeric"
                            />

                            {/* Price Input */}
                            <input
                                type="number"
                                id={`${item.id}-price`}
                                value={item.price || ''}
                                onChange={(e) => handleChange(e, "price", item.id)}
                                onKeyDown={(e) => {
                                    handleKeyDown(e, "price", item.id); // Existing keydown handler
                                    handleDoubleEnter(e, "price", item.id); // Check for double Enter
                                }}
                                onBlur={() => handleBlur("price", item.id)}
                                ref={(el) => (inputRefs.current[item.id]["price"] = el)}
                                placeholder="Price (₹)"
                                className="w-24 bg-gray-600 text-white p-3 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
                                min="0"
                                inputMode="decimal"
                            />

                            {/* Remove Button */}
                            <button
                                onClick={() => removeItem(item.id)}
                                className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-all duration-200"
                                aria-label="Remove Item"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <span className="text-sm text-white">={total}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ItemList;