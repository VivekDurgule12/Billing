import React from 'react';

function BillingSummary({ totalAmount, remainingAmount, setRemainingAmount }) {
  return (
    <div className="bg-gray-700/50 rounded-xl p-6 shadow-md">
      <h2 className="text-2xl font-semibold text-teal-300 mb-4">Billing Summary</h2>
      <div className="space-y-2">
        <p className="font-bold">Total Amount: ₹{totalAmount.toFixed(2)}</p>
        <div className="mt-4">
          <label className="block text-sm">Remaining Amount (₹):</label>
          <input
            type="number"
            value={remainingAmount}
            onChange={(e) => setRemainingAmount(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-600/50 text-white p-2 rounded-lg border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
}

export default BillingSummary;