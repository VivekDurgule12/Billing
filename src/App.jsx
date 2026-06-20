import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import InventoryMaster from './components/InventoryMaster';
import BillingModule from './components/BillingModule';
import OrdersModule from './components/OrdersModule';
import BillHistory from './components/BillHistory';



export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('billing');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLogin = localStorage.getItem('isLoggedIn');
    if (savedLogin === 'true') {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (username, password) => {
    if (username && password) {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    setCurrentPage('billing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-teal-300 text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Navigation */}
    {/* Navigation */}
<nav className="bg-gray-800 border-b-2 border-teal-600 sticky top-0 z-40">
  <div className="px-3 py-3">
    
    {/* Header */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-teal-300 text-center lg:text-left">
        Durgule Billing System
      </h1>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap justify-center lg:justify-end gap-2">

        <button
          onClick={() => setCurrentPage("billing")}
          className={`px-3 sm:px-4 py-2 rounded font-semibold text-sm sm:text-base transition-all ${
            currentPage === "billing"
              ? "bg-teal-600 text-white shadow-lg"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Billing
        </button>

        <button
          onClick={() => setCurrentPage("inventory")}
          className={`px-3 sm:px-4 py-2 rounded font-semibold text-sm sm:text-base transition-all ${
            currentPage === "inventory"
              ? "bg-teal-600 text-white shadow-lg"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Inventory
        </button>

        <button
          onClick={() => setCurrentPage("history")}
          className={`px-3 sm:px-4 py-2 rounded font-semibold text-sm sm:text-base transition-all ${
            currentPage === "history"
              ? "bg-teal-600 text-white shadow-lg"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Bill History
        </button>

        <button
          onClick={() => setCurrentPage("orders")}
          className={`px-3 sm:px-4 py-2 rounded font-semibold text-sm sm:text-base transition-all ${
            currentPage === "orders"
              ? "bg-teal-600 text-white shadow-lg"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Orders
        </button>

        <button
          onClick={handleLogout}
          className="px-3 sm:px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold text-sm sm:text-base transition-all"
        >
          Logout
        </button>

      </div>
    </div>
  </div>
</nav>

  {currentPage === 'billing' && (
  <BillingModule
    setCurrentPage={setCurrentPage}
  />
)}

{currentPage === 'inventory' && (
  <InventoryMaster />
)}

{currentPage === 'orders' && (
  <OrdersModule />
)}

{currentPage === 'history' && (
  <BillHistory
    setCurrentPage={setCurrentPage}
  />
)}

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 p-4 text-center text-gray-400 text-sm">
        <p>
          © {new Date().getFullYear()} Durgule Billing System | 100% Local Storage | Offline Ready
        </p>
      </footer>
    </div>
  );
}