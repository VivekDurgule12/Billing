import React from 'react';

function InvoiceGenerator({ customer, items, totalAmount, remainingAmount }) {
  return (
    <div className="bg-gray-700/50 rounded-xl p-6 shadow-md">
      <h2 className="text-2xl font-semibold text-teal-300 mb-4">Invoice Preview</h2>
      <div className="space-y-4">
        <div>
          <p><strong>Customer:</strong> {customer.name || 'N/A'}</p>
          <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
          <p><strong>Address:</strong> {customer.address || 'N/A'}</p>
          <p><strong>Phone:</strong> {customer.phone || 'N/A'}</p>
          <p><strong>Date:</strong> {customer.date || 'N/A'}</p>
        </div>
        <div>
          <h3 className="font-semibold">Items:</h3>
          {items.map((item) => (
            <p key={item.id}>{item.name || 'Unnamed'} - Qty:{item.quantity || '0'} * ₹{item.price || '0'} - ₹{item.total.toFixed(2)}</p>
          ))}
        </div>
        <div>
          <p className="font-bold">Total: ₹{totalAmount.toFixed(2)}</p>
          <p>Remaining: ₹{remainingAmount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default InvoiceGenerator;