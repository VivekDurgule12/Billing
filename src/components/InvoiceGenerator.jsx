// import React from "react";

// function InvoiceGenerator({ customer, items, totalAmount, remainingAmount }) {
//   // Calculate total quantity of items, ensuring quantity is treated as a number
//   const totalQuantity = items.reduce((sum, item) => {
//     const quantityValue = Number(item.quantity) || 0; // Convert to number, default to 0 if NaN or not a number
//     return sum + quantityValue;
//   }, 0);

//   return (
//     <div className="bg-gray-700/50 rounded-xl p-6 shadow-md">
//       <h2 className="text-2xl font-semibold text-teal-300 mb-4">
//         Invoice Preview
//       </h2>
//       <div className="space-y-4">
//         <div>
//           <p>
//             <strong>Customer:</strong> {customer.name || "N/A"}
//           </p>
//           {/* <p><strong>Email:</strong> {customer.email || 'N/A'}</p> */}
//           <p>
//             <strong>Address:</strong> {customer.address || "N/A"}
//           </p>
//           <p>
//             <strong>Phone:</strong> {customer.phone || "N/A"}
//           </p>
//           <p>
//             <strong>Date:</strong> {customer.date || "N/A"}
//           </p>
//         </div>
//         <div>
//           <h3 className="font-semibold">Items:</h3>
//           {items.map((item, index) => (
//             <p key={item.id}>
//               {index + 1}. {item.name || "Unnamed"} - Qty:{item.quantity || "0"}{" "}
//               * ₹{item.price || "0"} - ₹{item.total.toFixed(2)}
//             </p>
//           ))}
//         </div>
//         <div>
//           {/* Display total quantity (if this is what you intended for "Weight") */}
//           <p>Weight:  {totalQuantity.toFixed(2)} Kg.</p>
//           <p className="font-bold">Total: ₹{totalAmount.toFixed(2)}</p>
//           <p>Remaining: ₹{remainingAmount.toFixed(2)}</p>
//           <p>Total Bill: ₹{(remainingAmount + totalAmount).toFixed(2)}</p> {/* Changed label to "Total Bill" */}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default InvoiceGenerator;








import React from "react";

const InvoiceGenerator = ({
  customer,
  items,
  totalAmount,
  remainingAmount,
  porterage,
  totalBill,
  discountAmount,
  discountType,
  discountValue,
  note,
  receivedAmount,
  payableAmount,
  totalQuantity,
}) => {
  return (
    <div className="bg-gray-700 p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-teal-300">
        Invoice Preview
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-2">
          Customer Information
        </h3>
        <p>
          <strong>Name:</strong> {customer.name || "N/A"}
        </p>
        <p>
          <strong>Address:</strong> {customer.address || "N/A"}
        </p>
        <p>
          <strong>Phone:</strong> {customer.phone || "N/A"}
        </p>
        <p>
          <strong>Date:</strong> {customer.date || "N/A"}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Items</h3>
        {items.map((item, index) => (
          <p key={item.id}>
            {index + 1}. {item.name || "Unnamed"}Qty: {item.quantity || 0}x ₹
            {item.price || 0}= ₹{item.total.toFixed(2)}
          </p>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Summary</h3>
        <p>
          <strong>Subtotal:</strong> ₹{totalAmount.toFixed(2)}
        </p>
        <p>
          <strong>Previous Remaining:</strong> ₹{remainingAmount.toFixed(2)}
        </p>
        <p>
          <strong>Porterage Fee:</strong> ₹{porterage.toFixed(2)}
        </p>
        {discountValue && (
          <p>
            <strong>Discount ({discountType === 'percentage' ? discountValue + '%' : '₹' + discountValue}):</strong> -₹{discountAmount.toFixed(2)}
          </p>
        )}
        <p>
          <strong>Total Bill:</strong> ₹{totalBill.toFixed(2)}
        </p>
        <p>
          <strong>Received Amount:</strong> ₹{(parseFloat(receivedAmount) || 0).toFixed(2)}
        </p>
        <p>
          <strong>Payable Amount:</strong> ₹{payableAmount.toFixed(2)}
        </p>
        {note && (
          <p>
            <strong>Note:</strong> {note}
          </p>
        )}
      </div>
    </div>
  );
};

export default InvoiceGenerator;