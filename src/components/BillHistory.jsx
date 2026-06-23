import React, { useState, useEffect } from "react";
import { billHistoryStorage } from "../utils/billHistoryStorage";

export default function BillHistory({
    setCurrentPage
}) {

    const [bills, setBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        loadBills();
    }, []);

   const inventory = JSON.parse(
  localStorage.getItem("inventoryData")
) || [];

 const loadBills = () => {

    const allBills =
        billHistoryStorage.getBills();

    const sortedBills =
        [...allBills].sort(
            (a, b) => b.id - a.id
        );

    setBills(sortedBills);
};


const totalItems =
  selectedBill?.items?.length || 0;

const totalQty =
  selectedBill?.items?.reduce(
    (sum, item) =>
      sum + (item.qty || 0),
    0
  ) || 0;

const totalAmount =
  selectedBill?.items?.reduce(
    (sum, item) =>
      sum + (item.amount || 0),
    0
  ) || 0;

const totalCost =
  selectedBill?.items?.reduce(
    (sum, item) =>
      sum +
      ((item.costPrice || 0) *
        (item.qty || 0)),
    0
  ) || 0;

const totalProfit =
  selectedBill?.items?.reduce(
    (sum, item) =>
      sum +
      (((item.rate || 0) -
        (item.costPrice || 0)) *
        (item.qty || 0)),
    0
  ) || 0;


    const handleDelete = (id) => {

        const confirmDelete =
            window.confirm(
                "Delete this bill?"
            );

        if (!confirmDelete) return;

        billHistoryStorage.deleteBill(id);

        loadBills();
    };
    
  const togglePacked = itemIndex => {

  const updatedBill = {
    ...selectedBill
  };

  updatedBill.items[itemIndex].packed =
    !updatedBill.items[itemIndex].packed;

  const allBills =
    billHistoryStorage.getBills();

  const updatedBills =
    allBills.map(b =>
      b.id === updatedBill.id
        ? updatedBill
        : b
    );

  localStorage.setItem(
    "billHistoryData",
    JSON.stringify(updatedBills)
  );

  setSelectedBill({
    ...updatedBill
  });
};

const toggleLoaded = itemIndex => {

    if (
  !selectedBill.items[itemIndex]
    ?.packed
) {
  alert(
    "Pack item first"
  );
  return;
}
  const updatedBill = {
    ...selectedBill
  };

  updatedBill.items[itemIndex].loaded =
    !updatedBill.items[itemIndex].loaded;

  const allBills =
    billHistoryStorage.getBills();

  const updatedBills =
    allBills.map(b =>
      b.id === updatedBill.id
        ? updatedBill
        : b
    );

  localStorage.setItem(
    "billHistoryData",
    JSON.stringify(updatedBills)
  );

  setSelectedBill({
    ...updatedBill
  });
};

const packedCount =
  selectedBill?.items?.filter(
    item => item.packed
  ).length || 0;

const loadedCount =
  selectedBill?.items?.filter(
    item => item.loaded
  ).length || 0;

const totalItemCount =
  selectedBill?.items?.length || 0;

const packingPercentage =
  totalItemCount > 0
    ? Math.round(
        (packedCount /
          totalItemCount) *
          100
      )
    : 0;

