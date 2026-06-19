const STORAGE_KEY = "orderBatchesData";

export const orderStorage = {

  getOrders() {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      ) || [];
    } catch {
      return [];
    }
  },

  saveOrders(orders) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(orders)
    );
  },

  createOrder(orderData) {
    const orders = this.getOrders();

    const newOrder = {
      id: Date.now(),
      orderName: orderData.orderName,
      deliveryDate: orderData.deliveryDate,
      status: "Pending",
      totalWeight: 0,
      billCount: 0,
      customerCount: 0,
      bills: []
    };

    orders.unshift(newOrder);

    this.saveOrders(orders);

    return newOrder;
  },

  deleteOrder(id) {
    const orders =
      this.getOrders().filter(
        order => order.id !== id
      );

    this.saveOrders(orders);
  },

 addBillToOrder(orderId, billData) {

  const orders = this.getOrders();

  const updatedOrders = orders.map(order => {

    if (order.id !== orderId) {
      return order;
    }

    const normalizedMobile =
      (billData.customer?.mobile || "")
        .replace(/\D/g, "")
        .replace(/^0+/, "");

    const existingIndex =
      order.bills.findIndex(bill => {

        const billMobile =
          (bill.customer?.mobile || "")
            .replace(/\D/g, "")
            .replace(/^0+/, "");

        return billMobile === normalizedMobile;

      });

    let bills = [...order.bills];

    if (existingIndex >= 0) {

      bills[existingIndex] = billData;

    } else {

      bills.push(billData);

    }

    return {
      ...order,
      bills,
      billCount: bills.length,
      customerCount:
        new Set(
          bills.map(
            b =>
              (b.customer?.mobile || "")
                .replace(/\D/g, "")
                .replace(/^0+/, "")
          )
        ).size,
      totalWeight:
        bills.reduce(
          (sum, bill) =>
            sum +
            (bill.totals?.totalWeight || 0),
          0
        )
    };

  });

  this.saveOrders(updatedOrders);

},
  updateBillInOrder(orderId, billData) {

    const orders = this.getOrders();

    const updatedOrders =
      orders.map(order => {

        if (order.id !== orderId) {
          return order;
        }

        const bills =
          order.bills.map(bill =>
            bill.id === billData.id
              ? billData
              : bill
          );

        return {
          ...order,
          bills,
          billCount: bills.length,
          customerCount:
            new Set(
              bills.map(
                b => b.customer?.mobile
              )
            ).size,
          totalWeight:
            bills.reduce(
              (sum, bill) =>
                sum +
                (bill.totals?.totalWeight || 0),
              0
            )
        };
      });

    this.saveOrders(updatedOrders);
  }

};                                             