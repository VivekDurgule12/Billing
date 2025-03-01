import React from 'react';

function CustomerForm({ customer, setCustomer, onKeyPress }) {
  const handleChange = (field) => (e) => {
    setCustomer({ ...customer, [field]: e.target.value });
  };

  return (
    <div className="bg-gray-700/50 rounded-xl p-6 shadow-md">
      <h2 className="text-2xl font-semibold text-teal-300 mb-4">Customer Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Customer Name"
          value={customer.name}
          onChange={handleChange('name')}
          onKeyPress={(e) => onKeyPress(e, 'name')}
          className="bg-gray-600/50 text-white p-3 rounded-lg border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
        />
        <input
          type="email"
          placeholder="Email"
          value={customer.email}
          onChange={handleChange('email')}
          onKeyPress={(e) => onKeyPress(e, 'email')}
          className="bg-gray-600/50 text-white p-3 rounded-lg border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
        />
        <input
          type="text"
          placeholder="Address"
          value={customer.address}
          onChange={handleChange('address')}
          onKeyPress={(e) => onKeyPress(e, 'address')}
          className="bg-gray-600/50 text-white p-3 rounded-lg border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={customer.phone}
          onChange={handleChange('phone')}
          onKeyPress={(e) => onKeyPress(e, 'phone')}
          className="bg-gray-600/50 text-white p-3 rounded-lg border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
        />
        <input
          type="date"
          value={customer.date}
          onChange={handleChange('date')}
          onKeyPress={(e) => onKeyPress(e, 'date')}
          className="bg-gray-600/50 text-white p-3 rounded-lg border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
        />
      </div>
    </div>
  );
}

export default CustomerForm;