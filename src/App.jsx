import React, { useCallback, useEffect, useState, useRef } from "react";

import BillingSummary from "./components/BillingSummary";
import CustomerForm from "./components/CustomerForm";
import InvoiceGenerator from "./components/InvoiceGenerator";
import ItemList from "./components/ItemList";
import Login from "./components/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [items, setItems] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [porterage, setPorterage] = useState(0); // New state for porterage
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enterCount, setEnterCount] = useState(0);
  const [focusedItemId, setFocusedItemId] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const loadInitialData = useCallback(() => {
    setIsLoading(true);
    try {
      const loggedIn = localStorage.getItem("isLoggedIn");
      if (loggedIn === "true") {
        setIsLoggedIn(true);
        const savedCustomer = localStorage.getItem("customer");
        if (savedCustomer) setCustomer(JSON.parse(savedCustomer));

        const savedItems = localStorage.getItem("items");
        if (savedItems) setItems(JSON.parse(savedItems));

        const savedRemaining = localStorage.getItem("remainingAmount");
        if (savedRemaining) setRemainingAmount(parseFloat(savedRemaining) || 0);

        const savedPorterage = localStorage.getItem("porterage"); // Load porterage from localStorage
        if (savedPorterage) setPorterage(parseFloat(savedPorterage) || 0);
      }
    } catch (err) {
      setError("Failed to load initial data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const saveToLocalStorage = () => {
    if (isLoggedIn) {
      try {
        localStorage.setItem("customer", JSON.stringify(customer));
        localStorage.setItem("items", JSON.stringify(items));
        localStorage.setItem("remainingAmount", remainingAmount.toString());
        localStorage.setItem("porterage", porterage.toString()); // Save porterage to localStorage
        setError(null);
      } catch (err) {
        setError("Failed to save data");
      }
    }
  };

  const addItem = () => {
    if (!customer.name) {
      setError("Customer name is required before adding items.");
      return;
    }
    if (!customer.address) {
      setError("Customer address is required before adding items.");
      return;
    }

    if (items.length > 0) {
      const lastItem = items[items.length - 1];

      if (!lastItem.name) {
        setError("Item name is required.");
        setFocusedItemId(lastItem.id);
        setFocusedField("name");
        return;
      }
      if (
        !isValidNumber(lastItem.quantity) ||
        lastItem.quantity === "" ||
        Number(lastItem.quantity) === 0
      ) {
        setError(
          "Item quantity is required, must be a number, and must be greater than zero."
        );
        setFocusedItemId(lastItem.id);
        setFocusedField("quantity");
        return;
      }
      if (!isValidNumber(lastItem.price) || lastItem.price === "") {
        setError("Item price is required and must be a number.");
        setFocusedItemId(lastItem.id);
        setFocusedField("price");
        return;
      }
    }

    const newItem = {
      id: Date.now(),
      name: "",
      quantity: "",
      price: "",
      total: 0,
    };
    setItems([...items, newItem]);
    setFocusedItemId(newItem.id);
    setFocusedField("name");
    setError(null);
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
    saveToLocalStorage();
  };

  const updateItem = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;
        const updatedItem = { ...item, [field]: value };
        const quantity = Number(updatedItem.quantity) || 0;
        const price = Number(updatedItem.price) || 0;
        updatedItem.total = quantity * price;
        return updatedItem;
      })
    );
  };

  const handleKeyDown = (e, field, itemId) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (field === "price") {
        setEnterCount((prevCount) => prevCount + 1);
        if (enterCount >= 1) {
          if (items.length > 0) {
            const lastItem = items[items.length - 1];

            if (!lastItem.name) {
              setError("Item name is required.");
              setFocusedItemId(lastItem.id);
              setFocusedField("name");
              return;
            }
            if (
              !isValidNumber(lastItem.quantity) ||
              lastItem.quantity === "" ||
              Number(lastItem.quantity) === 0
            ) {
              setError(
                "Item quantity is required, must be a number, and must be greater than zero."
              );
              setFocusedItemId(lastItem.id);
              setFocusedField("quantity");
              return;
            }
            if (!isValidNumber(lastItem.price) || lastItem.price === "") {
              setError("Item price is required.");
              setFocusedItemId(lastItem.id);
              setFocusedField("price");
              return;
            }
          }
          addItem();
          setEnterCount(0);
        }
      } else if (field === "name") {
        setFocusedItemId(itemId);
        setFocusedField("quantity");
        setEnterCount(0);
      } else if (field === "quantity") {
        setFocusedItemId(itemId);
        setFocusedField("price");
        setEnterCount(0);
      }
    } else {
      setEnterCount(0);
    }
  };

  const handleBlur = (field, itemId) => {
    if (focusedItemId === itemId && focusedField === field) {
      updateItem(
        itemId,
        field,
        document.getElementById(`${itemId}-${field}`).value
      );
      saveToLocalStorage();
    }
  };

  const handleChange = (e, field, itemId) => {
    updateItem(itemId, field, e.target.value);
  };

  const handleCustomerKeyPress = (e, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveToLocalStorage();
    }
  };

  const isValidNumber = (value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  };

  // const calculateTotals = useCallback(() => {
  //     const validItems = items.filter(
  //         (item) =>
  //             item.name && isValidNumber(item.quantity) && isValidNumber(item.price)
  //     );

  //     const totalAmount = validItems.reduce(
  //         (sum, item) => sum + Number(item.quantity) * Number(item.price),
  //         0
  //     );
  //     const totalQuantity = validItems.reduce(
  //         (sum, item) => sum + Number(item.quantity) ,
  //         0
  //     );
  //     return { totalAmount, totalQuantity };
  // }, [items]);

  // const { totalAmount, totalQuantity } = calculateTotals();

  const calculateTotals = useCallback(() => {
    const validItems = items.filter(
      (item) =>
        item.name && isValidNumber(item.quantity) && isValidNumber(item.price)
    );

    const totalAmount = validItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.price),
      0
    );
    const totalQuantity = validItems.reduce(
      (sum, item) => sum + Number(item.quantity),
      0
    );

    const totalBill = totalAmount + remainingAmount + porterage; // Calculate Total Bill (including porterage)

    return { totalAmount, totalQuantity, totalBill }; // Include totalBill in the returned object
  }, [items, remainingAmount, porterage]); // Add porterage to the dependency array

  const { totalAmount, totalQuantity, totalBill } = calculateTotals(); // Get totalBill from the returned object

  const generateInvoiceText = () => {
    let text = "||श्री|| \nINVOICE \nDURGULE STORE\n";
    text += "--------------------------------------\n";
    text += `Customer: ${customer.name || "N/A"}\n`;
    // text += `Email: ${customer.email || "N/A"}\n`;
    text += `Address: ${customer.address || "N/A"}\n`;
    text += `Phone:  ${customer.phone || "N/A"}\n`;
    text += `Date: ${customer.date || "N/A"}\n`;
    text += "--------------------------------------\n";
    text += "Items:\n";
    items.forEach((item, index) => {
      text += `${index + 1}. ${item.name || "Unnamed"} - Qty:${
        item.quantity || "0"
      } * ₹${item.price || "0"} - ₹${item.total.toFixed(2)}\n`;
    });
    text += "--------------------------------------\n";
    text += `Weight: ${totalQuantity.toFixed(2)} Kg.\n`;
    text += `Total: ₹${totalAmount.toFixed(2)}\n`;
    text += `Remaining: ₹${remainingAmount.toFixed(2)}\n`;
    text += `Porterage: ₹${porterage.toFixed(2)}\n`; // Show porterage in invoice text
    text += `Total Bill: ₹${(porterage + remainingAmount + totalAmount).toFixed(2)}\n`;
    text += "--------------------------------------\n";
    return text;
  };

  const downloadInvoiceAsText = (invoiceText) => {
    const filename = `Invoice_${
      customer.name.replace(/\s+/g, "_") || "Guest"
    }_${customer.date}.txt`;
    const blob = new Blob([invoiceText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  const shareInvoiceText = () => {
    const invoiceText = generateInvoiceText();
    downloadInvoiceAsText(invoiceText); // Download as text when clicking "Share Invoice" button
    if (navigator.share) {
      navigator
        .share({
          title: "Invoice",
          text: invoiceText,
        })
        .catch((err) => setError("Failed to share invoice"));
    } else {
      navigator.clipboard
        .writeText(invoiceText)
        .then(() => alert("Invoice copied to clipboard!"))
        .catch(() => setError("Failed to copy invoice"));
    }
  };

  const shareInvoice = (shareToWhatsapp = false) => {
    const invoiceText = generateInvoiceText();
    downloadInvoiceAsText(invoiceText); // Download as text when sharing to WhatsApp

    if (shareToWhatsapp) {
      const whatsappURL = `https://wa.me/${
        customer.phone || "9112251220" || "9922019611"
      }?text=${encodeURIComponent(invoiceText)}`;
      window.open(whatsappURL, "_blank");
    } else {
      if (navigator.share) {
        navigator
          .share({
            title: "Invoice",
            text: invoiceText,
          })
          .catch((err) => setError("Failed to share invoice"));
      } else {
        navigator.clipboard
          .writeText(invoiceText)
          .then(() => alert("Invoice copied to clipboard!"))
          .catch(() => setError("Failed to copy invoice"));
      }
    }
  };

  const handlePrint = useCallback(() => {
    "use strict";

    if (!items?.length || totalAmount === 0) {
      alert("Invoice is empty. Cannot print.");
      return;
    }

    const invoiceContent = generateInvoiceText();
    if (!invoiceContent?.trim()) {
      alert("Invoice content is empty. Cannot print.");
      return;
    }

    const customerName = customer?.name || "Customer";
    const invoiceDate =
      customer?.date || new Date().toISOString().split("T")[0];

    const sanitizedCustomerName = customerName
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");
    const sanitizedInvoiceDate = invoiceDate.replace(/[^0-9-]/g, "");
    const fileName = `${sanitizedCustomerName}_Invoice_${sanitizedInvoiceDate}`;

    const lines = invoiceContent.split("\n");
    const lastThreeIndex = Math.max(1, lines.length - 6);

    const billHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${fileName}</title>
              <style>

                @media print {
                  @page {
                    size: 76mm;
                    margin: 0;
                  }
                  body {
                    width: 76mm;
                    margin: 0;
                    padding: 5px;
                    font-family: monospace;
                    font-size: 9pt;
                    line-height: 1.2;
                    -webkit-print-color-adjust: exact;
                  }
                }

                @media screen {
                  body {
                    width: 95%;
                    max-width: 500px;
                    margin: 20px auto;
                    padding: 15px;
                    font-family: monospace;
                    font-size: 14px;
                    line-height: 1.4;
                    -webkit-print-color-adjust: exact;
                    box-sizing: border-box;
                  }
                }


                .center {
                  text-align: center;
                  font-weight: bold;
                }
                .left {
                  text-align: left;
                }
                .bold {
                  font-weight: bold;
                }

                * {
                  page-break-inside: avoid;
                  page-break-before: avoid;
                  page-break-after: avoid;
                }

              </style>
            </head>
            <body>
              ${lines
                .map((line, index) => {
                  if (index < 3) {
                    return `<div class="center bold">${line}</div>`;
                  } else if (index >= lastThreeIndex) {
                    return `<div class="left bold">${line}</div>`;
                  } else {
                    return `<div class="left">${line}</div>`;
                  }
                })
                .join("")}
            </body>
          </html>
        `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Failed to open print window.");
      return;
    }

    printWindow.document.write(billHtml);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  }, [items, totalAmount, generateInvoiceText, customer]);

  const PrintButton = () => (
    <button
      onClick={handlePrint}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
    >
      Print Invoice
    </button>
  );

  const handleLogin = async (username, password) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (username === "Vivek" && password === "Vivek12") {
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem("isLoggedIn", "false");
  };

  const clearBill = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the bill? This will reset all data."
      )
    ) {
      setCustomer({
        name: "",
        email: "",
        address: "",
        phone: "",
        date: new Date().toISOString().split("T")[0],
      });
      setItems([]);
      setRemainingAmount(0);
      setPorterage(0); // Clear porterage too
      localStorage.clear();
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-950 to-gray-800 text-white p-6 sm:p-8">
      {error && (
        <div className="fixed top-6 right-6 bg-red-600/90 backdrop-blur-sm p-4 rounded-xl shadow-lg animate-slide-in flex items-center gap-2 z-50">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-lg font-bold">
            ×
          </button>
        </div>
      )}

      {isLoggedIn ? (
        <div className="container mx-auto max-w-6xl bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-teal-500/30">
          <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 animate-fade-in">
              Invoice Builder
            </h1>
            <div className="flex gap-4">
              <button
                onClick={clearBill}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-md text-sm font-medium flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M3 7h18"
                  />
                </svg>
                Clear Bill
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-rose-500 px-5 py-2.5 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-300 shadow-md text-sm font-medium flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </header>

          <div className="space-y-8">
            <CustomerForm
              customer={customer}
              setCustomer={setCustomer}
              onKeyPress={handleCustomerKeyPress}
            />
            <ItemList
              items={items}
              removeItem={removeItem}
              updateItem={updateItem}
              addItem={addItem}
              handleKeyDown={handleKeyDown}
              handleBlur={handleBlur}
              handleChange={handleChange}
              focusedItemId={focusedItemId}
              focusedField={focusedField}
            />

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={addItem}
                className={`bg-gradient-to-r from-teal-500 to-cyan-500 w-full sm:w-64 py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-semibold flex items-center justify-center gap-2 transform hover:-translate-y-1`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Item
              </button>
              <button
                onClick={shareInvoiceText}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 w-full sm:w-64 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-semibold flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share Invoice
              </button>
              <button
                onClick={() => shareInvoice(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-500 w-full sm:w-64 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-semibold flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#25D366"
                    d="M12.04 2.01C6.51 2.01 2 6.5 2 12.01c0 2.191.63 4.233 1.72 5.974L2 22l4.138-1.679a10.03 10.03 0 0 0 5.902 1.65c5.53 0 10.04-4.49 10.04-9.99s-4.51-9.98-10.04-9.98zm0 18.01c-1.812 0-3.497-.52-4.936-1.423l-.354-.22-2.454.994.942-2.394-.23-.366A8.044 8.044 0 0 1 4 12.01c0-4.41 3.592-8 8.04-8s8.04 3.59 8.04 8-3.592 8-8.04 8zm4.521-6.023c-.248-.125-1.471-.725-1.699-.805-.229-.08-.395-.124-.561.124-.167.249-.644.805-.791.973-.146.167-.291.186-.54.06-.248-.125-1.048-.387-1.995-1.237-.737-.653-1.232-1.462-1.378-1.711s-.015-.382.11-.506c.114-.113.248-.296.373-.445.125-.15.166-.25.248-.415.083-.166.042-.31-.02-.435-.062-.125-.561-1.35-.768-1.848-.202-.484-.407-.417-.561-.426-.146-.008-.31-.01-.474-.01a.92.92 0 0 0-.66.31c-.227.249-.868.849-.868 2.071 0 .292.052.575.124.847.228.805.717 1.49.806 1.604.104.124 1.68 2.57 4.075 3.605.57.246 1.017.392 1.366.502.573.181 1.093.155 1.504.093.458-.07 1.471-.602 1.678-1.182.208-.58.208-1.076.146-1.182-.063-.106-.229-.172-.478-.297z"
                  />
                </svg>
                Share on WhatsApp
              </button>
              <button
                onClick={() => downloadInvoiceAsText(generateInvoiceText())}
                className="bg-gradient-to-r from-gray-500 to-gray-600 w-full sm:w-64 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-semibold flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                  <path d="M7 10l5 5 5-5" />
                  <path d="M12 15V3" />
                </svg>
                Download Invoice
              </button>
            </div>

            <div className="text-center">
              <PrintButton />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* <BillingSummary
                                totalAmount={totalAmount}
                                remainingAmount={remainingAmount}
                                setRemainingAmount={setRemainingAmount}
                            /> */}
              <BillingSummary
                totalAmount={totalAmount}
                remainingAmount={remainingAmount}
                setRemainingAmount={setRemainingAmount}
                porterage={porterage} // pass porterage
                setPorterage={setPorterage} // pass setPorterage
                totalBill={totalBill}
              />
              {/* <InvoiceGenerator
                customer={customer}
                items={items}
                totalAmount={totalAmount}
                remainingAmount={remainingAmount}
              /> */}
               <InvoiceGenerator
                customer={customer}
                items={items}
                totalAmount={totalAmount}
                remainingAmount={remainingAmount}
                porterage={porterage} // pass porterage
                totalBill={totalBill}
              />
            </div>
          </div>
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
