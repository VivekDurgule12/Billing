import React, { useEffect, useRef } from 'react';

const ItemList = ({ items, removeItem, handleKeyDown, handleBlur, handleChange, focusedItemId, focusedField }) => {
    const inputRefs = useRef({});

    useEffect(() => {
        if (focusedItemId && focusedField && inputRefs.current[focusedItemId] && inputRefs.current[focusedItemId][focusedField]) {
            setTimeout(() => {
                inputRefs.current[focusedItemId][focusedField]?.focus();
            }, 100); // Slight delay for better mobile focus handling
        }
    }, [focusedItemId, focusedField, items]);

    const handleInputClick = (field, itemId) => {
        if (inputRefs.current[itemId] && inputRefs.current[itemId][field]) {
            inputRefs.current[itemId][field].focus();
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
                                id={`${item.id}-name`}
                                defaultValue={item.name}
                                onChange={(e) => handleChange(e, "name", item.id)}
                                onKeyDown={(e) => handleKeyDown(e, "name", item.id)}
                                onBlur={() => handleBlur("name", item.id)}
                                ref={(el) => (inputRefs.current[item.id]["name"] = el)}
                                placeholder="Item Name"
                                className="flex-1 bg-gray-600 text-white p-3 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200 min-w-40"
                                inputMode="text"
                                onClick={() => handleInputClick("name", item.id)}
                                onTouchStart={() => handleInputClick("name", item.id)} // Added for mobile
                            />

                            {/* Quantity Input */}
                            <input
                                type="number"
                                id={`${item.id}-quantity`}
                                defaultValue={item.quantity}
                                onChange={(e) => handleChange(e, "quantity", item.id)}
                                onKeyDown={(e) => handleKeyDown(e, "quantity", item.id)}
                                onBlur={() => handleBlur("quantity", item.id)}
                                ref={(el) => (inputRefs.current[item.id]["quantity"] = el)}
                                placeholder="Qty"
                                className="w-24 bg-gray-600 text-white p-3 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
                                min="0"
                                inputMode="numeric"
                                onClick={() => handleInputClick("quantity", item.id)}
                                onTouchStart={() => handleInputClick("quantity", item.id)} // Added for mobile
                            />

                            {/* Price Input */}
                            <input
                                type="number"
                                id={`${item.id}-price`}
                                defaultValue={item.price}
                                onChange={(e) => handleChange(e, "price", item.id)}
                                onKeyDown={(e) => handleKeyDown(e, "price", item.id)}
                                onBlur={() => handleBlur("price", item.id)}
                                ref={(el) => (inputRefs.current[item.id]["price"] = el)}
                                placeholder="Price (₹)"
                                className="w-24 bg-gray-600 text-white p-3 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
                                min="0"
                                inputMode="decimal"
                                onClick={() => handleInputClick("price", item.id)}
                                onTouchStart={() => handleInputClick("price", item.id)} // Added for mobile
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
