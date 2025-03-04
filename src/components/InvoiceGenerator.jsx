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

const InvoiceGenerator = ({ customer, items, totalAmount, remainingAmount, porterage, totalBill }) => {
    return (
        <div className="bg-gray-700/70 backdrop-blur-md rounded-2xl p-6 shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-teal-300">Invoice Preview</h2>

            <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Customer Information</h3>
                <p className="text-gray-400">Name: {customer.name || "N/A"}</p>
                <p className="text-gray-400">Address: {customer.address || "N/A"}</p>
                <p className="text-gray-400">Phone: {customer.phone || "N/A"}</p>
                <p className="text-gray-400">Date: {customer.date || "N/A"}</p>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Items</h3>
                {items.length > 0 ? (
                    <ul className="list-none">
                        {items.map((item, index) => (
                            <li key={item.id} className="py-2 border-b border-gray-600 last:border-b-0">
                                <span className="text-gray-400">{index + 1}.</span>
                                <span className="text-gray-400 ml-2">{item.name || "Unnamed"}</span>
                                <span className="text-gray-400 ml-2">Qty: {item.quantity || "0"}</span>
                                <span className="text-gray-400 ml-2">x ₹{item.price || "0"}</span>
                                <span className="text-gray-400 ml-2">= ₹{item.total.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No items added yet.</p>
                )}
            </div>

            <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Summary</h3>
                <p className="text-gray-400  font-semibold text-white">Total: ₹{totalAmount.toFixed(2)}</p>
                <p className="text-gray-400  font-semibold text-white">Previous Remaining: ₹{remainingAmount.toFixed(2)}</p>
                 <p className="text-gray-400  font-semibold text-white">Porterage Fee: ₹{porterage.toFixed(2)}</p>
                <p className="text-gray-400 font-semibold text-white">Total Bill: ₹{totalBill.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default InvoiceGenerator;

