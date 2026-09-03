import React, { useState, useEffect, useMemo } from 'react';
import { generateInvoicePDF } from "../utils/pdfGenerator";
import InvoiceTemplate from "./InvoiceTemplate";
import { useRef } from "react";
import { orderStorage }
  from "../utils/orderStorage";
import { billHistoryStorage }
  from "../utils/billHistoryStorage";
import { calculateBillTotals, normalizeBillItems } from "../utils/billCalculations";

export default function BillingModule({ editingBill, onComplete, onCancelEdit }) {
  const searchInputRef = useRef(null);
  const customerNameRef = useRef(null);
  const saveInProgressRef = useRef(false);
  const [searchItem, setSearchItem] = useState('');
  const [lineItems, setLineItems] = useState([]);

  const [customerData, setCustomerData] = useState({
    name: "",
    mobile: "",
    address: "",
    customerType: "walkin",
    orderId: null
  });

  const [summary, setSummary] = useState({
    porterage: 0,
    porterageRate: 10,
    porteragePerKg: 30,
    oldBalance: 0,
    discountType: 'fixed',
    discountValue: 0,
    receivedAmount: 0,
    note: '',
  });

  const [inventory, setInventory] = useState([]);
  const [, setSelectedItem] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const addButtonRef = useRef(null);


  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState(null);

  const [showAddItemModal, setShowAddItemModal] =
    useState(false);

  const [newItemData, setNewItemData] = useState({
    marathiName: '',
    englishName: '',
    type: '',
    category: '',
    costPrice: '',
    sellingPrice: '',
    unitType: 'Piece',
    weightPerUnit: '',
  });

  const [lastNotFoundProduct, setLastNotFoundProduct] = useState("");




  useEffect(() => {
    const savedData = localStorage.getItem("inventoryData");



    if (savedData) {
      const inventory = JSON.parse(savedData);



      setInventory(inventory);
    }
  }, []);



  useEffect(() => {
    if (editingBill) {
      const normalizedItems = normalizeBillItems(editingBill.items || []);

      const loadedSummary = {
        ...summary,
        ...(editingBill.summary || {}),
        oldBalance:
          editingBill.totals?.oldBalance ??
          editingBill.summary?.oldBalance ??
          0,
        receivedAmount:
          editingBill.totals?.receivedAmount ??
          editingBill.summary?.receivedAmount ??
          0,
      };

      // Calculate porterage automatically when saved value is 0/missing
      if (!Number(loadedSummary.porterage)) {
        const totalWeight = normalizedItems.reduce(
          (sum, item) =>
            sum +
            (Number(item.qty) || 0) *
            (Number(item.weightPerUnit) || 0),
          0
        );

        const porterageRate =
          Number(loadedSummary.porterageRate) || 10;

        const porteragePerKg =
          Number(loadedSummary.porteragePerKg) || 30;

        loadedSummary.porterage =
          Math.round(
            (totalWeight / porteragePerKg) *
            porterageRate *
            100
          ) / 100;
      }

      setCustomerData({
        name: "",
        mobile: "",
        address: "",
        customerType: "walkin",
        orderId: null,
        ...editingBill.customer,
      });

      setLineItems(normalizedItems);
      setSummary(loadedSummary);

      return;
    }

    const draft = localStorage.getItem("currentBillingDraft");
    if (!draft) return;

    try {
      const parsed = JSON.parse(draft);

      setCustomerData((current) => ({
        ...current,
        ...(parsed.customerData || {}),
      }));

      setLineItems(
        normalizeBillItems(parsed.lineItems || [])
      );

      setSummary((current) => ({
        ...current,
        ...(parsed.summary || {}),
      }));
    } catch {
      localStorage.removeItem("currentBillingDraft");
    }
  }, [editingBill]);



  useEffect(() => {

    const hasData =
      customerData.name ||
      customerData.mobile ||
      customerData.address ||
      lineItems.length > 0;

    if (!hasData) return;

    localStorage.setItem(
      "currentBillingDraft",
      JSON.stringify({
        customerData,
        lineItems,
        summary
      })
    );

  }, [
    customerData,
    lineItems,
    summary
  ]);




  const getItemNames = (item) => {
    if (item.marathiName || item.englishName) {
      return {
        marathiName: item.marathiName || "",
        englishName: item.englishName || "",
      };
    }

    // Support old inventory records
    if (item.item) {
      const parts = item.item.split("/").map(name => name.trim());

      return {
        marathiName: parts[0] || "",
        englishName: parts.slice(1).join(" / ") || "",
      };
    }

    return {
      marathiName: "",
      englishName: "",
    };
  };



  const handleSaveBill = () => {

    if (!customerData.name.trim()) {
      alert("Please enter customer name");

      customerNameRef.current?.focus();
      customerNameRef.current?.select();

      return;
    }

    if (isSaving || saveInProgressRef.current) return;

    if (
      customerData.customerType === "order"
    ) {

      const order =
        orderStorage
          .getOrders()
          .find(
            o =>
              o.id ===
              customerData.orderId
          );

      const alreadyExists =
        order?.bills?.find(
          bill =>
            bill.customer?.mobile ===
            customerData.mobile
        );

      if (
        alreadyExists &&
        !editingBill
      ) {

        alert(
          "Customer already has a bill in this trip. Please edit existing bill."
        );

        return;
      }
    }

    if (!lineItems.length) { setMessage("Please add at least one item"); return; }
    const normalizedItems = normalizeBillItems(lineItems);
    if (normalizedItems.some((item) => item.qty <= 0 || item.rate < 0)) { setMessage("Each item needs a valid quantity and rate"); return; }
    saveInProgressRef.current = true;
    setIsSaving(true);
    const calculatedTotals = calculateBillTotals(normalizedItems, summary);
    const invoiceNumber = editingBill?.invoiceNumber || Math.max(1000, ...billHistoryStorage.getBills().map((bill) => Number(bill.invoiceNumber) || 0)) + 1;
    const selectedOrder = customerData.customerType === "order"
      ? orderStorage.getOrders().find((order) => order.id === customerData.orderId)
      : null;

    const billData = {
      id: editingBill
        ? editingBill.id
        : Date.now(),

      customer: { ...customerData, orderName: selectedOrder?.orderName || customerData.orderName || "" },

      invoiceNumber,
      items: normalizedItems.map(item => ({
        ...item,
        packed: item.packed || false,
        loaded: item.loaded || false
      })),

      summary: { ...summary },
      totals: calculatedTotals,

      createdAt: editingBill
        ? editingBill.createdAt
        : new Date().toISOString(),

      billDateTime:
        editingBill?.billDateTime ||
        new Date().toISOString()
    };





    if (editingBill) {

      // -----------------------------------------
      // 1. UPDATE BILL HISTORY
      // -----------------------------------------

      const updated =
        billHistoryStorage.updateBill(billData);

      if (!updated) {
        saveInProgressRef.current = false;
        setIsSaving(false);

        setMessage(
          "Unable to update: bill no longer exists"
        );

        return;
      }


      // -----------------------------------------
      // 2. UPDATE BILL INSIDE ORDER
      // -----------------------------------------

      if (
        customerData.customerType === "order" &&
        customerData.orderId
      ) {

        const orders = JSON.parse(
          localStorage.getItem(
            "orderBatchesData"
          ) || "[]"
        );

        const updatedOrders =
          orders.map(order => {

            // Not our order
            if (
              String(order.id) !==
              String(customerData.orderId)
            ) {
              return order;
            }

            const bills =
              Array.isArray(order.bills)
                ? order.bills
                : [];


            // Find existing bill
            const billIndex =
              bills.findIndex(
                bill =>
                  String(bill.id) ===
                  String(billData.id)
              );


            console.log(
              "UPDATING BILL",
              {
                orderId: customerData.orderId,
                billId: billData.id,
                billIndex
              }
            );


            // IMPORTANT:
            // During UPDATE, never create a new bill.
            if (billIndex === -1) {

              console.error(
                "Bill not found inside order. Update cancelled.",
                billData.id
              );

              return order;
            }


            // Replace existing bill
            const updatedOrderBills =
              bills.map((bill, index) =>
                index === billIndex
                  ? billData
                  : bill
              );


            return {
              ...order,

              bills:
                updatedOrderBills,

              billCount:
                updatedOrderBills.length,

              customerCount:
                new Set(
                  updatedOrderBills.map(
                    bill =>
                      (bill.customer?.mobile || "")
                        .replace(/\D/g, "")
                        .replace(/^0+/, "")
                  )
                ).size,

              totalWeight:
                updatedOrderBills.reduce(
                  (sum, bill) =>
                    sum +
                    Number(
                      bill.totals?.totalWeight || 0
                    ),
                  0
                )
            };

          });


        // -----------------------------------------
        // 3. SAVE UPDATED ORDER
        // -----------------------------------------

        localStorage.setItem(
          "orderBatchesData",
          JSON.stringify(updatedOrders)
        );


        // IMPORTANT:
        // Dispatch AFTER localStorage is updated
        window.dispatchEvent(
          new Event("storage")
        );
      }


      // -----------------------------------------
      // 4. CLEANUP
      // -----------------------------------------

      localStorage.removeItem(
        "currentBillingDraft"
      );

      saveInProgressRef.current = false;
      setIsSaving(false);


      // -----------------------------------------
      // 5. RETURN UPDATED BILL TO APP
      // -----------------------------------------

      onComplete?.(billData);


    } else {

      // =========================================
      // NEW BILL
      // =========================================

      if (
        customerData.customerType === "order" &&
        customerData.orderId
      ) {

        orderStorage.addBillToOrder(
          customerData.orderId,
          billData
        );
      }


      billHistoryStorage.addBill(
        billData
      );


      localStorage.removeItem(
        "currentBillingDraft"
      );

      saveInProgressRef.current = false;
      setIsSaving(false);

      onComplete?.(
        `Bill INV-${invoiceNumber} saved successfully.`
      );
    }

  };



  const handleWhatsAppBillShare = async () => {




    if (!customerData.mobile) {
      alert("Customer mobile number required");
      return;
    }

    const currentDate = new Date().toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );

    let itemsText = "";

    lineItems.forEach((item, index) => {
      itemsText +=
        `*${index + 1}. ${item.name}*\n` +
        `Qty: ${item.qty} × ₹${item.rate} = ₹${item.amount}\n\n`;
    });

    const message = `
*DURGULE TRADERS*
━━━━━━━━━━━━━━

*Date:* ${currentDate}
*Customer:* ${customerData.name}

━━━━━━━━━━━━━━

${itemsText}

━━━━━━━━━━━━━━

*Total Weight:* ${totals.totalWeight.toFixed(2)}

*Subtotal:* ₹${totals.subtotal.toFixed(2)}
*Discount:* ₹${totals.discount.toFixed(2)}
*Grand Total:* ₹${totals.total.toFixed(2)}

━━━━━━━━━━━━━━

Thank You
`;

    const phone =
      customerData.mobile.replace(/\D/g, "");

    window.open(
      `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    const success =
      await handleGeneratePDF();

    if (!success) return;


  };




  const handleCreateInventoryItem = () => {
    if (
      !newItemData.marathiName ||
      !newItemData.englishName ||
      !newItemData.category ||
      !newItemData.type ||
      newItemData.costPrice === "" ||
      newItemData.sellingPrice === ""
    ) {
      alert("Please fill all required fields");
      return;
    }

    const inventoryData =
      JSON.parse(
        localStorage.getItem("inventoryData")
      ) || [];

    const newItem = {
      sn:
        Math.max(
          ...inventoryData.map(i => i.sn),
          0
        ) + 1,

      marathiName:
        newItemData.marathiName,

      englishName:
        newItemData.englishName,

      type:
        newItemData.type,

      category:
        newItemData.category,

      costPrice:
        Number(newItemData.costPrice),

      sellingPrice:
        Number(newItemData.sellingPrice),

      profit:
        Number(newItemData.sellingPrice) -
        Number(newItemData.costPrice),

      unitType:
        newItemData.unitType,

      weightPerUnit:
        Number(newItemData.weightPerUnit || 1)
    };

    const updatedInventory = [
      ...inventoryData,
      newItem
    ];

    localStorage.setItem(
      "inventoryData",
      JSON.stringify(updatedInventory)
    );

    setInventory(updatedInventory);

    addSpecificItem(newItem);

    setShowAddItemModal(false);
  };



  const handleAddLineItem = () => {
    const typedName = searchItem.trim();

    if (!typedName) {
      setMessage("Please enter product name");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    // If product exists in inventory, use inventory details
    const item =
      selectedInventoryItem ||
      inventory.find(i => {
        const { marathiName, englishName } =
          getItemNames(i);

        const search =
          typedName.toLowerCase();

        return (
          marathiName.toLowerCase() === search ||
          englishName.toLowerCase() === search
        );
      });

    // Existing inventory product
    if (item) {
      setLastNotFoundProduct("");
      addSpecificItem(item);
    }
    // Product NOT in inventory
    // Product NOT in inventory
    else {
      const productName = typedName.toLowerCase();

      // Second attempt with same unavailable product
      if (lastNotFoundProduct === productName) {
        setNewItemData({
          marathiName: typedName,
          englishName: "",
          type: "",
          category: "",
          costPrice: "",
          sellingPrice: "",
          unitType: "KG",
          weightPerUnit: ""
        });

        setShowAddItemModal(true);

        setLastNotFoundProduct("");

        return;
      }

      // First attempt
      setLastNotFoundProduct(productName);

      setMessage("❌ Product not found in inventory. Press Add again to create it.");
      setTimeout(() => setMessage(""), 2500);

      searchInputRef.current?.focus();

      return;
    }


    setSelectedItem("");
    setSearchItem("");

    setMessage("Item added");
    setTimeout(() => setMessage(""), 2000);

    setTimeout(() => {
      const qtyInputs = document.querySelectorAll(
        '[data-line-field="qty"]'
      );

      const lastQty = qtyInputs[qtyInputs.length - 1];

      lastQty?.focus();
      lastQty?.select();
    }, 100);
  };


  const addSpecificItem = (item) => {
    const productId = item.id ?? item.sku ?? item.sn;

    const { marathiName, englishName } =
      getItemNames(item);

    const itemName =
      marathiName || englishName || "";

    const normalizedName =
      itemName.toLowerCase();

    // Check existing item
    const existing = lineItems.find((line) => {

      const lineProductId =
        line.productId ?? line.sku ?? line.sn;

      const lineName =
        line.name?.trim().toLowerCase() || "";

      return (
        (
          productId != null &&
          lineProductId != null &&
          String(lineProductId) ===
          String(productId)
        ) ||
        (
          normalizedName &&
          lineName === normalizedName
        )
      );
    });


    // Same product exists → ask permission
    if (existing) {

      const allowDuplicate = window.confirm(
        `"${itemName}" already exists in the bill.\n\nDo you want to add it again?`
      );

      // NO
      if (!allowDuplicate) {
        return;
      }
    }


    // YES or completely new product
    const qty = 1;

    const rate =
      Number(item.sellingPrice) || 0;

    const newItem = {
      id: `item-${productId}-${Date.now()}-${Math.random()}`,

      productId,

      sn: item.sn,

      name: itemName,

      qty,

      rate,

      costPrice:
        Number(item.costPrice) || 0,

      amount:
        qty * rate,

      weightPerUnit:
        Number(item.weightPerUnit) || 0,

      unitType:
        item.unitType || "KG",
    };


    setLineItems((prev) => [
      ...prev,
      newItem
    ]);


    setSearchItem("");
    setSelectedItem("");
    setSelectedInventoryItem(null);

    setMessage("Item added");

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };



  const handleUpdateLineItem = (id, field, value) => {

    setLineItems(prev =>
      prev.map(item => {

        if (item.id !== id) {
          return item;
        }

        const updatedItem = {
          ...item,
          [field]: value
        };

        const qty = Number(updatedItem.qty);

        const rate = Number(updatedItem.rate);

        updatedItem.qty =
          Number.isFinite(qty) ? qty : 0;

        updatedItem.rate =
          Number.isFinite(rate) ? rate : 0;

        updatedItem.amount =
          updatedItem.qty * updatedItem.rate;

        return updatedItem;
      })
    );
  };

  const handleRemoveLineItem = (id) => {
    setLineItems(lineItems.filter(item => item.id !== id));
    setMessage('✅ Item removed');
    setTimeout(() => setMessage(''), 2000);
  };



  const handleBillingEnterMove = (e) => {
    if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const fields = Array.from(document.querySelectorAll('[data-billing-flow]'));
    const currentIndex = fields.indexOf(e.target);
    if (currentIndex === -1) {
      return;
    }

    e.preventDefault();
    const nextField = fields[currentIndex + 1];
    if (nextField) {
      nextField.focus();
      nextField.select?.();
    }
  };



  const totals = useMemo(() => calculateBillTotals(lineItems, summary), [lineItems, summary]);
  const totalProfit = totals.totalProfit;


  const handleGeneratePDF = async () => {

    if (!customerData.name.trim()) {
      setMessage("❌ Please enter customer name");
      return false;
    }

    if (lineItems.length === 0) {
      setMessage("❌ Please add at least one item");
      return false;
    }

    const invalidItems = lineItems.some(
      (item) =>
        item.qty <= 0 ||
        item.rate <= 0 ||
        item.amount <= 0
    );

    if (invalidItems) {
      setMessage(
        "❌ All items must have Qty, Rate and Amount greater than 0"
      );
      return false;
    }

    try {

      await generateInvoicePDF({
        customerData,
        lineItems,
        totals,
        summary,
        invoiceNumber: editingBill?.invoiceNumber || Math.max(1000, ...billHistoryStorage.getBills().map((bill) => Number(bill.invoiceNumber) || 0)) + 1,
        invoiceDate: editingBill?.billDateTime || new Date().toISOString(),
      });



      setMessage("✅ PDF Generated");

      setTimeout(() => {
        setMessage("");
      }, 3000);

      return true;

    } catch (error) {

      console.error(error);

      setMessage("❌ PDF Generation Failed");

      setTimeout(() => {
        setMessage("");
      }, 3000);

      return false;
    }
  };


  const handlePrint = () => {
    if (!customerData.name || lineItems.length === 0) {
      setMessage('❌ Please add customer and items before printing');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: monospace; padding: 20px; background: white; }
          .header { text-align: center; margin-bottom: 20px; font-size: 18px; font-weight: bold; }
          .customer { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f0f0f0; padding: 8px; text-align: left; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          .summary { text-align: right; margin-top: 20px; }
          .summary-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { font-weight: bold; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="header">INVOICE - DURGULE BILLING STORE</div>
        <div class="customer">
          <strong>Customer:</strong> ${customerData.name}<br>
          <strong>Mobile:</strong> ${customerData.mobile}<br>
          <strong>Address:</strong> ${customerData.address}<br>
          <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
          <strong>Invoice #:</strong> ${editingBill?.invoiceNumber || Math.max(1000, ...billHistoryStorage.getBills().map((bill) => Number(bill.invoiceNumber) || 0)) + 1}
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>₹${item.rate.toFixed(2)}</td>
                <td>₹${item.amount.toFixed(2)}</td>
                <td>${(item.qty * item.weightPerUnit).toFixed(2)} ${item.unitType}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="summary">
          <div class="summary-row"><span>Subtotal:</span><span>₹${totals.subtotal.toFixed(2)}</span></div>
          <div class="summary-row"><span>Porterage:</span><span>₹${summary.porterage.toFixed(2)}</span></div>
          <div class="summary-row"><span>Old Balance:</span><span>₹${summary.oldBalance.toFixed(2)}</span></div>
          ${summary.discountValue > 0 ? `<div class="summary-row"><span>Discount:</span><span>-₹${totals.discount.toFixed(2)}</span></div>` : ''}
          <div class="summary-row total"><span>Total Bill:</span><span>₹${totals.total.toFixed(2)}</span></div>
          <div class="summary-row"><span>Received:</span><span>₹${summary.receivedAmount.toFixed(2)}</span></div>
          <div class="summary-row total"><span>Payable:</span><span>₹${totals.payable.toFixed(2)}</span></div>
          <div class="summary-row"><span>Total Weight:</span><span>${totals.totalWeight.toFixed(2)} ${lineItems[0]?.unitType || 'KG'}</span></div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintWithPDF = async () => {

    const success =
      await handleGeneratePDF();

    if (!success) return;

    handlePrint();
  };

  const handleClearBill = () => {
    if (window.confirm("Clear all items and customer data?")) {

      setLineItems([]);

      setCustomerData({
        name: "",
        mobile: "",
        address: "",
        customerType: "walkin",
        orderId: null
      });

      setSummary({
        porterage: 0,
        porterageRate: 10,
        porteragePerKg: 30,
        oldBalance: 0,
        discountType: "fixed",
        discountValue: 0,
        receivedAmount: 0,
        note: ""
      });

      // Remove autosaved draft
      localStorage.removeItem(
        "currentBillingDraft"
      );

      setMessage("✅ Bill cleared");

      setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  };





  return (




    <div className="min-w-0 overflow-x-hidden p-3 sm:p-6 bg-gray-900 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-teal-300">{editingBill ? `Edit Bill — INV-${editingBill.invoiceNumber}` : "Billing Module"}</h1>
          {editingBill && <p className="mt-1 text-sm text-yellow-300">Edit mode: changes update this invoice; they will not create a new bill.</p>}
        </div>
      </div>

      {message && (
        <div className="fixed top-4 right-4 bg-gray-800 border-l-4 border-teal-500 p-4 rounded shadow-lg z-50">
          {message}
        </div>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Billing Area */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* Customer Form */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-teal-300 mb-4">Customer Details</h2>
            <div className="space-y-3">
              <input
                ref={customerNameRef}
                type="text"
                data-billing-flow
                placeholder="Customer Name *"
                value={customerData.name}
                onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                onKeyDown={handleBillingEnterMove}
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
              />
              <input
                type="text"
                data-billing-flow
                placeholder="Mobile Number"
                value={customerData.mobile}
                onChange={(e) => {

                  const value =
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                  setCustomerData({
                    ...customerData,
                    mobile: value
                  });

                }}
                maxLength={10}
                onKeyDown={handleBillingEnterMove}
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
              />
              <input

                type="text"
                data-billing-flow
                placeholder="Address"
                value={customerData.address}
                onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                onKeyDown={handleBillingEnterMove}
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
              />
              <div>
                <label className="text-sm text-gray-400">
                  Customer Type
                </label>


                <select
                  value={customerData.customerType}
                  onChange={(e) =>
                    setCustomerData({
                      ...customerData,
                      customerType: e.target.value
                    })
                  }
                  className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                >
                  <option value="walkin">
                    Walk-in Customer
                  </option>

                  <option value="order">
                    Order Customer
                  </option>
                </select>
              </div>

              {customerData.customerType === "order" && (
                <div className="mt-3">
                  <label className="text-sm text-gray-400">
                    Select Order
                  </label>

                  <select
                    value={customerData.orderId || ""}
                    onChange={(e) =>
                      setCustomerData({
                        ...customerData,
                        orderId: Number(e.target.value)
                      })
                    }
                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                  >
                    <option value="">
                      Select Order
                    </option>

                    {(JSON.parse(
                      localStorage.getItem(
                        "orderBatchesData"
                      ) || "[]"
                    )).map(order => (
                      <option
                        key={order.id}
                        value={order.id}
                      >
                        {order.orderName} - {order.deliveryDate}
                      </option>
                    ))}
                  </select>
                </div>
              )}



            </div>
          </div>

          {/* Line Items */}




          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-teal-300 mb-4">Add Items</h2>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">


                <input
                  ref={searchInputRef}
                  type="text"
                  data-billing-flow
                  value={searchItem}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSearchItem(value);

                    const firstMatch = inventory.find(item => {
                      const { marathiName, englishName } =
                        getItemNames(item);

                      const marathi =
                        marathiName.toLowerCase();

                      const english =
                        englishName.toLowerCase();

                      return (
                        marathi.includes(value.toLowerCase()) ||
                        english.includes(value.toLowerCase())
                      );
                    });

                    if (firstMatch) {
                      const { marathiName } = getItemNames(firstMatch);

                      setSelectedItem(marathiName);
                      setSelectedInventoryItem(firstMatch);
                    } else {
                      setSelectedItem("");
                      setSelectedInventoryItem(null);
                    }


                  }}

                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLineItem();
                    }
                  }}


                  placeholder="Search product..."
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-teal-500"
                />





                {
                  searchItem.trim() !== "" && (
                    <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">

                      {inventory
                        .filter((item) => {
                          const search = searchItem.toLowerCase().trim();

                          const { marathiName, englishName } =
                            getItemNames(item);

                          const normalizedMarathi =
                            marathiName.toLowerCase();

                          const normalizedEnglish =
                            englishName.toLowerCase();

                          return (
                            normalizedMarathi.includes(search) ||
                            normalizedEnglish.includes(search)
                          );
                        })
                        .slice(0, 15)
                        .map((item) => {
                          const { marathiName, englishName } = getItemNames(item);

                          return (
                            <div
                              key={item.sn}

                              onClick={() => {
                                setLastNotFoundProduct("");
                                setSelectedInventoryItem(item);
                                addSpecificItem(item);
                              }}

                              className="p-3 cursor-pointer hover:bg-teal-600/20 border-b border-gray-700 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-white">
                                  {marathiName} / {englishName}
                                </span>

                                <span className="text-teal-300 font-semibold">
                                  ₹{item.sellingPrice}
                                </span>
                              </div>

                              <div className="text-xs text-gray-400 mt-1">
                                {item.category || item.type}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                {
                  searchItem.trim() !== "" &&
                  inventory.filter(item => {
                    const search = searchItem.toLowerCase().trim();

                    const { marathiName, englishName } =
                      getItemNames(item);

                    return (
                      marathiName.toLowerCase().includes(search) ||
                      englishName.toLowerCase().includes(search)
                    );
                  }).length === 0 && (
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          setNewItemData(prev => ({
                            ...prev,
                            marathiName: searchItem,
                            englishName: "",
                            type: "",
                            category: "",
                            costPrice: "",
                            sellingPrice: "",
                            unitType: "Piece",
                            weightPerUnit: ""
                          }));

                          setShowAddItemModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      >
                        + Add New Item
                      </button>
                    </div>
                  )
                }



              </div>

              <button
                ref={addButtonRef}
                onClick={handleAddLineItem}
              >
                Add
              </button>
            </div>


            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-white text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="p-2 text-center">Sr No</th>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-right">Amount</th>
                    <th className="p-2 text-right">Weight</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length > 0 ? (
                    lineItems.map((item, index) => (

                      <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-700">
                        <td className="p-2 text-center">
                          {index + 1}
                        </td>
                        <td className="p-2 font-semibold">{item.name}</td>
                        <td className="p-2">
                          <input

                            type="number"
                            data-billing-flow
                            data-line-id={item.id}
                            data-line-field="qty"
                            value={item.qty}
                            onChange={(e) =>
                              handleUpdateLineItem(
                                item.id,
                                "qty",
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                              )
                            }
                            onBlur={(e) => {
                              if (e.target.value === "" || Number(e.target.value) < 0) {
                                handleUpdateLineItem(
                                  item.id,
                                  "qty",
                                  0
                                );
                              }
                            }}

                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();

                                document
                                  .querySelector(
                                    `[data-line-id="${item.id}"][data-line-field="rate"]`
                                  )
                                  ?.focus();
                              }
                            }}
                            className="w-16 bg-gray-600 text-white p-1 rounded text-center"
                            min="0"
                          />
                        </td>
                        <td className="p-2">
                          <input

                            type="number"
                            data-billing-flow
                            data-line-id={item.id}
                            data-line-field="rate"
                            value={item.rate}
                            onChange={(e) =>
                              handleUpdateLineItem(
                                item.id,
                                "rate",
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                              )
                            }
                            onBlur={(e) => {
                              if (
                                e.target.value === "" ||
                                Number(e.target.value) <= 0
                              ) {
                                handleUpdateLineItem(
                                  item.id,
                                  "rate",
                                  1
                                );
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();

                                setTimeout(() => {
                                  searchInputRef.current?.focus();
                                  searchInputRef.current?.select?.();
                                }, 50);
                              }
                            }}
                            className="w-20 bg-gray-600 text-white p-1 rounded text-right"
                          />
                        </td>
                        <td className="p-2 text-right font-semibold">₹{item.amount.toFixed(2)}</td>
                        <td className="p-2 text-right text-sm">
                          {(
                            (Number(item.qty) || 0) *
                            (Number(item.weightPerUnit) || 0)
                          ).toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-400">
                        No items added. Select and add items above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Weight Summary */}
            {lineItems.length > 0 && (
              <div className="mt-4 p-3 bg-gray-700 rounded">
                <p className="text-teal-300 font-semibold">
                  Total Order Weight: {totals.totalWeight.toFixed(2)} {lineItems[0]?.unitType || 'KG'}
                </p>
              </div>
            )}
          </div>
        </div>




        {/* Sidebar - Summary */}
        <div className="min-w-0 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit sticky top-6 space-y-4">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Billing Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-200">
              <span>Subtotal</span>
              <span className="font-bold">₹{totals.subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">
              Porterage (₹)
            </label>

            <input
              type="number"
              data-billing-flow
              value={
                summary.porterage > 0
                  ? summary.porterage
                  : totals.porterage
              }
              onChange={(e) =>
                setSummary({
                  ...summary,
                  porterage:
                    e.target.value === ""
                      ? 0
                      : Number(e.target.value)
                })
              }
              onKeyDown={handleBillingEnterMove}
              className="w-full bg-gray-700 text-white p-2 rounded border border-teal-500 focus:border-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Old Balance (₹)</label>
            <input

              type="number"
              data-billing-flow
              value={summary.oldBalance}
              onChange={(e) =>
                setSummary({
                  ...summary,
                  oldBalance: Math.max(0, Number(e.target.value) || 0),
                })
              }
              min="0"
              onKeyDown={handleBillingEnterMove}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Discount</label>
            <div className="flex gap-2 mb-2">
              <select
                data-billing-flow
                value={summary.discountType}
                onChange={(e) => setSummary({ ...summary, discountType: e.target.value })}
                onKeyDown={handleBillingEnterMove}
                className="flex-1 bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
              >
                <option value="fixed">Fixed (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
            <input

              type="number"
              data-billing-flow
              value={summary.discountValue}
              onChange={(e) =>
                setSummary({
                  ...summary,
                  discountValue: Math.max(0, Number(e.target.value) || 0),
                })
              }
              min="0"
              onKeyDown={handleBillingEnterMove}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
              placeholder="0"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Received Amount (₹)</label>
            <input

              type="number"
              data-billing-flow
              value={summary.receivedAmount}
              onChange={(e) =>
                setSummary({
                  ...summary,
                  receivedAmount: Math.max(0, Number(e.target.value) || 0),
                })
              }
              min="0"
              onKeyDown={handleBillingEnterMove}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
            />
          </div>

          {/* <div className="bg-gray-700 p-4 rounded space-y-2 border border-gray-600">
            <div className="flex justify-between text-sm">
              <span>After Discount:</span>
              <span>₹{totals.afterDiscount.toFixed(2)}</span>
            </div>
            {summary.discountValue > 0 && (
              <div className="flex justify-between text-sm text-green-400">
                <span>Discount:</span>
                <span>-₹{totals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-2 mt-2 text-teal-300">
              <span>Grand Total:</span>
              <span>₹{totals.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-yellow-400 font-semibold">
              <span>Payable:</span>
              <span>₹{Math.max(0, totals.payable).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-green-400">
              <span>Profit:</span>
              <span>₹{totalProfit.toFixed(2)}</span>
            </div>

          </div> */}

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-4">
            <h3 className="text-lg font-bold text-teal-300 mb-4">
              Calculation Summary
            </h3>

            <div className="space-y-4 text-sm">

              {/* SUBTOTAL */}
              <div>
                <div className="text-gray-400 mb-1">
                  Subtotal
                </div>

                <div className="text-white font-semibold">
                  ₹{totals.subtotal.toFixed(2)}
                </div>
              </div>


              {/* DISCOUNT */}
              <div>
                <div className="text-gray-400 mb-1">
                  Discount
                </div>

                {totals.discount > 0 ? (
                  <>
                    <div className="text-gray-300">
                      ₹{totals.subtotal.toFixed(2)}
                      {" − "}
                      ₹{totals.discount.toFixed(2)}
                    </div>

                    <div className="text-green-400 font-semibold">
                      = ₹{totals.afterDiscount.toFixed(2)}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-300">
                    No discount
                  </div>
                )}
              </div>


              {/* PORTERAGE */}
              <div>
                <div className="text-gray-400 mb-1">
                  Porterage
                </div>

                {summary.porterage === "" ||
                  summary.porterage === undefined ||
                  summary.porterage === null ? (
                  <>
                    <div className="text-gray-300">
                      {totals.totalWeight.toFixed(2)}
                      {" ÷ "}
                      {Number(summary.porteragePerKg || 30)}
                      {" × ₹"}
                      {Number(summary.porterageRate || 10)}
                    </div>

                    <div className="text-green-400 font-semibold">
                      = ₹{totals.porterage.toFixed(2)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-gray-300">
                      Manual Porterage
                    </div>

                    <div className="text-green-400 font-semibold">
                      = ₹{totals.porterage.toFixed(2)}
                    </div>
                  </>
                )}
              </div>


              {/* OLD BALANCE */}
              <div>
                <div className="text-gray-400 mb-1">
                  Old Balance
                </div>

                <div className="text-white font-semibold">
                  ₹{totals.oldBalance.toFixed(2)}
                </div>
              </div>


              {/* GRAND TOTAL */}
              <div className="border-t border-gray-600 pt-4">

                <div className="text-gray-400 mb-1">
                  Grand Total
                </div>

                <div className="text-gray-300">
                  ₹{totals.afterDiscount.toFixed(2)}
                  {" + "}
                  ₹{totals.porterage.toFixed(2)}
                  {" + "}
                  ₹{totals.oldBalance.toFixed(2)}
                </div>

                <div className="text-teal-300 text-lg font-bold mt-1">
                  = ₹{totals.total.toFixed(2)}
                </div>

              </div>


              {/* RECEIVED */}
              <div>
                <div className="text-gray-400 mb-1">
                  Received Amount
                </div>

                <div className="text-white font-semibold">
                  ₹{totals.receivedAmount.toFixed(2)}
                </div>
              </div>


              {/* PAYABLE */}
              <div className="border-t border-gray-700 pt-4">

                <div className="text-gray-400 mb-1">
                  Payable
                </div>

                <div className="text-gray-300">
                  ₹{totals.total.toFixed(2)}
                  {" − "}
                  ₹{totals.receivedAmount.toFixed(2)}
                </div>

                <div className="text-yellow-300 text-lg font-bold mt-1">
                  = ₹{totals.payable.toFixed(2)}
                </div>

              </div>


              {/* PROFIT */}
              <div className="border-t border-gray-700 pt-4">

                <div className="text-gray-400 mb-1">
                  Profit
                </div>

                <div className="text-green-400 text-lg font-bold">
                  ₹{totals.totalProfit.toFixed(2)}
                </div>

              </div>

            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Note</label>
            <textarea
              value={summary.note}
              onChange={(e) => setSummary({ ...summary, note: e.target.value })}
              placeholder="Add a note..."
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
              rows="2"
            />
          </div>

          <div className="space-y-2 pt-4">

            <button
              type="button"
              onClick={handleSaveBill}
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-all"
            >
              {isSaving ? "Saving…" : editingBill ? "Update Bill" : "Save Bill"}
            </button>
            {editingBill && <button onClick={() => { localStorage.removeItem("currentBillingDraft"); onCancelEdit?.(); }} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded">Cancel Edit</button>}
            <button
              onClick={handleGeneratePDF}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition-all"
            >
              Download Invoice
            </button>


            <button
              onClick={handleWhatsAppBillShare}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
            >
              Share on WhatsApp
            </button>


            <button
              onClick={handlePrintWithPDF}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-all"
            >
              Print
            </button>
            <button
              onClick={handleClearBill}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded transition-all"
            >
              Clear Bill
            </button>
          </div>

        </div>

      </div>
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "794px",
          transform: "translateX(-200vw)",
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
          contain: "layout paint size",
          isolation: "isolate",
        }}
      >
        <InvoiceTemplate
          customerData={customerData}
          lineItems={lineItems}
          totals={totals}
          summary={summary}
          invoiceNumber={editingBill?.invoiceNumber || Math.max(1000, ...billHistoryStorage.getBills().map((bill) => Number(bill.invoiceNumber) || 0)) + 1}
          invoiceDate={editingBill?.billDateTime || new Date().toISOString()}
        />
      </div>

      {
        showAddItemModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

            <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md p-6 shadow-2xl">

              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-teal-300">
                  Add New Product
                </h2>

                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">

                {/* Marathi Name */}
                <input
                  type="text"
                  placeholder="Marathi Name *"
                  value={newItemData.marathiName}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      marathiName: e.target.value
                    })
                  }
                  className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />

                {/* English Name */}
                <input
                  type="text"
                  placeholder="English Name *"
                  value={newItemData.englishName}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      englishName: e.target.value
                    })
                  }
                  className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />

                {/* Type */}
                <select
                  value={newItemData.type}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      type: e.target.value
                    })
                  }
                  className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-teal-500 outline-none"
                >
                  <option value="">Select Type *</option>
                  <option value="KG">KG</option>
                  <option value="Gram">Gram</option>
                  <option value="Litre">Litre</option>
                  <option value="ML">ML</option>
                  <option value="Piece">Piece</option>
                  <option value="Packet">Packet</option>
                  <option value="Box">Box</option>
                  <option value="Bottle">Bottle</option>
                  <option value="Dozen">Dozen</option>
                </select>

                {/* Category */}
                <select
                  value={newItemData.category}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      category: e.target.value
                    })
                  }
                  className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-teal-500 outline-none"
                >
                  <option value="">Select Category *</option>

                  <option value="Grocery">Grocery</option>
                  <option value="Pulses & Dals">Pulses & Dals</option>
                  <option value="Rice & Grains">Rice & Grains</option>
                  <option value="Flours & Atta">Flours & Atta</option>
                  <option value="Sugar & Salt">Sugar & Salt</option>
                  <option value="Oil & Ghee">Oil & Ghee</option>
                  <option value="Spices & Masala">Spices & Masala</option>
                  <option value="Dry Fruits & Nuts">Dry Fruits & Nuts</option>
                  <option value="Tea & Coffee">Tea & Coffee</option>
                  <option value="Biscuits & Cookies">Biscuits & Cookies</option>
                  <option value="Namkeen & Snacks">Namkeen & Snacks</option>
                  <option value="Instant & Packaged Food">
                    Instant & Packaged Food
                  </option>
                  <option value="Noodles & Pasta">Noodles & Pasta</option>
                  <option value="Breakfast & Cereals">
                    Breakfast & Cereals
                  </option>
                  <option value="Sauces & Spreads">
                    Sauces & Spreads
                  </option>
                  <option value="Pickles & Chutneys">
                    Pickles & Chutneys
                  </option>
                  <option value="Beverages">Beverages</option>

                  <option value="Dairy Products">Dairy Products</option>
                  <option value="Bakery Products">Bakery Products</option>
                  <option value="Frozen Foods">Frozen Foods</option>
                  <option value="Fruits & Vegetables">
                    Fruits & Vegetables
                  </option>

                  <option value="Personal Care">Personal Care</option>
                  <option value="Home Care & Cleaning">
                    Home Care & Cleaning
                  </option>
                  <option value="Household Items">
                    Household Items
                  </option>
                  <option value="Baby Care">Baby Care</option>
                  <option value="Pet Care">Pet Care</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Pooja & Religious Items">
                    Pooja & Religious Items
                  </option>

                  <option value="Other">Other</option>
                </select>

                {/* Cost Price */}
                <input
                  type="number"
                  placeholder="Cost Price (₹) *"
                  value={newItemData.costPrice}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      costPrice: e.target.value
                    })
                  }
                  className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />

                {/* Selling Price */}
                <input
                  type="number"
                  placeholder="Selling Price (₹) *"
                  value={newItemData.sellingPrice}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      sellingPrice: e.target.value
                    })
                  }
                  className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />

                {/* Unit Type */}
                <select
                  value={newItemData.unitType}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      unitType: e.target.value
                    })
                  }
                  className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-teal-500 outline-none"
                >
                  <option value="">Select Unit</option>
                  <option value="KG">KG</option>
                  <option value="Gram">Gram</option>
                  <option value="Litre">Litre</option>
                  <option value="ML">ML</option>
                  <option value="Piece">Piece</option>
                  <option value="Packet">Packet</option>
                  <option value="Box">Box</option>
                  <option value="Bottle">Bottle</option>
                  <option value="Dozen">Dozen</option>
                </select>

                {/* Weight Per Unit */}
                <input
                  type="number"
                  placeholder="Weight Per Unit"
                  value={newItemData.weightPerUnit}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      weightPerUnit: e.target.value
                    })
                  }
                  className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />

              </div>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded font-semibold"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateInventoryItem}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold"
                >
                  Save Item
                </button>

              </div>

            </div>
          </div>
        )
      }
    </div>
  );
}
