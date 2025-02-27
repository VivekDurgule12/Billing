import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import CustomerForm from './components/CustomerForm';
import ItemList from './components/ItemList';
import BillingSummary from './components/BillingSummary';
import InvoiceGenerator from './components/InvoiceGenerator';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customer, setCustomer] = useState({
    name: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [items, setItems] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(0);

  // Check login status
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') setIsLoggedIn(true);
  }, []);

  // Load data from localStorage after login
  useEffect(() => {
    if (isLoggedIn) {
      setCustomer(JSON.parse(localStorage.getItem('customer')) || customer);
      setItems(JSON.parse(localStorage.getItem('items')) || []);
      setRemainingAmount(parseFloat(localStorage.getItem('remainingAmount')) || 0);
    }
  }, [isLoggedIn]);

  // Save changes to localStorage
  useEffect(() => {
    if (isLoggedIn) localStorage.setItem('customer', JSON.stringify(customer));
  }, [customer]);

  useEffect(() => {
    if (isLoggedIn) localStorage.setItem('items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (isLoggedIn) localStorage.setItem('remainingAmount', remainingAmount);
  }, [remainingAmount]);

  // Add new item only if the last one is filled correctly
  const addItem = () => {
    if (items.length > 0) {
      const lastItem = items[items.length - 1];

      if (!lastItem.name || Number(lastItem.quantity) < 0.25 || Number(lastItem.price) <= 0) {
        alert('Please fill all fields correctly before adding a new item.');
        return;
      }
    }

    setItems([...items, { id: Date.now(), name: '', quantity: '1', price: '0', total: 0, isEditing: true }]);
  };

  // Remove an item from the list
  const removeItem = (id) => setItems(items.filter((item) => item.id !== id));

  // Update item details while ensuring valid values
  const updateItem = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          let updatedItem = { ...item, [field]: value };

          let quantity = parseFloat(updatedItem.quantity) || 0;
          let price = parseFloat(updatedItem.price) || 0;

          // Enforce validation: Minimum quantity 0.25, price should be positive
          if (quantity < 0.25 || price <= 0) {
            updatedItem.total = 0; // Invalid total
          } else {
            updatedItem.total = (quantity * price).toFixed(2);
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  // Calculate the total amount with correct rounding
  const totalAmount = items
    .filter((item) => item.name && Number(item.quantity) >= 0.25 && Number(item.price) >= 0)
    .reduce((sum, item) => sum + Number(item.total), 0)
    .toFixed(2);

  // Save invoice only if all fields are correctly filled
  const handleSaveInvoice = () => {
    const hasIncompleteItems = items.some(
      (item) => !item.name || Number(item.quantity) < 0.25 || Number(item.price) <= 0
    );

    if (hasIncompleteItems) {
      alert('Please fill all fields correctly before saving.');
      return;
    }

    localStorage.setItem('items', JSON.stringify(items));
    localStorage.setItem('customer', JSON.stringify(customer));
    localStorage.setItem('remainingAmount', remainingAmount);
    alert('Invoice saved successfully!');
  };

  // Handle login
  const handleLogin = (username, password) => {
    if (username === 'Vivek' && password === 'Vivek12') {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      alert('Invalid username or password');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('isLoggedIn', 'false');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-teal-900 text-white p-4 sm:p-6">
      {isLoggedIn ? (
        <div className="container mx-auto max-w-4xl bg-gray-700 rounded-3xl shadow-2xl p-6 sm:p-8 border border-teal-600">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-teal-300 tracking-widest drop-shadow-lg animate-fade-in">
              Invoice Builder
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-sm"
            >
              Logout
            </button>
          </div>
          <CustomerForm customer={customer} setCustomer={setCustomer} />
          <ItemList items={items} removeItem={removeItem} updateItem={updateItem} />
          <button
            onClick={addItem}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-3 rounded-xl mt-6 w-full sm:w-1/3 mx-auto block hover:bg-teal-700 hover:scale-105 transition-all duration-300 shadow-lg text-lg font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Item
          </button>
          <BillingSummary
            totalAmount={totalAmount}
            remainingAmount={remainingAmount}
            setRemainingAmount={setRemainingAmount}
          />
          <InvoiceGenerator
            customer={customer}
            items={items}
            totalAmount={totalAmount}
            remainingAmount={remainingAmount}
            onSaveInvoice={handleSaveInvoice}
          />
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;