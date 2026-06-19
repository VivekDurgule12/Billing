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





export default function OrdersModule() {

const [selectedOrder, setSelectedOrder] = useState(null);
const [orders, setOrders] = useState([]);
const [showModal, setShowModal] = useState(false);


const loadOrders = () => {
  setOrders(
    orderStorage.getOrders()
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

        console.log("Create Clicked");
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

link.download =
`${order.orderName}.csv`;

link.click();
};



    return (


        <div className="p-6 bg-gray-900 min-h-screen">

            <div className="flex justify-between items-center mb-6">

                <h1 className="text-3xl font-bold text-teal-300">
                    Orders
                </h1>

                <button
                    onClick={() =>
                        setShowModal(true)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
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

                    {orders.map(order => (

                        <div
                            key={order.id}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-5"
                        >

                            <div className="flex justify-between">

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
                                        className="
                bg-yellow-600
                text-white
                px-3
                py-1
                rounded-full
                text-sm
              "
                                    >
                                        {order.status}
                                    </span>

                                </div>

                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">

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

                            </div>

                            <div className="flex gap-2 mt-5">

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

                    ))}

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

        </div>


    );
}