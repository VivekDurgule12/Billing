import React, { useState, useEffect } from 'react';
import DriverManagement from './DriverManagement';
import VehicleManagement from './VehicleManagement';
import CreateTrip from './CreateTrip';
import TripsList from './TripsList';
import Reports from './Reports';
import { transportStorage } from '../utils/transportStorage';
import { transportCalculator } from '../utils/transportCalculator';

export default function TransportModule() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState({
    todaysTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    pendingPayments: 0,
    todayIncome: 0,
    monthlyIncome: 0,
    totalVehicles: 0,
    totalDrivers: 0,
  });

  // Load data from storage
  useEffect(() => {
    loadData();
  }, []);

  // Update stats when data changes
  useEffect(() => {
    calculateStats();
  }, [trips, drivers, vehicles]);

  const loadData = () => {
    const loadedTrips = transportStorage.getTrips();
    const loadedDrivers = transportStorage.getDrivers();
    const loadedVehicles = transportStorage.getVehicles();

    setTrips(loadedTrips);
    setDrivers(loadedDrivers);
    setVehicles(loadedVehicles);
  };

  const calculateStats = () => {
    const todayDate = new Date().toISOString().split('T')[0];
    const todayTrips = trips.filter(t => t.bookingDate === todayDate);
    const activeTrips = trips.filter(t => ['Vehicle Assigned', 'Loading', 'In Transit', 'Reached', 'Unloading'].includes(t.status));
    const completedTrips = trips.filter(t => t.status === 'Completed');
    const pendingPayments = trips.filter(t => t.status === 'Completed' && t.paymentStatus !== 'Paid');

    const todayIncome = transportCalculator.calculateDailyIncome(trips);
    const monthlyIncome = transportCalculator.calculateMonthlyIncome(trips);

    setStats({
      todaysTrips: todayTrips.length,
      activeTrips: activeTrips.length,
      completedTrips: completedTrips.length,
      pendingPayments: pendingPayments.length,
      todayIncome,
      monthlyIncome,
      totalVehicles: vehicles.length,
      totalDrivers: drivers.length,
    });
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-teal-500 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-teal-300 mb-2">🚚 Transport Management</h1>
        <p className="text-gray-400">Durgule Transport - Professional Fleet & Trip Management</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded font-semibold transition-all ${
            activeTab === 'dashboard'
              ? 'bg-teal-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('trips')}
          className={`px-4 py-2 rounded font-semibold transition-all ${
            activeTab === 'trips'
              ? 'bg-teal-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🗺️ Trips
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-4 py-2 rounded font-semibold transition-all ${
            activeTab === 'drivers'
              ? 'bg-teal-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          👨‍💼 Drivers
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 rounded font-semibold transition-all ${
            activeTab === 'vehicles'
              ? 'bg-teal-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🚛 Vehicles
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded font-semibold transition-all ${
            activeTab === 'reports'
              ? 'bg-teal-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          📈 Reports
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Trips"
              value={stats.todaysTrips}
              icon="📅"
              color="text-blue-400"
            />
            <StatCard
              title="Active Trips"
              value={stats.activeTrips}
              icon="🚗"
              color="text-green-400"
            />
            <StatCard
              title="Completed Trips"
              value={stats.completedTrips}
              icon="✅"
              color="text-purple-400"
            />
            <StatCard
              title="Pending Payments"
              value={stats.pendingPayments}
              icon="💰"
              color="text-orange-400"
            />
          </div>

          {/* Income Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Today's Income"
              value={`₹${stats.todayIncome.toFixed(0)}`}
              icon="📊"
              color="text-green-500"
            />
            <StatCard
              title="Monthly Income"
              value={`₹${stats.monthlyIncome.toFixed(0)}`}
              icon="📈"
              color="text-teal-400"
            />
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Total Vehicles"
                value={stats.totalVehicles}
                icon="🚛"
                color="text-cyan-400"
              />
              <StatCard
                title="Total Drivers"
                value={stats.totalDrivers}
                icon="👥"
                color="text-indigo-400"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-teal-300 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('trips')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
              >
                ➕ Create New Trip
              </button>
              <button
                onClick={() => setActiveTab('drivers')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
              >
                👨‍💼 Add Driver
              </button>
              <button
                onClick={() => setActiveTab('vehicles')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
              >
                🚛 Add Vehicle
              </button>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-teal-300 mb-4">Company Information</h2>
            <div className="space-y-2">
              <p className="text-gray-300"><strong>Company:</strong> Durgule Transport</p>
              <p className="text-gray-300"><strong>Location:</strong> Kolhapur</p>
              <p className="text-gray-300"><strong>Phone:</strong> 9112251220</p>
            </div>
          </div>
        </div>
      )}

      {/* Trips Tab */}
      {activeTab === 'trips' && (
        <div className="space-y-6">
          <CreateTrip drivers={drivers} vehicles={vehicles} onTripCreated={loadData} />
          <TripsList trips={trips} drivers={drivers} vehicles={vehicles} onDataChange={loadData} />
        </div>
      )}

      {/* Drivers Tab */}
      {activeTab === 'drivers' && (
        <DriverManagement onDataChange={loadData} />
      )}

      {/* Vehicles Tab */}
      {activeTab === 'vehicles' && (
        <VehicleManagement onDataChange={loadData} />
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <Reports trips={trips} drivers={drivers} vehicles={vehicles} />
      )}
    </div>
  );
}
