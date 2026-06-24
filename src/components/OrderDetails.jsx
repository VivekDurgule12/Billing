import React from "react";
import { orderStorage }
  from "../utils/orderStorage";
import InvoiceTemplate from "./InvoiceTemplate";
import { generateOrderPDF }
  from "../utils/generateOrderPDF";
  import { useState } from "react";

export default function OrderDetails({
  order,
  onBack,
  onDeleteBill
}) {
  console.log("OrderDetails Loaded");
  console.log(order);

  if (!order) {
    return null;
  }
  const freshOrders =
  orderStorage.getOrders();

const currentOrder =
  freshOrders.find(
    o => o.id === order.id
  ) || order;

const [selectedBill, setSelectedBill] =
  useState(null);

const [editMode, setEditMode] =
  useState(false);
  

  const toggleBillPacked = billId => {
  console.log(
    "PACK CLICKED",
    billId
  );
};

const toggleBillLoaded = billId => {
  console.log(
    "LOAD CLICKED",
    billId
  );
};

  console.log(
    "ORDER BILLS",
     currentOrder.bills
  );

const totalBills =
  currentOrder.bills?.length || 0;

  const packedBills =
     currentOrder.bills?.filter(bill =>
      bill.items?.every(
        item => item.packed
      )
    ).length || 0;

  const loadedBills =
     currentOrder.bills?.filter(bill =>
      bill.items?.every(
        item => item.loaded
      )
    ).length || 0;

  const packingPercentage =
    totalBills > 0
      ? Math.round(
        (packedBills /
          totalBills) *
        100
      )
      : 0;

  const loadingPercentage =
    totalBills > 0
      ? Math.round(
        (loadedBills /
          totalBills) *
        100
      )
      : 0;

let orderStatus =
  "Not Started";

if (
  packingPercentage > 0 &&
  packingPercentage < 100
) {
  orderStatus =
    "Packing";
}

if (
  packingPercentage === 100 &&
  loadingPercentage === 0
) {
  orderStatus =
    "Ready To Load";
}

if (
  packingPercentage === 100 &&
  loadingPercentage > 0 &&
  loadingPercentage < 100
) {
  orderStatus = "Loading";
}

if (
  loadingPercentage === 100
) {
  orderStatus =
    "Completed";
}

  const totalWeight =
     currentOrder.bills?.reduce(
      (sum, bill) =>
        sum +
        (bill.totals?.totalWeight || 0),
      0
    ) || 0;

  const packedWeight =
     currentOrder.bills?.reduce(
      (sum, bill) => {

        const billPackedWeight =
          bill.items?.reduce(
            (itemSum, item) => {

              if (!item.packed)
                return itemSum;

              return (
                itemSum +
                (
                  (item.weightPerUnit || 0) *
                  (item.qty || 0)
                )
              );

            },
            0
          ) || 0;

        return (
          sum +
          billPackedWeight
        );

      },
      0
    ) || 0;

  const loadedWeight =
     currentOrder.bills?.reduce(
      (sum, bill) => {

        const billLoadedWeight =
          bill.items?.reduce(
            (itemSum, item) => {

              if (!item.loaded)
                return itemSum;

              return (
                itemSum +
                (
                  (item.weightPerUnit || 0) *
                  (item.qty || 0)
                )
              );

            },
            0
          ) || 0;

        return (
          sum +
          billLoadedWeight
        );

      },
      0
    ) || 0;

  const remainingWeight =
    totalWeight - loadedWeight;

  const moveBillUp = index => {

    if (index === 0) return;

    const orders =
      orderStorage.getOrders();

    const updatedOrders =
      orders.map(o => {

        if (o.id !== order.id) {
          return o;
        }

        const bills =
          [...o.bills];

        [
          bills[index - 1],
          bills[index]
        ] = [
            bills[index],
            bills[index - 1]
          ];

        return {
          ...o,
          bills
        };

      });

    orderStorage.saveOrders(
      updatedOrders
    );

    window.dispatchEvent(
      new Event("storage")
    );
  };

  const moveBillDown = index => {

    if (
      index ===
       currentOrder.bills.length - 1
    ) {
      return;
    }

    const orders =
      orderStorage.getOrders();

    const updatedOrders =
      orders.map(o => {

        if (o.id !== order.id) {
          return o;
        }

        const bills =
          [...o.bills];

        [
          bills[index],
          bills[index + 1]
        ] = [
            bills[index + 1],
            bills[index]
          ];

        return {
          ...o,
          bills
        };

      });

    orderStorage.saveOrders(
      updatedOrders
    );

    window.dispatchEvent(
      new Event("storage")
    );
  };


const totalItemCount =
  selectedBill?.items?.length || 0;

const packedCount =
  selectedBill?.items?.filter(
    item => item.packed
  ).length || 0;

const loadedCount =
  selectedBill?.items?.filter(
    item => item.loaded
  ).length || 0;

const billPackingPercentage =
  totalItemCount > 0
    ? Math.round(
        (packedCount /
          totalItemCount) *
          100
      )
    : 0;

const billLoadingPercentage =
  totalItemCount > 0
    ? Math.round(
        (loadedCount /
          totalItemCount) *
          100
      )
    : 0;
    
     

    const togglePacked = (itemIndex) => {

  const updatedBill = {
    ...selectedBill,
    items: [...selectedBill.items]
  };

  updatedBill.items[itemIndex] = {
    ...updatedBill.items[itemIndex],
    packed: !updatedBill.items[itemIndex].packed
  };

  const allOrders =
    orderStorage.getOrders();

  const updatedOrders =
    allOrders.map(o => {

      if (o.id !== order.id) {
        return o;
      }

      return {
        ...o,
        bills: o.bills.map(b =>
          b.id === updatedBill.id
            ? updatedBill
            : b
        )
      };
    });

  orderStorage.saveOrders(
    updatedOrders
  );

  setSelectedBill(updatedBill);
};
   const toggleLoaded = (itemIndex) => {
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
    ...selectedBill,
    items: [...selectedBill.items]
  };

  updatedBill.items[itemIndex] = {
    ...updatedBill.items[itemIndex],
    loaded: !updatedBill.items[itemIndex].loaded
  };

  const allOrders =
    orderStorage.getOrders();

  const updatedOrders =
    allOrders.map(o => {

      if (o.id !== order.id) {
        return o;
      }

      return {
        ...o,
        bills: o.bills.map(b =>
          b.id === updatedBill.id
            ? updatedBill
            : b
        )
      };
    });

  orderStorage.saveOrders(
    updatedOrders
  );

  setSelectedBill(updatedBill);
};
if (selectedBill && !editMode) {



  const totalItems =
  selectedBill?.items?.length || 0;

const totalQty =
  selectedBill?.items?.reduce(
    (sum, item) =>
      sum + Number(item.qty || 0),
    0
  ) || 0;

const totalAmount =
  selectedBill?.items?.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  ) || 0;