const loadingPercentage =
  totalItemCount > 0
    ? Math.round(
        (loadedCount /
          totalItemCount) *
          100
      )
    : 0;




    if (selectedBill && !editMode) {
        return (
            <div className="p-3 sm:p-6 bg-gray-900 min-h-screen">

                <button
                    onClick={() => setSelectedBill(null)}
                    className="bg-gray-700 text-white px-4 py-2 rounded mb-4"
                >
                    ← Back
                </button>

                <h1 className="text-2xl text-teal-300 mb-4">
                    Bill Details
                </h1>

                <div className="bg-gray-800 p-3 sm:p-4 rounded">

                    <p className="text-white">
                        Customer:
                        {" "}
                        {selectedBill.customer?.name}
                    </p>

                    <p className="text-white">
                        Mobile:
                        {" "}
                        {selectedBill.customer?.mobile}
                    </p>

                    <p className="text-white">
                        Total:
                        ₹{selectedBill.totals?.total}
                    </p>

<div className="mt-4">

  <div className="mb-3">

    <div className="flex justify-between text-sm text-white mb-1">
      <span>
        Packing Progress
      </span>

      <span>
        {packingPercentage}%
      </span>
    </div>

    <div className="w-full bg-gray-700 rounded h-4">

      <div
        className="bg-green-500 h-4 rounded"
        style={{
          width: `${packingPercentage}%`
        }}
      />

    </div>

    <p className="text-xs text-gray-300 mt-1">
      {packedCount} / {totalItemCount} Packed
    </p>

  </div>

  <div>

    <div className="flex justify-between text-sm text-white mb-1">
      <span>
        Loading Progress
      </span>

      <span>
        {loadingPercentage}%
      </span>
    </div>

    <div className="w-full bg-gray-700 rounded h-4">

      <div
        className="bg-blue-500 h-4 rounded"
        style={{
          width: `${loadingPercentage}%`
        }}
      />

    </div>

    <p className="text-xs text-gray-300 mt-1">
      {loadedCount} / {totalItemCount} Loaded
    </p>

  </div>

</div>

<div className="overflow-x-auto mt-4">
  <table className="min-w-[700px] w-full border border-gray-600 text-white text-center text-sm">
  <thead className="bg-gray-700">
   <tr>
  <th className="border border-gray-600 p-2">
    Packed
  </th>

  <th className="border border-gray-600 p-2">
    Loaded
  </th>

  <th className="border border-gray-600 p-2">
    Sr No
  </th>

  <th className="border border-gray-600 p-2">
    Item Name
  </th>

  <th className="border border-gray-600 p-2">
    Qty
  </th>

  <th className="border border-gray-600 p-2">
    Rate
  </th>

  <th className="border border-gray-600 p-2">
    Amount
  </th>

  <th className="border border-gray-600 p-2">
    Cost
  </th>

  <th className="border border-gray-600 p-2">
    Profit
  </th>
</tr>
  </thead>

  <tbody>
    {selectedBill.items?.map(
      (item, index) => {


        const inventoryItem =
  inventory.find(
    inv => inv.sn === item.sn
  );

const actualCostPrice =
  inventoryItem?.costPrice || 0;

const itemProfit =
  (
    (item.rate || 0) -
    actualCostPrice
  ) *
  (item.qty || 0);

const totalCost =
  actualCostPrice *
  (item.qty || 0);


        console.log(
  "SELECTED BILL ITEMS",
  selectedBill.items
);

       

        return (
          <tr
            key={index}
            className="border border-gray-600 hover:bg-gray-700"
          >
           <td className="border border-gray-600 p-2 text-center">
  <input
    type="checkbox"
    checked={item.packed || false}
    onChange={() =>
      togglePacked(index)
    }
  />
</td>

<input
  type="checkbox"
  checked={item.loaded || false}
  disabled={!item.packed}
  onChange={() =>
    toggleLoaded(index)
  }
  className={
    !item.packed
      ? "cursor-not-allowed opacity-50"
      : ""
  }
/>
            <td className="border border-gray-600 p-2">
              {index + 1}
            </td>

            <td className="border border-gray-600 p-2 text-left">
              {item.name}
            </td>

            <td className="border border-gray-600 p-2">
              {item.qty}
            </td>

            <td className="border border-gray-600 p-2">
              ₹{item.rate}
            </td>

            <td className="border border-gray-600 p-2">
              ₹{item.amount}
            </td>

            <td className="border border-gray-600 p-2">
            ₹{totalCost}
            </td>

            <td className="border border-gray-600 p-2 text-green-400 font-semibold">
              ₹{itemProfit}
            </td>
           
          </tr>
          
          
        );
      }
    )}

  <tr className="bg-gray-700 font-bold text-xs sm:text-sm">
  <td
    colSpan="4"
    className="border border-gray-600 p-2 text-center"
  >
    TOTAL
  </td>

  <td className="border border-gray-600 p-2">
    {totalQty}
  </td>

  <td className="border border-gray-600 p-2">
    -
  </td>

  <td className="border border-gray-600 p-2 text-teal-300">
    ₹{totalAmount}
  </td>

  <td className="border border-gray-600 p-2 text-yellow-300">
    ₹{totalCost}
  </td>

  <td className="border border-gray-600 p-2 text-green-400">
    ₹{totalProfit}
  </td>
</tr>

  </tbody>
</table>
</div>



                </div>

            </div>
        );
    }


    if (selectedBill && editMode) {

        return (
            <div className="p-3 sm:p-6 bg-gray-900 min-h-screen">

                <button
                    onClick={() => {
                        setSelectedBill(null);
                        setEditMode(false);
                    }}
                    className="bg-gray-700 text-white px-4 py-2 rounded mb-4"
                >
                    ← Back
                </button>

                <h1 className="text-2xl text-yellow-400 mb-4">
                    Edit Bill
                </h1>

                <div className="bg-gray-800 rounded-lg p-4">

                    <h2 className="text-white text-xl mb-4">
                        {selectedBill.customer?.name}
                    </h2>

                    <table className="w-full text-white">

                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Rate</th>
                                <th>Amount</th>
                                <th>Profit</th>
                            </tr>
                        </thead>

                        <tbody>

                            {selectedBill.items?.map(
                                (item, index) => (

                                    <tr key={index}>

                                        <td>
                                            {item.name}
                                        </td>

                                        <td>
                                            {item.qty}
                                        </td>

                                        <td>
                                            ₹{item.rate}
                                        </td>

                                        <td>
                                            ₹{item.amount}
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>
        );
    }
    return (
        <div className="p-3 sm:p-6 bg-gray-900 min-h-screen">

            <h1 className="text-2xl sm:text-3xl font-bold text-teal-300 mb-6">
                Bill History
            </h1>

            {bills.length === 0 ? (

                <div className="bg-gray-800 p-8 rounded text-center">
                    <h2 className="text-gray-300 text-xl">
                        No Bills Found
                    </h2>
                </div>

            ) : (

                <div className="space-y-4">

                    {bills.map((bill, index) => (

                        <div
                            key={bill.id}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-5"
                        >

                            <div className="flex flex-col sm:flex-row sm:justify-between gap-3">

                                <div>

                                    <h2 className="text-white font-bold text-lg">
                                        Bill #{index + 1}
                                    </h2>

                                    <p className="text-gray-400">
                                        {bill.customer?.name}
                                    </p>

                                    <p className="text-gray-400">
                                        {bill.customer?.mobile}
                                    </p>

                                    <p className="text-gray-400 text-sm">
                                                    {new Date(
                                                        bill.billDateTime ||
                                                        bill.createdAt
                                                    ).toLocaleString("en-IN")}
                                                    </p>

                                </div>

                                <div className="text-right">

                                    <p className="text-white">
                                        ₹ {bill.totals?.total || 0}
                                    </p>

                                    <p className="text-gray-400">
                                        {bill.totals?.totalWeight || 0} Kg
                                    </p>
                                    <p className="text-green-400">
                                Profit: ₹{bill.totals?.totalProfit || 0}
                                </p>

                                </div>

                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                               <button
  onClick={() => {
    console.log("VIEW CLICKED");
    console.log(bill);

    setSelectedBill(bill);
    setEditMode(false);
  }}
  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
  View
</button>

                                <button
  onClick={() => {

    console.log(
      "EDIT CLICKED",
      bill.id,
      bill.customer?.name
    );

    localStorage.setItem(
      "editingBill",
      JSON.stringify(bill)
    );

    console.log(
      "SAVED",
      JSON.parse(
        localStorage.getItem(
          "editingBill"
        )
      )
    );

    setCurrentPage(
      "billing"
    );

  }}
  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
>
  Edit
</button>


                                <button
                                    onClick={() =>
                                        handleDelete(bill.id)
                                    }
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}