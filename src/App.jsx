import React, { useState } from 'react';
import './App.css';
import './styles.css';
import BillingModule from './components/BillingModule';
import InventoryMaster from './components/InventoryMaster';
import OrdersModule from './components/OrdersModule';
import BillHistory from './components/BillHistory';
import TransportModule from './components/TransportModule';
import Login from './components/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [activeModule, setActiveModule] = useState('billing');

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    setActiveModule('billing');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-teal-300 mb-8">📊 Durgule</h1>
        
        <nav className="space-y-2 mb-8">
          <button
            onClick={() => setActiveModule('billing')}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
              activeModule === 'billing'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            💳 Billing
          </button>
          <button
            onClick={() => setActiveModule('inventory')}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
              activeModule === 'inventory'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            📦 Inventory
          </button>
          <button
            onClick={() => setActiveModule('orders')}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
              activeModule === 'orders'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            🛒 Orders
          </button>
          <button
            onClick={() => setActiveModule('transport')}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
              activeModule === 'transport'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            🚚 Transport
          </button>
          <button
            onClick={() => setActiveModule('billhistory')}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
              activeModule === 'billhistory'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            📋 Bill History
          </button>
        </nav>

        <div className="border-t border-gray-700 pt-4">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-lg font-semibold text-gray-300 hover:bg-red-900 hover:text-red-200 transition-all"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeModule === 'billing' && <BillingModule />}
        {activeModule === 'inventory' && <InventoryMaster />}
        {activeModule === 'orders' && <OrdersModule />}
        {activeModule === 'transport' && <TransportModule />}
        {activeModule === 'billhistory' && <BillHistory />}
      </div>
    </div>
  );
}

export default App;
