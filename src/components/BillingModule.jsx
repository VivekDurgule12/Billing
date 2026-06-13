import React, { useState, useEffect } from 'react';
import { storageManager } from '../utils/storageManager';
import { generateInvoicePDF } from "../utils/pdfGenerator";
import InvoiceTemplate from "./InvoiceTemplate";
import { useRef } from "react";

export default function BillingModule() {
  const searchInputRef = useRef(null);
  const [searchItem, setSearchItem] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [customerData, setCustomerData] = useState({
    name: '',
    mobile: '',
    address: '',
  });
  const [summary, setSummary] = useState({
    porterage: 0,
    oldBalance: 0,
    discountType: 'fixed',
    discountValue: 0,
    receivedAmount: 0,
    note: '',
  });
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [message, setMessage] = useState('');
  const addButtonRef = useRef(null);


  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState(null);

  const [showAddItemModal, setShowAddItemModal] =
    useState(false);

  const [newItemData, setNewItemData] = useState({
    item: "",
    category: "",
    sellingPrice: "",
    unitType: "KG",
    weightPerUnit: ""
  });


  useEffect(() => {
    const savedData = localStorage.getItem("inventoryData");

    console.log("savedData:", savedData);

    if (savedData) {
      const inventory = JSON.parse(savedData);

      console.log("Inventory Count:", inventory.length);
      console.log("First Item:", inventory[0]);

      setInventory(inventory);
    }
  }, []);


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

  useEffect(() => {

    const savedDraft =
      localStorage.getItem(
        "currentBillingDraft"
      );

    if (!savedDraft) return;

    try {

      const draft =
        JSON.parse(savedDraft);

      setCustomerData(
        draft.customerData || {
          name: "",
          mobile: "",
          address: ""
        }
      );

      setLineItems(
        draft.lineItems || []
      );

      setSummary(
        draft.summary || {
          porterage: 0,
          oldBalance: 0,
          discountType: "fixed",
          discountValue: 0,
          receivedAmount: 0,
          note: ""
        }
      );

    } catch (error) {
      console.error(
        "Draft restore failed",
        error
      );
    }

  }, []);



  const handleWhatsAppBillShare = async () => {


    const success =
      await handleGeneratePDF();

    if (!success) return;


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
  };




  const handleCreateInventoryItem = () => {
    if (
      !newItemData.item ||
      !newItemData.category ||
      !newItemData.sellingPrice
    ) {
      alert("Please fill all required fields");
      return;
    }
    const inventoryData =
      JSON.parse(
        localStorage.getItem(
          "inventoryData"
        )
      ) || [];

    const newItem = {
      sn:
        Math.max(
          ...inventoryData.map(
            i => i.sn
          ),
          0
        ) + 1,

      item:
        `${newItemData.item}/${newItemData.item}`,

      type: "Custom",

      category:
        newItemData.category,

      costPrice: 0,

      sellingPrice:
        Number(
          newItemData.sellingPrice
        ),

      profit:
        Number(
          newItemData.sellingPrice
        ),

      unitType:
        newItemData.unitType,

      weightPerUnit:
        Number(
          newItemData.weightPerUnit
        )

    };

    const updatedInventory = [
      ...inventoryData,
      newItem
    ];

    localStorage.setItem(
      "inventoryData",
      JSON.stringify(
        updatedInventory
      )
    );

    setInventory(updatedInventory);

    addSpecificItem(newItem);

    setShowAddItemModal(false);
  };




  const handleAddLineItem = () => {

    if (!selectedItem) {
      setMessage("❌ Please select an item");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const item = inventory.find(i => {
      const marathiName =
        i.item.split("/")[0].trim();

      return marathiName === selectedItem;
    });

    if (!item) {
      setMessage("❌ Item not found");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    if (item.sellingPrice <= 0) {
      setMessage("❌ Product price is invalid");
      setTimeout(() => setMessage(""), 2000);
      return;
    }
    const existingIndex = lineItems.findIndex(
      (line) => line.sn === item.sn
    );

    if (existingIndex !== -1) {

      const allowDuplicate = window.confirm(
        `${item.item.split("/")[0].trim()} already exists at Sr No ${existingIndex + 1}.\n\nAdd again?`
      );

      if (!allowDuplicate) {

        setSearchItem("");
        setSelectedItem("");

        searchInputRef.current?.focus();

        return;
      }
    }



    const newId = Date.now();

    setLineItems(prev => [
      ...prev,
      {
        id: newId,
        sn: item.sn,
        name: item.item.split("/")[0].trim(),
        qty: 1,
        rate: item.sellingPrice,
        amount: item.sellingPrice,
        weightPerUnit: item.weightPerUnit,
        unitType: item.unitType,
      },
    ]);

    setSelectedItem("");
    setSearchItem("");

    setMessage("✅ Item added");
    setTimeout(() => setMessage(""), 2000);

    setTimeout(() => {
      const qtyInputs = document.querySelectorAll(
        '[data-line-field="qty"]'
      );

      const lastQty =
        qtyInputs[qtyInputs.length - 1];

      lastQty?.focus();
      lastQty?.select();
    }, 100);
  }


  const addSpecificItem = (item) => {
    const newId = Date.now();

    setLineItems(prev => [
      ...prev,
      {
        id: newId,
        sn: item.sn,
        name: item.item.split("/")[0].trim(),
        qty: 1,
        rate: item.sellingPrice,
        amount: item.sellingPrice,
        weightPerUnit: item.weightPerUnit,
        unitType: item.unitType,
      },
    ]);

    setSearchItem("");
    setSelectedItem("");

    setTimeout(() => {
      const qtyInputs = document.querySelectorAll(
        '[data-line-field="qty"]'
      );

      const lastInput =
        qtyInputs[qtyInputs.length - 1];

      lastInput?.focus();
      lastInput?.select();
    }, 100);
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



  const handleItemSelectKeyDown = (e) => {
    if (e.key === 'Enter' && selectedItem) {
      e.preventDefault();
      handleAddLineItem();
      return;
    }

    handleBillingEnterMove(e);
  };



  // const calculateTotals = () => {
  //   const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  //   const discount = summary.discountType === 'percentage'
  //     ? (subtotal * summary.discountValue) / 100
  //     : summary.discountValue;
  //   const afterDiscount = subtotal - discount;
  //   const total = afterDiscount + summary.porterage + summary.oldBalance;
  //   const payable = total - summary.receivedAmount;
  //   const totalWeight = lineItems.reduce((sum, item) => 
  //     sum + (item.qty * (item.weightPerUnit || 0)), 0);

  //   return { subtotal, discount, afterDiscount, total, payable, totalWeight };
  // };


  const calculateTotals = () => {
    const subtotal = lineItems.reduce(
      (sum, item) => {
        const amount = Number(item.amount);
        return sum + (Number.isFinite(amount) ? amount : 0);
      },
      0
    );

    const discount =
      summary.discountType === "percentage"
        ? (subtotal * summary.discountValue) / 100
        : summary.discountValue;

    const afterDiscount = subtotal - discount;

    const totalWeight = lineItems.reduce(
      (sum, item) =>
        sum + (item.qty * (item.weightPerUnit || 0)),
      0
    );

    // Porterage Formula
    let porterage =
      Math.round(
        ((totalWeight / 30) * 10) * 100
      ) / 100;

    // Only apply porterage if greater than ₹15
    if (porterage <= 20) {
      porterage = 0;
    }

    const total =
      afterDiscount +
      porterage +
      summary.oldBalance;

    const payable =
      total - summary.receivedAmount;

    return {
      subtotal,
      discount,
      afterDiscount,
      total,
      payable,
      totalWeight,
      porterage
    };
  };


  const totals = calculateTotals();


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
        invoiceNumber:
          storageManager.getInvoices().length + 1001
      });

      storageManager.saveInvoice({
        customer: customerData,
        items: lineItems,
        summary,
        totals
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
          <strong>Invoice #:</strong> ${storageManager.getInvoices().length + 1001}
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
        address: ""
      });

      setSummary({
        porterage: 0,
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




    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-teal-300 mb-6">Billing Module</h1>

      {message && (
        <div className="fixed top-4 right-4 bg-gray-800 border-l-4 border-teal-500 p-4 rounded shadow-lg z-50">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Billing Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Form */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-teal-300 mb-4">Customer Details</h2>
            <div className="space-y-3">
              <input

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
                onChange={(e) => setCustomerData({ ...customerData, mobile: e.target.value })}
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
                      const marathi =
                        item.item.split("/")[0]
                          .trim()
                          .toLowerCase();

                      const english =
                        item.item.split("/")[1]
                          ?.trim()
                          .toLowerCase() || "";

                      return (
                        marathi.includes(value.toLowerCase()) ||
                        english.includes(value.toLowerCase())
                      );
                    });

                    if (firstMatch) {
                      setSelectedItem(
                        firstMatch.item.split("/")[0].trim()
                      );

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





                {searchItem.trim() !== "" && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-y-auto">

                    {inventory
                      .filter((item) => {
                        const search = searchItem.toLowerCase().trim();

                        const marathiName =
                          item.item.split("/")[0].trim().toLowerCase();

                        const englishName =
                          item.item.split("/")[1]?.trim().toLowerCase() || "";

                        return (
                          marathiName.includes(search) ||
                          englishName.includes(search)
                        );
                      })
                      .slice(0, 15)
                      .map((item) => {
                        const marathiName =
                          item.item.split("/")[0].trim();

                        return (
                          <div
                            key={item.sn}

                            onClick={() => {
                              addSpecificItem(item);
                            }}

                            className="p-3 cursor-pointer hover:bg-teal-600/20 border-b border-gray-700 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-white">
                                {marathiName}
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

                    const marathiName =
                      item.item.split("/")[0]
                        .trim()
                        .toLowerCase();

                    const englishName =
                      item.item.split("/")[1]
                        ?.trim()
                        .toLowerCase() || "";

                    return (
                      marathiName.includes(search) ||
                      englishName.includes(search)
                    );
                  }).length === 0 && (

                    <div className="mt-2">
                      <button
                        onClick={() => {
                          setNewItemData(prev => ({
                            ...prev,
                            item: searchItem
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
                              if (
                                e.target.value === "" ||
                                Number(e.target.value) <= 0
                              ) {
                                handleUpdateLineItem(
                                  item.id,
                                  "qty",
                                  1
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
                            min="1"
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
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit sticky top-6 space-y-4">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Billing Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold">₹{totals.subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Porterage (₹)</label>
            <input

              type="number"
              data-billing-flow
              value={summary.porterage}
              onChange={(e) => setSummary({ ...summary, porterage: parseFloat(e.target.value) || 0 })}
              onKeyDown={handleBillingEnterMove}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Old Balance (₹)</label>
            <input

              type="number"
              data-billing-flow
              value={summary.oldBalance}
              onChange={(e) => setSummary({ ...summary, oldBalance: parseFloat(e.target.value) || 0 })}
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
              onChange={(e) => setSummary({ ...summary, discountValue: parseFloat(e.target.value) || 0 })}
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
              onChange={(e) => setSummary({ ...summary, receivedAmount: parseFloat(e.target.value) || 0 })}
              onKeyDown={handleBillingEnterMove}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
            />
          </div>

          <div className="bg-gray-700 p-4 rounded space-y-2 border border-gray-600">
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
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0
        }}
      >
        <InvoiceTemplate
          customerData={customerData}
          lineItems={lineItems}
          totals={totals}
          summary={summary}
          invoiceNumber={
            storageManager.getInvoices().length + 1001
          }
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
                  onClick={() =>
                    setShowAddItemModal(false)
                  }
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">

                <input
                  type="text"
                  placeholder="Product Name"
                  value={newItemData.item}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      item: e.target.value
                    })
                  }
                  className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />

                <input
                  type="text"
                  placeholder="Category"
                  value={newItemData.category}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      category: e.target.value
                    })
                  }
                  className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />

                <input
                  type="number"
                  placeholder="Selling Price"
                  value={newItemData.sellingPrice}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      sellingPrice: e.target.value
                    })
                  }
                  className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />

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
                  <option value="KG">KG</option>
                  <option value="Gram">Gram</option>
                  <option value="Piece">Piece</option>
                  <option value="Box">Box</option>
                </select>

              </div>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={() =>
                    setShowAddItemModal(false)
                  }
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
