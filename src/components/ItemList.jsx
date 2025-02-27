import React from 'react';
import Item from './Item';

function ItemList({ items, removeItem, updateItem }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-purple-400 mb-4 text-center tracking-wide drop-shadow-md">Items</h2>
      {items.length === 0 ? (
        <p className="text-gray-400 text-center italic">No items yet—add some to get started!</p>
      ) : (
        items.map((item, index) => (
          <Item
            key={item.id}
            item={item}
            index={index}
            removeItem={removeItem}
            updateItem={updateItem}
          />
        ))
      )}
    </div>
  );
}

export default ItemList;