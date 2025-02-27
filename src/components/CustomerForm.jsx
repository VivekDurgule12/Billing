import React from 'react';

function CustomerForm({ customer, setCustomer }) {
  return (
    <div className="mb-8 bg-gray-600 p-6 rounded-xl border border-teal-600 shadow-lg">
      <h2 className="text-2xl font-bold text-orange-400 mb-4 text-center tracking-wide">Customer Details</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Customer Name"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
          className="w-full p-3 bg-gray-700 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-200"
        />
        <input
          type="text"
          placeholder="Address"
          value={customer.address}
          onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
          className="w-full p-3 bg-gray-700 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-200"
        />
        <input
          type="date"
          value={customer.date}
          onChange={(e) => setCustomer({ ...customer, date: e.target.value })}
          className="w-full p-3 bg-gray-700 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-200"
        />
      </div>
    </div>
  );
}

export default CustomerForm;