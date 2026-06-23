import React from "react";
import { orderStorage }
  from "../utils/orderStorage";
import InvoiceTemplate from "./InvoiceTemplate";
import { generateOrderPDF }
  from "../utils/generateOrderPDF";

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

  return (<div className="p-3 sm:p-6 bg-gray-900 min-h-screen">



    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">

      <button
        onClick={onBack}
        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
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
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Download PDF
      </button>

      <h1 className="text-xl sm:text-2xl font-bold text-teal-300 text-center sm:text-left">
        {order.orderName}
      </h1>

    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

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

        <table className="w-full min-w-[1000px] text-white">

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
                  <td className="p-3 text-green-400">
  ₹{bill.totals?.totalProfit || 0}
</td>


                  <td className="p-3">
                    {new Date(
                      bill.billDateTime
                    ).toLocaleString()}
                  </td>

                  <td className="p-3">

                    <div className="flex flex-wrap gap-2">
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


      {order.bills?.map((bill, index) => {

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
