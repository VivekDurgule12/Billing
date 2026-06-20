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

   

 const loadBills = () => {

    const allBills =
        billHistoryStorage.getBills();

    const sortedBills =
        [...allBills].sort(
            (a, b) => b.id - a.id
        );

    setBills(sortedBills);
};

    const handleDelete = (id) => {

        const confirmDelete =
            window.confirm(
                "Delete this bill?"
            );

        if (!confirmDelete) return;

        billHistoryStorage.deleteBill(id);

        loadBills();
    };

    if (selectedBill && !editMode) {
        return (
            <div className="p-6 bg-gray-900 min-h-screen">

                <button
                    onClick={() => setSelectedBill(null)}
                    className="bg-gray-700 text-white px-4 py-2 rounded mb-4"
                >
                    ← Back
                </button>

                <h1 className="text-2xl text-teal-300 mb-4">
                    Bill Details
                </h1>

                <div className="bg-gray-800 p-4 rounded">

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

                </div>

            </div>
        );
    }


    if (selectedBill && editMode) {

        return (
            <div className="p-6 bg-gray-900 min-h-screen">

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
                                            {item.item}
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
        <div className="p-6 bg-gray-900 min-h-screen">

            <h1 className="text-3xl font-bold text-teal-300 mb-6">
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

                            <div className="flex justify-between">

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

                                </div>

                                <div className="text-right">

                                    <p className="text-white">
                                        ₹ {bill.totals?.total || 0}
                                    </p>

                                    <p className="text-gray-400">
                                        {bill.totals?.totalWeight || 0} Kg
                                    </p>
                                    <td className="text-green-400">
  ₹{bill.totals?.totalProfit || 0}
</td>

                                </div>

                            </div>

                            <div className="flex gap-2 mt-4">

                                <button
                                    onClick={() => {
                                        setSelectedBill(bill);
                                        setEditMode(false);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                >
                                    View
                                </button>

                                <button
  onClick={() => {

    localStorage.setItem(
      "editingBill",
      JSON.stringify(bill)
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