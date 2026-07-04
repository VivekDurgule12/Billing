import React, { useState, useEffect } from "react";
import "./App.css";
import "./styles.css";

import BillingModule from "./components/BillingModule";
import InventoryMaster from "./components/InventoryMaster";
import OrdersModule from "./components/OrdersModule";
import BillHistory from "./components/BillHistory";
import TransportModule from "./components/TransportModule";
import Login from "./components/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const [activeModule, setActiveModule] = useState("billing");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    setActiveModule("billing");
  };

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const menus = [
    { id: "billing", label: "Billing", icon: "💳" },
    { id: "inventory", label: "Inventory", icon: "📦" },
    { id: "orders", label: "Orders", icon: "🛒" },
    { id: "transport", label: "Transport", icon: "🚚" },
    { id: "billhistory", label: "Bill History", icon: "📋" },
  ];

  return (
    <div className="h-screen flex bg-gray-900">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative
          z-40
          h-full
          w-72
          bg-gray-800
          border-r
          border-gray-700
          transform
          transition-transform
          duration-300
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="p-6 flex flex-col h-full">

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-teal-400">
              Durgule
            </h1>

            <button
              className="lg:hidden text-white text-2xl"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          <nav className="mt-8 space-y-2 flex-1">

            {menus.map((menu) => (
              <button
                key={menu.id}
                onClick={() => {
                  setActiveModule(menu.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition
                ${
                  activeModule === menu.id
                    ? "bg-teal-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                {menu.icon} {menu.label}
              </button>
            ))}

          </nav>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-lg text-left bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </button>

        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">

          <button
            className="lg:hidden text-white text-2xl"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <h2 className="text-white font-semibold capitalize">
            {activeModule}
          </h2>

          <div className="w-8"></div>

        </header>

        {/* Page */}
        <main className="flex-1 overflow-auto p-2 md:p-4 lg:p-6">

          {activeModule === "billing" && <BillingModule />}
          {activeModule === "inventory" && <InventoryMaster />}
          {activeModule === "orders" && <OrdersModule />}
          {activeModule === "transport" && <TransportModule />}
          {activeModule === "billhistory" && <BillHistory />}

        </main>

      </div>

    </div>
  );
}

export default App;