const totalCost =
  selectedBill?.items?.reduce(
    (sum, item) =>
      sum +
      (
        Number(item.costPrice || 0) *
        Number(item.qty || 0)
      ),
    0
  ) || 0;

const totalProfit =
  totalAmount - totalCost;
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
        {billPackingPercentage}%
      </span>
    </div>

    <div className="w-full bg-gray-700 rounded h-4">

      <div
        className="bg-green-500 h-4 rounded"
        style={{
          width: `${billPackingPercentage}%`
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
          width: `${billLoadingPercentage}%`
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


        const costPrice =
  Number(item.costPrice || 0);

const totalCost =
  costPrice *
  Number(item.qty || 0);

const itemProfit =
  (
    Number(item.rate || 0) -
    costPrice
  ) *
  Number(item.qty || 0);


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
 <td className="border border-gray-600 p-2 text-center">
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
</td>
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


  return (<div className="p-3 sm:p-6 bg-gray-900 min-h-screen">




    <div className="bg-gray-800 rounded-xl p-5 mb-6 shadow-lg">

  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">

    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-teal-300">
        {order.orderName}
      </h1>

      <p className="text-gray-400 mt-1">
        Delivery Date : {order.deliveryDate}
      </p>
    </div>

    <div className="flex flex-wrap gap-3">

      <button
        onClick={onBack}
        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
      >
        ← Back
      </button>

      <button
        onClick={() =>
          generateOrderPDF(
            order.orderName,
            order.deliveryDate
          )
        }
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
      >
        Download PDF
      </button>

    </div>

  </div>

</div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
   
   
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

  {/* Status + Packing */}
  <div className="bg-gray-800 p-5 rounded-xl">

    <div className="flex justify-between items-center mb-4">

      <div>
        <p className="text-gray-400 text-sm">
          Order Status
        </p>

        <h2
          className={`text-2xl font-bold ${
            orderStatus === "Completed"
              ? "text-green-400"
              : orderStatus === "Loading"
              ? "text-blue-400"
              : orderStatus === "Ready To Load"
              ? "text-yellow-400"
              : orderStatus === "Packing"
              ? "text-orange-400"
              : "text-red-400"
          }`}
        >
          {orderStatus}
        </h2>
      </div>

      <div className="text-right">
        <p className="text-green-400 font-bold text-xl">
          {packingPercentage}%
        </p>
      </div>

    </div>

    <p className="text-white mb-2">
      Packing Progress
    </p>

    <div className="w-full bg-gray-700 rounded-full h-3">
      <div
        className="bg-green-500 h-3 rounded-full"
        style={{
          width: `${packingPercentage}%`
        }}
      />
    </div>

    <p className="text-gray-300 mt-2 text-sm">
      {packedBills} / {totalBills} Bills Packed
    </p>

  </div>

  {/* Loading */}
  <div className="bg-gray-800 p-5 rounded-xl">

    <div className="flex justify-between items-center mb-4">

      <p className="text-white">
        Loading Progress
      </p>

      <p className="text-blue-400 font-bold text-xl">
        {loadingPercentage}%
      </p>

    </div>

    <div className="w-full bg-gray-700 rounded-full h-3">
      <div
        className="bg-blue-500 h-3 rounded-full"
        style={{
          width: `${loadingPercentage}%`
        }}
      />
    </div>

    <p className="text-gray-300 mt-2 text-sm">
      {loadedBills} / {totalBills} Bills Loaded
    </p>

  </div>

</div>

   <div className="bg-gray-800 rounded-xl p-4 mb-6">

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">

    <div>
      <p className="text-gray-400 text-sm">
        Bills
      </p>
      <p className="text-white font-bold text-xl">
        {currentOrder.billCount}
      </p>
    </div>

    <div>
      <p className="text-gray-400 text-sm">
        Customers
      </p>
      <p className="text-white font-bold text-xl">
        {currentOrder.customerCount}
      </p>
    </div>

    <div>
      <p className="text-gray-400 text-sm">
        Total Weight
      </p>
      <p className="text-teal-300 font-bold text-xl">
        {totalWeight.toFixed(2)} KG
      </p>
    </div>

    <div>
      <p className="text-gray-400 text-sm">
        Remaining
      </p>
      <p className="text-red-400 font-bold text-xl">
        {remainingWeight.toFixed(2)} KG
      </p>
    </div>

  </div>

</div>

      <div className="bg-gray-800 p-4 rounded">
        <p className="text-gray-400">
          Delivery Date
        </p>

        <p className="text-white font-bold">
          {order.deliveryDate}
        </p>
      </div>

      <div className="bg-gray-800 p-4 rounded">
        <p className="text-gray-400">
          Total Weight
        </p>

        <p className="text-white font-bold">
          {Number(
            order.totalWeight || 0
          ).toFixed(2)}
        </p>
      </div>

      <div className="bg-gray-800 p-4 rounded">
        <p className="text-gray-400">
          Bills
        </p>

        <p className="text-white font-bold">
          {order.billCount || 0}
        </p>
      </div>

      <div className="bg-gray-800 p-4 rounded">
        <p className="text-gray-400">
          Customers
        </p>

        <p className="text-white font-bold">
          {order.customerCount || 0}
        </p>
      </div>


    </div>

    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">

        <table className="w-full min-w-[700px] text-white text-sm">

          <thead className="bg-gray-700">

            <tr>
              <th className="p-3">
                Bill No
              </th>

              <th className="p-3">
                Customer
              </th>

             <th className="hidden md:table-cell">
  Mobile
</th>
              <th className="p-3">
                Packed
              </th>

              <th className="p-3">
                Loaded
              </th>

              <th className="p-3">
                Weight
              </th>

              <th className="p-3">
                Amount
              </th>
              <th className="p-3">
                Profit
              </th>
              <th className="p-3">
                Date & Time
              </th>

              <th className="p-3">
                Action
              </th>
            </tr>

          </thead>

          <tbody>

            { currentOrder.bills?.length > 0 ? (

               currentOrder.bills.map((bill, index) => (

                <tr
                  key={bill.id}
                  className="border-t border-gray-700"
                >

                  <td className="p-3">
                    {index + 1}
                  </td>

                  <td className="p-3">
                    {bill.customer?.name}
                  </td>

                  <td className="p-3">
                    {bill.customer?.mobile}
                  </td>


                  <td>
                    <button
                      onClick={() =>
                        toggleBillPacked(
                          bill.id
                        )
                      }
                      className={`px-2 py-1 rounded ${bill.items?.every(
                        i => i.packed
                      )
                          ? "bg-green-600"
                          : "bg-gray-600"
                        }`}
                    >
                      📦
                    </button></td>
                  <td>
                    <button
                      onClick={() =>
                        toggleBillLoaded(
                          bill.id
                        )
                      }
                      className={`px-2 py-1 rounded ${bill.items?.every(
                        i => i.loaded
                      )
                          ? "bg-blue-600"
                          : "bg-gray-600"
                        }`}
                    >
                      🚚
                    </button></td>
                  <td className="p-3">
                    {bill.totals?.totalWeight || 0}
                  </td>

                  <td className="p-3">
                    ₹{bill.totals?.total || 0}
                  </td>
                  <td className="p-3 text-green-400">
                    ₹{bill.totals?.totalProfit || 0}
                  </td>


                  <td className="p-3">
                    {new Date(
                      bill.billDateTime
                    ).toLocaleString()}
                  </td>

                  <td className="p-3">

                    <div className="flex flex-col md:flex-row gap-2">
                      <button
                        onClick={() =>
                          moveBillUp(index)
                        }
                        className="bg-gray-600 px-2 py-1 rounded"
                      >
                        ↑
                      </button>

                      <button
                        onClick={() =>
                          moveBillDown(index)
                        }
                        className="bg-gray-600 px-2 py-1 rounded"
                      >
                        ↓
                      </button>

                      <button
  onClick={() => {
    setSelectedBill(bill);
  }}
  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs sm:text-sm"
>
  View
</button>

                      <button
                        onClick={() => {

                          localStorage.setItem(
                            "editingBill",
                            JSON.stringify(bill)
                          );

                          window.location.reload();

                        }}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {

                          if (
                            window.confirm(
                              "Delete this bill?"
                            )
                          ) {
                            onDeleteBill(bill.id);
                          }

                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="6"
                  className="p-6 text-center text-gray-400"
                >
                  No Bills In This Order
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
    {/* Hidden PDF Template */}

   <div
  id="order-pdf-template"
  style={{
    position: "fixed",
    left: "-99999px",
    top: 0,
    width: "800px",
    background: "#fff",
    zIndex: -1
  }}
>


      { currentOrder.bills?.map((bill, index) => {

        const ITEMS_PER_PAGE = 18;

        const pages = [];

        for (
          let i = 0;
          i < (bill.items || []).length;
          i += ITEMS_PER_PAGE
        ) {
          pages.push(
            bill.items.slice(
              i,
              i + ITEMS_PER_PAGE
            )
          );
        }

        return pages.map(
          (pageItems, pageIndex) => (
            <div
              key={`${bill.id}-${pageIndex}`}
              className="order-invoice"
              style={{
                marginBottom: "20px",
                width: "100%",
                maxWidth: "none",
                margin: 0,
                padding: "8px",
                boxSizing: "border-box",
              }}
            >
              <InvoiceTemplate
                customerData={bill.customer || {}}
                lineItems={pageItems}
                totals={bill.totals}
                summary={bill.summary}
                invoiceNumber={index + 1}
                totalItems={bill.items.length}
                startIndex={pageIndex * ITEMS_PER_PAGE}
                showSummary={
                  pageIndex === pages.length - 1
                }
              />
            </div>
          )
        );

      })}


    </div>

  </div>


  );
}