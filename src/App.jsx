// import React, { useCallback, useEffect, useState } from "react";
// import BillingSummary from "./components/BillingSummary";
// import CustomerForm from "./components/CustomerForm";
// import InvoiceGenerator from "./components/InvoiceGenerator";
// import ItemList from "./components/ItemList";
// import Login from "./components/Login";

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [customer, setCustomer] = useState({
//     name: "",
//     email: "",
//     address: "",
//     phone: "",
//     date: new Date().toISOString().split("T")[0],
//   });
//   const [items, setItems] = useState([]);
//   const [remainingAmount, setRemainingAmount] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const loadInitialData = useCallback(() => {
//     setIsLoading(true);
//     try {
//       const loggedIn = localStorage.getItem("isLoggedIn");
//       if (loggedIn === "true") {
//         setIsLoggedIn(true);
//         const savedCustomer = localStorage.getItem("customer");
//         if (savedCustomer) setCustomer(JSON.parse(savedCustomer));

//         const savedItems = localStorage.getItem("items");
//         if (savedItems) setItems(JSON.parse(savedItems));

//         const savedRemaining = localStorage.getItem("remainingAmount");
//         if (savedRemaining) setRemainingAmount(parseFloat(savedRemaining) || 0);
//       }
//     } catch (err) {
//       setError("Failed to load initial data");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadInitialData();
//   }, [loadInitialData]);

//   const saveToLocalStorage = () => {
//     if (isLoggedIn) {
//       try {
//         localStorage.setItem("customer", JSON.stringify(customer));
//         localStorage.setItem("items", JSON.stringify(items));
//         localStorage.setItem("remainingAmount", remainingAmount.toString());
//         setError(null);
//       } catch (err) {
//         setError("Failed to save data");
//       }
//     }
//   };

//   const addItem = () => {
//     const lastItem = items[items.length - 1];
//     if (
//       lastItem &&
//       (!lastItem.name ||
//         !isValidNumber(lastItem.quantity) ||
//         !isValidNumber(lastItem.price))
//     ) {
//       setError(
//         "Please complete the previous item (name, qty, price) before adding a new one."
//       );
//       return;
//     }
//     setItems([
//       ...items,
//       {
//         id: Date.now(),
//         name: "",
//         quantity: "",
//         price: "",
//         total: 0,
//       },
//     ]);
//     setError(null);
//   };

//   const removeItem = (id) => {
//     setItems(items.filter((item) => item.id !== id));
//     saveToLocalStorage();
//   };

//   const updateItem = (id, field, value) => {
//     setItems((prevItems) =>
//       prevItems.map((item) => {
//         if (item.id !== id) return item;
//         const updatedItem = { ...item, [field]: value };
//         const quantity = Number(updatedItem.quantity) || 0;
//         const price = Number(updatedItem.price) || 0;
//         updatedItem.total = quantity * price;
//         return updatedItem;
//       })
//     );
//   };

//   const handleKeyPress = (e, field, itemId) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       updateItem(itemId, field, e.target.value);
//       if (field === "price") {
//         saveToLocalStorage();
//       }
//     }
//   };

//   const handleCustomerKeyPress = (e, field) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       saveToLocalStorage();
//     }
//   };

//   const isValidNumber = (value) => {
//     const num = Number(value);
//     return !isNaN(num) && num >= 0;
//   };

//   const calculateTotals = useCallback(() => {
//     const validItems = items.filter(
//       (item) =>
//         item.name && isValidNumber(item.quantity) && isValidNumber(item.price)
//     );

//     const total = validItems.reduce(
//       (sum, item) => sum + Number(item.quantity) * Number(item.price),
//       0
//     );
//     return { total };
//   }, [items]);

//   const { total } = calculateTotals();

//   const generateInvoiceText = () => {
//     let text = "INVOICE\n";
//     text += "----------------------------------------\n";
//     text += `Customer: ${customer.name || "N/A"}\n`;
//     text += `Email: ${customer.email || "N/A"}\n`;
//     text += `Address: ${customer.address || "N/A"}\n`;
//     text += `Phone: ${customer.phone || "N/A"}\n`;
//     text += `Date: ${customer.date || "N/A"}\n`;
//     text += "----------------------------------------\n";
//     text += "Items:\n";
//     items.forEach((item) => {
//       text += `${item.name || "Unnamed"} - Qty:${item.quantity || "0"} * ₹${
//         item.price || "0"
//       } - ₹${item.total.toFixed(2)}\n`;
//     });
//     text += "----------------------------------------\n";
//     text += `Total: ₹${total.toFixed(2)}\n`;
//     text += `Remaining: ₹${remainingAmount.toFixed(2)}\n`;
//     text += "----------------------------------------\n";
//     return text;
//   };

//   const shareInvoice = () => {
//     const invoiceText = generateInvoiceText();
//     if (navigator.share) {
//       navigator
//         .share({
//           title: "Invoice",
//           text: invoiceText,
//         })
//         .catch((err) => setError("Failed to share invoice"));
//     } else {
//       navigator.clipboard
//         .writeText(invoiceText)
//         .then(() => alert("Invoice copied to clipboard!"))
//         .catch(() => setError("Failed to copy invoice"));
//     }
//   };

//   const handleLogin = async (username, password) => {
//     setIsLoading(true);
//     try {
//       await new Promise((resolve) => setTimeout(resolve, 500));
//       if (username === "Vivek" && password === "Vivek12") {
//         setIsLoggedIn(true);
//         localStorage.setItem("isLoggedIn", "true");
//       } else {
//         throw new Error("Invalid credentials");
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     localStorage.setItem("isLoggedIn", "false");
//   };

//   const clearBill = () => {
//     if (
//       window.confirm(
//         "Are you sure you want to clear the bill? This will reset all data."
//       )
//     ) {
//       setCustomer({
//         name: "",
//         email: "",
//         address: "",
//         phone: "",
//         date: new Date().toISOString().split("T")[0],
//       });
//       setItems([]);
//       setRemainingAmount(0);
//       localStorage.clear();
//       setError(null);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-teal-900">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-400"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-950 to-gray-800 text-white p-6 sm:p-8">
//       {error && (
//         <div className="fixed top-6 right-6 bg-red-600/90 backdrop-blur-sm p-4 rounded-xl shadow-lg animate-slide-in flex items-center gap-2 z-50">
//           <span>{error}</span>
//           <button onClick={() => setError(null)} className="text-lg font-bold">
//             ×
//           </button>
//         </div>
//       )}

//       {isLoggedIn ? (
//         <div className="container mx-auto max-w-6xl bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-teal-500/30">
//           <header className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
//             <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 animate-fade-in">
//               Invoice Builder
//             </h1>
//             <div className="flex gap-4">
//               <button
//                 onClick={clearBill}
//                 className="bg-gradient-to-r from-yellow-500 to-orange-500 px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-md text-sm font-medium flex items-center gap-2"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M3 7h18"
//                   />
//                 </svg>
//                 Clear Bill
//               </button>
//               <button
//                 onClick={handleLogout}
//                 className="bg-gradient-to-r from-red-500 to-rose-500 px-5 py-2.5 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-300 shadow-md text-sm font-medium flex items-center gap-2"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
//                   />
//                 </svg>
//                 Logout
//               </button>
//             </div>
//           </header>

//           <div className="space-y-8">
//             <CustomerForm
//               customer={customer}
//               setCustomer={setCustomer}
//               onKeyPress={handleCustomerKeyPress}
//             />
//             <ItemList
//               items={items}
//               removeItem={removeItem}
//               updateItem={updateItem}
//               addItem={addItem}
//               onKeyPress={handleKeyPress}
//             />

//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <button
//                 onClick={addItem}
//                 className="bg-gradient-to-r from-teal-500 to-cyan-500 w-full sm:w-64 py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-semibold flex items-center justify-center gap-2 transform hover:-translate-y-1"
//               >
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M12 4v16m8-8H4"
//                   />
//                 </svg>
//                 Add Item
//               </button>
//               <button
//                 onClick={shareInvoice}
//                 className="bg-gradient-to-r from-blue-500 to-indigo-500 w-full sm:w-64 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-semibold flex items-center justify-center gap-2 transform hover:-translate-y-1"
//               >
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
//                   />
//                 </svg>
//                 Share Invoice
//               </button>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <BillingSummary
//                 totalAmount={total}
//                 remainingAmount={remainingAmount}
//                 setRemainingAmount={setRemainingAmount}
//               />
//               <InvoiceGenerator
//                 customer={customer}
//                 items={items}
//                 totalAmount={total}
//                 remainingAmount={remainingAmount}
//               />
//             </div>
//           </div>
//         </div>
//       ) : (
//         <Login onLogin={handleLogin} />
//       )}
//     </div>
//   );
// }

// export default App;






// Inside App.js

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
                setError(null);
            } catch (err) {
                setError("Failed to save data");
            }
        }
    };

    const addItem = () => {
        if (items.length > 0) {
            const lastItem = items[items.length - 1];

            if (!lastItem.name) {
                setError("Item name is required.");
                setFocusedItemId(lastItem.id);
                setFocusedField("name");
                return;
            }
            if (!isValidNumber(lastItem.quantity) || lastItem.quantity === "") {
                setError("Item quantity is required and must be a number.");
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

    const handleKeyDown = (e, field, itemId) => { // Rename from handleKeyPress to handleKeyDown
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
                         if (!isValidNumber(lastItem.quantity) || lastItem.quantity === "") {
                             setError("Item quantity is required and must be a number.");
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
            }
           else if (field === "name") {
                setFocusedItemId(itemId);
                setFocusedField("quantity");
                setEnterCount(0); // RESET HERE!
            } else if (field === "quantity") {
                setFocusedItemId(itemId);
                setFocusedField("price");
                setEnterCount(0); // RESET HERE!
            }
        } else {
            setEnterCount(0); //Also add Reset here on not key
        }
    };

    const handleBlur = (field, itemId) => { // New blur handler
        if (focusedItemId === itemId && focusedField === field) {
            updateItem(itemId, field, document.getElementById(`${itemId}-${field}`).value); // Or e.target.value if available
            saveToLocalStorage();
        }
    };

    const handleChange = (e, field, itemId) => {
        updateItem(itemId, field, e.target.value); // Update the item on every change

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

    const calculateTotals = useCallback(() => {
        const validItems = items.filter(
            (item) =>
                item.name && isValidNumber(item.quantity) && isValidNumber(item.price)
        );

        const total = validItems.reduce(
            (sum, item) => sum + Number(item.quantity) * Number(item.price),
            0
        );
        return { total };
    }, [items]);

    const { total } = calculateTotals();

    const generateInvoiceText = () => {
        let text = "INVOICE \n DURGULE STORE";
        text += "----------------------------------------\n";
        text += `Customer: ${customer.name || "N/A"}\n`;
        text += `Email: ${customer.email || "N/A"}\n`;
        text += `Address: ${customer.address || "N/A"}\n`;
        text += `Phone: ${customer.phone || "N/A"}\n`;
        text += `Date: ${customer.date || "N/A"}\n`;
        text += "----------------------------------------\n";
        text += "Items:\n";
        items.forEach((item, index) => {
            text += `${index + 1}. ${item.name || "Unnamed"} - Qty:${item.quantity || "0"} * ₹${
                item.price || "0"
            } - ₹${item.total.toFixed(2)}\n`;
        });
        text += "----------------------------------------\n";
        text += `Total: ₹${total.toFixed(2)}\n`;
        text += `Remaining: ₹${remainingAmount.toFixed(2)}\n`;
        text += "----------------------------------------\n";
        return text;
    };
    const shareInvoiceText = () => {
      const invoiceText = generateInvoiceText();
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

        if (shareToWhatsapp) {
            // if (!customer.phone) {
            //     alert("Customer phone number is required to send to WhatsApp.");
            //     return;
            // }
            //const whatsappURL = `https://wa.me/${customer.phone}?text=${encodeURIComponent(invoiceText)}`;
            const whatsappURL = `https://wa.me/${customer.phone || "9112251220"}?text=${encodeURIComponent(invoiceText)}`;
            window.open(whatsappURL, '_blank');
        } else {
            if (navigator.share) {
                navigator.share({
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
                            onClick={() => shareInvoice(true)} // Pass true to trigger WhatsApp
                            className="bg-gradient-to-r from-green-500 to-emerald-500 w-full sm:w-64 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl text-lg font-semibold flex items-center justify-center gap-2 transform hover:-translate-y-1"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375H7.5a3.375 3.375 0 00-3.375 3.375v2.625m16.5 0H12.546a.75.75 0 01-.75-.75v-4.5a.75.75 0 01.75-.75h6.954m-16.5 0H7.454a.75.75 0 00.75.75v4.5a.75.75 0 00-.75.75h-6.954M18 10.875v-1.5a2.25 2.25 0 00-2.25-2.25H4.25A2.25 2.25 0 002 9.375v7.5a2.25 2.25 0 002.25 2.25h11.5A2.25 2.25 0 0018 16.5v-1.5m-15 3.75h1.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3m12.75 0h1.5a1.5 1.5 0 011.5 1.5v15a1.5 1.5 0 01-1.5 1.5H15"
                              />
                            </svg>
                            Share on WhatsApp
                          </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <BillingSummary
                                totalAmount={total}
                                remainingAmount={remainingAmount}
                                setRemainingAmount={setRemainingAmount}
                            />
                            <InvoiceGenerator
                                customer={customer}
                                items={items}
                                totalAmount={total}
                                remainingAmount={remainingAmount}
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