import React, { useState } from "react";

export default function CreateOrderModal({
isOpen,
onClose,
onCreate
}) {
const [orderName, setOrderName] =
useState("");

const [deliveryDate, setDeliveryDate] =
useState("");

if (!isOpen) return null;

const handleSubmit = () => {
if (!orderName.trim()) {
alert("Enter Order Name");
return;
}

   
if (!deliveryDate) {
  alert("Select Delivery Date");
  return;
}

onCreate({
  orderName,
  deliveryDate
});

setOrderName("");
setDeliveryDate("");

onClose();
   

};

return ( <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

   
  <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">

    <h2 className="text-xl font-bold text-white mb-4">
      Create Order
    </h2>

    <input
      type="text"
      placeholder="Order Name"
      value={orderName}
      onChange={(e) =>
        setOrderName(e.target.value)
      }
      className="w-full mb-3 bg-gray-700 text-white p-2 rounded"
    />

    <input
      type="date"
      value={deliveryDate}
      onChange={(e) =>
        setDeliveryDate(e.target.value)
      }
      className="w-full mb-4 bg-gray-700 text-white p-2 rounded"
    />

    <div className="flex gap-2">

      <button
        onClick={onClose}
        className="flex-1 bg-gray-600 text-white p-2 rounded"
      >
        Cancel
      </button>

      <button
        onClick={handleSubmit}
        className="flex-1 bg-green-600 text-white p-2 rounded"
      >
        Create
      </button>

    </div>

  </div>

</div>
   

);
}