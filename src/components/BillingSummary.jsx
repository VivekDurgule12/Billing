// import React from 'react';

// function BillingSummary({ totalAmount, remainingAmount, setRemainingAmount ,}) {
//   return (
//     <div className="bg-gray-700/50 rounded-xl p-6 shadow-md">
//       <h2 className="text-2xl font-semibold text-teal-300 mb-4">Billing Summary</h2>
//       <div className="space-y-2">
//         <p className="font-bold">Total Amount: ₹{totalAmount.toFixed(2)}</p>
//         <div className="mt-4">
//           <label className="block text-sm mt-5">Remaining Amount (₹):</label>
//           <input
//             type="number"
//             value={remainingAmount}
//             onChange={(e) => setRemainingAmount(parseFloat(e.target.value) || 0)}
//             className="w-full mt-3 bg-gray-600/50 text-white p-2 rounded-lg border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
//           />
//           <label className="block text-sm mt-5">Remaining Amount (₹):</label>
//           <input
//             type="number"
//             value={remainingAmount}
//             onChange={(e) => setRemainingAmount(parseFloat(e.target.value) || 0)}
//             className="w-full mt-3 bg-gray-600/50 text-white p-2 rounded-lg border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default BillingSummary;











// import React from 'react';

// function BillingSummary({ totalAmount, remainingAmount, setRemainingAmount, porterage, setPorterage }) {
//   return (
//     <div className="bg-gray-700/50 rounded-xl p-6 shadow-md">
//       <h2 className="text-2xl font-semibold text-teal-300 mb-4">Billing Summary</h2>
//       <div className="space-y-2">
//         <p className="font-bold">Total Amount: ₹{totalAmount.toFixed(2)}</p>
//         <div className="mt-4">
//           <label className="block text-sm mt-5">Remaining Amount (₹):</label>
//           <input
//             type="number"
//             value={remainingAmount}
//             onChange={(e) => setRemainingAmount(parseFloat(e.target.value) || 0)}
//             className="w-full mt-3 bg-gray-600/50 text-white p-2 rounded-lg border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
//           />
//           <label className="block text-sm mt-5">Porterage Fee (₹):</label>
//           <input
//             type="number"
//             value={porterage}
//             onChange={(e) => setPorterage(parseFloat(e.target.value) || 0)}
//             className="w-full mt-3 bg-gray-600/50 text-white p-2 rounded-lg border border-gray-500 focus:border-teal-400 focus:outline-none transition-all duration-200"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default BillingSummary;






import React from "react";

const BillingSummary = ({
  totalAmount,
  remainingAmount,
  setRemainingAmount,
  porterage,
  setPorterage,
  totalBill,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  note,
  setNote,
  receivedAmount,
  setReceivedAmount,
}) => {
  const handleRemainingChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value)) {
      setRemainingAmount(parseFloat(value) || 0);
    }
  };

  const handlePorterageChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value)) {
      setPorterage(parseFloat(value) || 0);
    }
  };

  const handleDiscountTypeChange = (e) => {
    setDiscountType(e.target.value);
    setDiscountValue(""); // Reset discount value when type changes
  };

  const handleDiscountValueChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value)) {
      setDiscountValue(value);
    }
  };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const handleReceivedAmountChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value)) {
      setReceivedAmount(value);
    }
  };

  const payableAmount = totalBill - (parseFloat(receivedAmount) || 0);

  return (
    <div className="bg-gray-700 p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-teal-300">
        Billing Summary
      </h2>

      <div className="mb-4">
        <div className="font-semibold">Subtotal:</div>
        <div>₹{totalAmount.toFixed(2)}</div>
      </div>

      <div className="mb-4">
        <div className="font-semibold">Porterage:</div>
        <div className="flex items-center space-x-2">
          ₹
          <input
            type="number"
            className="bg-gray-800 text-white rounded px-2 py-1 w-24"
            value={porterage}
            onChange={handlePorterageChange}
            placeholder="Porterage"
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="font-semibold">Remaining Amount (Old Balance):</div>
        <div className="flex items-center space-x-2">
          ₹
          <input
            type="number"
            className="bg-gray-800 text-white rounded px-2 py-1 w-24"
            value={remainingAmount}
            onChange={handleRemainingChange}
            placeholder="Remaining"
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="font-semibold">Discount:</div>
        <div className="flex items-center space-x-2">
          <select
            className="bg-gray-800 text-white rounded px-2 py-1 mr-2"
            value={discountType}
            onChange={handleDiscountTypeChange}
          >
            <option value="fixed">Fixed</option>
            <option value="percentage">Percentage (%)</option>
          </select>
          ₹
          <input
            type="number"
            className="bg-gray-800 text-white rounded px-2 py-1 w-24"
            value={discountValue}
            onChange={handleDiscountValueChange}
            placeholder="Discount Value"
          />
          {discountType === "percentage" && <span>%</span>}
        </div>
      </div>

      <div className="mb-4">
        <div className="font-semibold">Received Amount:</div>
        <div className="flex items-center space-x-2">
          ₹
          <input
            type="number"
            className="bg-gray-800 text-white rounded px-2 py-1 w-24"
            value={receivedAmount}
            onChange={handleReceivedAmountChange}
            placeholder="Received"
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="font-semibold">Note:</div>
        <div>
          <textarea
            className="bg-gray-800 text-white rounded px-2 py-1 w-full"
            value={note}
            onChange={handleNoteChange}
            placeholder="Add a note..."
            rows="2"
          />
        </div>
      </div>


      
    </div>
  );
};

export default BillingSummary;
