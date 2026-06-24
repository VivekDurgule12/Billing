import React, {
  useState,
  useEffect
} from "react";


import OrderDetails from "./OrderDetails";

import CreateOrderModal
  from "./CreateOrderModal";

import {
  orderStorage
} from "../utils/orderStorage";

import { generateOrderPDF }
  from "../utils/generateOrderPDF";




export default function OrdersModule() {

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);

const [showWhatsAppModal,
  setShowWhatsAppModal] =
  useState(false);

const [whatsappNumber,
  setWhatsappNumber] =
  useState("");

const [selectedOrderForShare,
  setSelectedOrderForShare] =
  useState(null);

const [shareType,
  setShareType] =
  useState("stock");


  const loadOrders = () => {
    setOrders(
      orderStorage.getOrders()
    );
  };



  


  const getOrderProfit = (order) => {
    return (order.bills || []).reduce(
      (sum, bill) =>
        sum + (bill.totals?.totalProfit || 0),
      0
    );
  };


  useEffect(() => {

    loadOrders();

    const handleStorage = () => {
      loadOrders();
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () =>
      window.removeEventListener(
        "storage",
        handleStorage
      );

  }, []);

  // useEffect(() => {
  //   loadOrders();
  // }, []);


  const handleDeleteBill = (
    orderId,
    billId
  ) => {

    const orders =
      orderStorage.getOrders();

    const updatedOrders =
      orders.map(order => {


        
        if (order.id !== orderId) {
          return order;
        }

        const bills =
          order.bills.filter(
            bill =>
              bill.id !== billId
          );

        return {
          ...order,
          bills,
          billCount:
            bills.length,
          customerCount:
            new Set(
              bills.map(
                b =>
                  b.customer?.mobile
              )
            ).size,
          totalWeight:
            bills.reduce(
              (sum, b) =>
                sum +
                (b.totals?.totalWeight || 0),
              0
            )
        };
      });

    orderStorage.saveOrders(
      updatedOrders
    );

    loadOrders();
  };





  const currentSelectedOrder =
    selectedOrder
      ? orders.find(
        o => o.id === selectedOrder.id
      )
      : null;

  if (currentSelectedOrder) {
    return (
      <OrderDetails
        order={currentSelectedOrder}
        onBack={() =>
          setSelectedOrder(null)
        }
        onDeleteBill={billId =>
          handleDeleteBill(
            currentSelectedOrder.id,
            billId
          )
        }
      />
    );
  }



  const handleCreateOrder = (data) => {


    console.log(data);

    orderStorage.createOrder(data);

    console.log(
      localStorage.getItem(
        "orderBatchesData"
      )
    );

    loadOrders();
  };

  const handleDeleteOrder =
    (id) => {


      const confirmDelete =
        window.confirm(
          "Delete this order?"
        );

      if (!confirmDelete) {
        return;
      }

      orderStorage.deleteOrder(id);

      loadOrders();
    };


  const exportCSV = (order) => {

    const customers =
      order.bills.map(
        bill => bill.customer?.name
      );


    console.log(order.bills[0])


    const itemMap = {};

    order.bills.forEach(bill => {


      bill.items?.forEach(item => {

        if (!itemMap[item.name]) {

          itemMap[item.name] = {
            name: item.name
          };

        }

      });


    });

    const headers = [
      "Sr No",
      "Item",
      ...customers,
      "Stock"
    ];

    const rows = [];

    Object.values(itemMap).forEach(
      (item, index) => {


        const row = [
          index + 1,
          item.name
        ];

        let totalWeight = 0;

        customers.forEach(customer => {

          const bill =
            order.bills.find(
              b =>
                b.customer?.name ===
                customer
            );

          const foundItem =
            bill?.items?.find(
              i =>
                i.name === item.name
            );

          const qty =
            foundItem?.qty || 0;

          const weight =
            qty *
            (foundItem?.weightPerUnit || 0);

          row.push(
            qty > 0
              ? `q:${qty} / w:${weight}`
              : ""
          );

          totalWeight += weight;

        });

        row.push(
          `${item.name} = ${totalWeight}`
        );

        rows.push(row);

      }

    );

    const csv = [
      headers,
      ...rows
    ]
      .map(row => row.join(","))
      .join("\n");

    const BOM = "\uFEFF";

    const blob = new Blob(
      [BOM + csv],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
const formattedDate =
  new Date(order.deliveryDate)
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

link.download =
  `${order.orderName}_${formattedDate}.csv`;

    link.click();
  };


  const shareOrderWhatsApp = (
  order
) => {

  if (!whatsappNumber) {
    alert("Enter WhatsApp Number");
    return;
  }

  const itemMap = {};

  order.bills?.forEach(bill => {

    bill.items?.forEach(item => {

      const weight =
        (item.qty || 0) *
        (item.weightPerUnit || 0);

      if (!itemMap[item.name]) {
        itemMap[item.name] = {
          name: item.name,
          weight: 0
        };
      }

      itemMap[item.name].weight +=
        weight;

    });

  });

  const sortedItems =
    Object.values(itemMap)
      .sort(
        (a, b) =>
          b.weight - a.weight
      );

  let message =
`${order.orderName}

Date: ${order.deliveryDate}

`;

  sortedItems.forEach(
    (item, index) => {

      message +=
`${index + 1}. ${item.name}
Weight : ${item.weight.toFixed(2)} KG

`;

    }
  );

  message +=
`------------------

Total Weight : ${
  Number(
    order.totalWeight || 0
  ).toFixed(2)
} KG`;

  window.open(
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
};

const shareCustomerWiseWhatsApp =
  order => {

    if (!whatsappNumber) {
      alert("Enter WhatsApp Number");
      return;
    }

    let message =
`${order.orderName}

Date: ${order.deliveryDate}

`;

    order.bills?.forEach(
      (bill, billIndex) => {

        message +=
`Bill No : ${billIndex + 1}

Customer : ${
  bill.customer?.name
}

Mobile : ${
  bill.customer?.mobile
}

Weight : ${
  Number(
    bill.totals?.totalWeight || 0
  ).toFixed(2)
} KG

`;

        const sortedItems =
          [...(bill.items || [])]
            .sort(
              (a, b) => {

                const weightA =
                  (a.qty || 0) *
                  (a.weightPerUnit || 0);

                const weightB =
                  (b.qty || 0) *
                  (b.weightPerUnit || 0);

                return (
                  weightB - weightA
                );
              }
            );

        sortedItems.forEach(
          (item, itemIndex) => {

            const weight =
              (item.qty || 0) *
              (item.weightPerUnit || 0);

            message +=
`${itemIndex + 1}. ${item.name}
Qty : ${item.qty}
Weight : ${weight.toFixed(2)} KG

`;

          }
        );

        message +=
`------------------

`;

      }
    );

    message +=
`Total Weight : ${
  Number(
    order.totalWeight || 0
  ).toFixed(2)
} KG`;

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
};


  return (


    <div className="p-6 bg-gray-900 min-h-screen">

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">

        <h1 className="text-2xl sm:text-3xl font-bold text-teal-300">
          Orders
        </h1>

        <button
          onClick={() =>{
            setShowModal(true);
            console.log("Click")
          }}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
        >
          + Create Order
        </button>

      </div>

      {orders.length === 0 ? (

        <div className="bg-gray-800 rounded-lg p-10 text-center border border-gray-700">

          <h2 className="text-xl text-gray-300">
            No Orders Found
          </h2>

          <p className="text-gray-500 mt-2">
            Create your first
            delivery order
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {orders.map(
            order => {

                  const totalBills =
                    order.bills?.length || 0;

                  const packedBills =
                    order.bills?.filter(
                      bill =>
                        bill.items?.every(
                          item => item.packed
                        )
                    ).length || 0;

                  const loadedBills =
                    order.bills?.filter(
                      bill =>
                        bill.items?.every(
                          item => item.loaded
                        )
                    ).length || 0;

                  let status = "Not Started";

                  if (
                    packedBills > 0 &&
                    packedBills < totalBills
                  ) {
                    status = "Packing";
                  }

                  if (
                    packedBills === totalBills &&
                    loadedBills === 0 &&
                    totalBills > 0
                  ) {
                    status = "Ready To Load";
                  }

                  if (
                    loadedBills > 0 &&
                    loadedBills < totalBills
                  ) {
                    status = "Loading";
                  }

                  if (
                    loadedBills === totalBills &&
                    totalBills > 0
                  ) {
                    status = "Completed";
                  }

  return (

            <div
              key={order.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-5"
            >

              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">

                <div>

                  <h2 className="text-xl font-bold text-white">

                    {order.orderName}

                  </h2>

                  <p className="text-gray-400">

                    Delivery:
                    {" "}
                    {order.deliveryDate}

                  </p>

                </div>

                <div>

             <span
  className={`
    px-3 py-1 rounded-full text-sm font-bold
    ${
      status === "Completed"
        ? "bg-green-600"
        : status === "Loading"
        ? "bg-blue-600"
        : status === "Ready To Load"
        ? "bg-yellow-600"
        : status === "Packing"
        ? "bg-orange-600"
        : "bg-red-600"
    }
    text-white
  `}
>
  {status}
</span>

                </div>

              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">

                <div className="bg-gray-700 p-3 rounded">

                  <p className="text-gray-400 text-sm">
                    Weight
                  </p>

                  <p className="text-white text-lg font-bold">
                    {Number(
                      order.totalWeight || 0
                    ).toFixed(2)}

                  </p>

                </div>

                <div className="bg-gray-700 p-3 rounded">

                  <p className="text-gray-400 text-sm">
                    Bills
                  </p>

                  <p className="text-white text-lg font-bold">
                    {order.billCount}
                    /100
                  </p>

                </div>

                <div className="bg-gray-700 p-3 rounded">

                  <p className="text-gray-400 text-sm">
                    Customers
                  </p>

                  <p className="text-white text-lg font-bold">
                    {order.customerCount}
                  </p>

                </div>
                <div className="bg-gray-700 p-3 rounded">

                  <p className="text-gray-400 text-sm">
                    Profit
                  </p>

                  <p className="text-green-400 text-lg font-bold">
                    ₹{getOrderProfit(order).toFixed(2)}
                  </p>

                </div>

              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-5">
                <button
                  onClick={() => {
                    console.log("OPEN CLICKED");
                    console.log(order);
                    setSelectedOrder(order);
                  }}
                  className="
bg-blue-600
hover:bg-blue-700
text-white
px-4
py-2
rounded
"

                >

                  Open </button>


                <button
                  onClick={() =>
                    exportCSV(order)
                  }
                  className="
                bg-green-600
                hover:bg-green-700
                text-white
                px-4
                py-2
                rounded
              "
                >
                  Export CSV
                </button>
                <button
  onClick={() => {
    setSelectedOrderForShare(order);
    setShowWhatsAppModal(true);
  }}
  className="
    bg-green-500
    hover:bg-green-600
    text-white
    px-4
    py-2
    rounded
  "
>
  WhatsApp
</button>

                <button
                  onClick={() =>
                    handleDeleteOrder(
                      order.id
                    )
                  }
                  className="
                bg-red-600
                hover:bg-red-700
                text-white
                px-4
                py-2
                rounded
              "
                >
                  Delete
                </button>

              </div>

                        </div>

          );
        })}




</div>

)}
<CreateOrderModal
  isOpen={showModal}
  onClose={() =>
    setShowModal(false)
  }
  onCreate={
    handleCreateOrder
  }
/>
{showWhatsAppModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

    <div className="bg-white rounded-lg p-5 w-full max-w-md">

      <h2 className="text-xl font-bold mb-4">
        Share Order
      </h2>

      <input
  type="text"
  placeholder="WhatsApp Number"
  value={whatsappNumber}
  onChange={(e) => {

    const value =
      e.target.value
        .replace(/\D/g, "")
        .slice(0, 10);

    setWhatsappNumber(value);

  }}
  maxLength={10}
  className="w-full border p-2 rounded mb-4"
/>

      <div className="mb-4">

        <label className="flex items-center gap-2 mb-2">
          <input
            type="radio"
            value="stock"
            checked={shareType === "stock"}
            onChange={() =>
              setShareType("stock")
            }
          />
          Stock Summary
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="customer"
            checked={shareType === "customer"}
            onChange={() =>
              setShareType("customer")
            }
          />
          Customer Orders
        </label>

      </div>

      <div className="flex gap-2">

        <button
          onClick={() =>
            setShowWhatsAppModal(false)
          }
          className="flex-1 bg-gray-500 text-white py-2 rounded"
        >
          Cancel
        </button>

        <button
          onClick={() => {

            if (
              shareType === "stock"
            ) {

              shareOrderWhatsApp(
                selectedOrderForShare
              );

            } else {

              shareCustomerWiseWhatsApp(
                selectedOrderForShare
              );

            }

          }}
          className="flex-1 bg-green-600 text-white py-2 rounded"
        >
          Send
        </button>

      </div>

    </div>

  </div>
)}

</div>

);
}