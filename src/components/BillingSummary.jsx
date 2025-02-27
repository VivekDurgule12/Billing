import React from 'react';

function BillingSummary({ totalAmount, remainingAmount, setRemainingAmount }) {
  const formatINR = (number) => Number(number).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="mb-8 bg-gray-600 p-6 rounded-xl border border-orange-600 shadow-lg">
      <h2 className="text-2xl font-bold text-teal-400 mb-4 text-center tracking-wide">Billing Summary</h2>
      <div className="space-y-4">
        <p className="text-lg text-gray-200 text-center">
          Total Amount: <span className="font-bold text-orange-400">₹{formatINR(totalAmount)}</span>
        </p>
        <input
          type="number"
          min="0"
          step="0.01"
          value={remainingAmount}
          onChange={(e) => setRemainingAmount(parseFloat(e.target.value) || 0)}
          placeholder="Remaining Amount (₹)"
          className="w-full p-3 bg-gray-700 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200"
        />
        <p className="text-xl font-bold text-gray-200 text-center">
          Final Bill: <span className="text-teal-400">₹{formatINR(totalAmount)}</span>
        </p>
      </div>
    </div>
  );
}

export default BillingSummary;