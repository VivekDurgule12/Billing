import React, { useEffect, useRef } from "react";

const ItemList = ({
  items,
  removeItem,
  addItem,
  handleKeyDown,
  handleBlur,
  handleChange,
  focusedItemId,
  focusedField,
}) => {
  const inputRefs = useRef({});

  // Focus management: Automatically focus an input when specified by the parent
  useEffect(() => {
    if (
      focusedItemId &&
      focusedField &&
      inputRefs.current[focusedItemId]?.[focusedField]
    ) {
      inputRefs.current[focusedItemId][focusedField].focus();
    }
  }, [focusedItemId, focusedField, items]);

  const handlePriceKeyDown = (e, field, itemId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleKeyDown(e, field, itemId);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-teal-400 mb-4 text-center">
        Item List
      </h2>
      <div className="space-y-3 overflow-x-auto">
        {items.map((item, index) => {
          if (!inputRefs.current[item.id]) {
            inputRefs.current[item.id] = {};
          }

          const qty = Number(item.quantity) || 0;
          const price = Number(item.price) || 0;
          const total = qty * price;

          return (
            <div
              key={item.id}
              className="flex flex-wrap gap-3 items-center bg-gray-700 p-3 rounded-lg"
            >
              <span className="text-white font-medium w-6 text-right">
                {index + 1}.
              </span>

              <input
                type="text"
                value={item.name || ""}
                onChange={(e) => handleChange(e, "name", item.id)}
                onKeyDown={(e) => handleKeyDown(e, "name", item.id)}
                onBlur={() => handleBlur("name", item.id)}
                ref={(el) => (inputRefs.current[item.id]["name"] = el)}
                placeholder="Item Name"
                className="flex-1 bg-gray-600 text-white p-3 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200 min-w-40"
                inputMode="text"
              />

              <input
                type="number"
                value={item.quantity || ""}
                onChange={(e) => handleChange(e, "quantity", item.id)}
                onKeyDown={(e) => handleKeyDown(e, "quantity", item.id)}
                onBlur={() => handleBlur("quantity", item.id)}
                ref={(el) => (inputRefs.current[item.id]["quantity"] = el)}
                placeholder="Qty"
                className="w-24 bg-gray-600 text-white p-3 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
                min="0"
                inputMode="numeric"
              />

              <input
                type="number"
                value={item.price || ""}
                onChange={(e) => handleChange(e, "price", item.id)}
                onKeyDown={(e) => handlePriceKeyDown(e, "price", item.id)}
                onBlur={() => handleBlur("price", item.id)}
                ref={(el) => (inputRefs.current[item.id]["price"] = el)}
                placeholder="Price (₹)"
                className="w-24 bg-gray-600 text-white p-3 rounded-md border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
                min="0"
                inputMode="decimal"
              />

              <button
                onClick={() => removeItem(item.id)}
                className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-all duration-200"
                aria-label="Remove Item"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <span className="text-sm text-white">= ₹{total.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItemList;
