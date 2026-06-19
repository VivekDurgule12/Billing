import React from "react";
import { orderStorage }
  from "../utils/orderStorage";

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
      order.bills.length - 1
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

  return (<div className="p-6 bg-gray-900 min-h-screen">


    <div className="flex justify-between items-center mb-6">

      <button
        onClick={onBack}
        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-teal-300">
        {order.orderName}
      </h1>

    </div>

    <div className="grid grid-cols-4 gap-4 mb-6">

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

      <table className="w-full text-white">

        <thead className="bg-gray-700">

          <tr>
            <th className="p-3">
              Bill No
            </th>

            <th className="p-3">
              Customer
            </th>

            <th className="p-3">
              Mobile
            </th>

            <th className="p-3">
              Weight
            </th>

            <th className="p-3">
              Amount
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

          {order.bills?.length > 0 ? (

            order.bills.map((bill, index) => (

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

                <td className="p-3">
                  {bill.totals?.totalWeight || 0}
                </td>

                <td className="p-3">
                  ₹{bill.totals?.total || 0}
                </td>


                <td className="p-3">
                  {new Date(
                    bill.billDateTime
                  ).toLocaleString()}
                </td>

                <td className="p-3">

                  <div className="flex gap-2">
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

                        localStorage.setItem(
                          "viewBill",
                          JSON.stringify(bill)
                        );

                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
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


  );
}
