const BILL_HISTORY_KEY = "billHistoryData";

export const billHistoryStorage = {

  getBills() {
    try {
      return JSON.parse(
        localStorage.getItem(BILL_HISTORY_KEY)
      ) || [];
    } catch {
      return [];
    }
  },

  saveBills(bills) {
    localStorage.setItem(
      BILL_HISTORY_KEY,
      JSON.stringify(bills)
    );
  },

  addBill(bill) {

    const bills = this.getBills();

    bills.unshift(bill);

    if (bills.length > 100) {
      bills.pop();
    }

    this.saveBills(bills);

    return true;
  },

  deleteBill(id) {

    const bills =
      this.getBills().filter(
        bill => bill.id !== id
      );

    this.saveBills(bills);
  },

  getBill(id) {

    return this.getBills().find(
      bill => bill.id === id
    );
  },

  updateBill(updatedBill) {

    const bills = this.getBills();

    const index =
      bills.findIndex(
        bill =>
          bill.id === updatedBill.id
      );

    if (index === -1) {
      return false;
    }

    bills[index] = updatedBill;

    this.saveBills(bills);

    return true;
  }

};