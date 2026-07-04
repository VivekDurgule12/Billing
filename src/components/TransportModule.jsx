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

  useEffect(() => {
    loadData();
  }, []);

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

  const StatCard = ({ title, value, color }) => (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-700 hover:border-teal-500 transition-all">
      <p className="text-gray-400 text-xs sm:text-sm font-medium">{title}</p>
      <p className={`text-2xl sm:text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-screen p-3 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-teal-300 mb-2">Transport Management</h1>
        <p className="text-gray-400 text-xs sm:text-base">Professional Fleet and Trip Management System</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-6 sm:mb-8 bg-gray-800 p-2 sm:p-4 rounded-lg border border-gray-700 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'trips', label: 'Trips' },
          { id: 'drivers', label: 'Drivers' },
          { id: 'vehicles', label: 'Vehicles' },
          { id: 'reports', label: 'Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-2 rounded font-semibold text-xs sm:text-base transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <StatCard title="Today's Trips" value={stats.todaysTrips} color="text-blue-400" />
            <StatCard title="Active Trips" value={stats.activeTrips} color="text-green-400" />
            <StatCard title="Completed" value={stats.completedTrips} color="text-purple-400" />
            <StatCard title="Pending Payment" value={stats.pendingPayments} color="text-orange-400" />
          </div>

          {/* Income Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            <StatCard title="Today's Income" value={`₹${stats.todayIncome.toFixed(0)}`} color="text-green-500" />
            <StatCard title="Monthly Income" value={`₹${stats.monthlyIncome.toFixed(0)}`} color="text-teal-400" />
            <div className="grid grid-cols-2 col-span-2 sm:col-span-1 gap-2 sm:gap-4">
              <StatCard title="Total Vehicles" value={stats.totalVehicles} color="text-cyan-400" />
              <StatCard title="Total Drivers" value={stats.totalDrivers} color="text-indigo-400" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold text-teal-300 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={() => setActiveTab('trips')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 sm:py-4 rounded-lg transition-all transform hover:scale-105 text-sm sm:text-base"
              >
                Create New Trip
              </button>
              <button
                onClick={() => setActiveTab('drivers')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 rounded-lg transition-all transform hover:scale-105 text-sm sm:text-base"
              >
                Add Driver
              </button>
              <button
                onClick={() => setActiveTab('vehicles')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 sm:py-4 rounded-lg transition-all transform hover:scale-105 text-sm sm:text-base"
              >
                Add Vehicle
              </button>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold text-teal-300 mb-4">Company Information</h2>
            <div className="space-y-2 text-sm sm:text-base text-gray-300">
              <p><strong>Company:</strong> Durgule Transport</p>
              <p><strong>Location:</strong> Kolhapur, Maharashtra</p>
              <p><strong>Phone:</strong> 9112251220</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-teal-300">Vehicle Dashboard</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{vehicles.map(vehicle => {
                const vehicleTrips = trips.filter(trip => String(trip.vehicleId) === String(vehicle.id));
                const km = vehicleTrips.reduce((sum, trip) => sum + transportCalculator.calculateTripStats(trip).totalDistance, 0);
                const profit = vehicleTrips.reduce((sum, trip) => sum + transportCalculator.calculateTripStats(trip).netProfit, 0);
                const loanRemaining = Math.max(0, (Number(vehicle.loanAmount) || 0) - (Number(vehicle.loanPaid) || 0));
                return <div key={vehicle.id} className="rounded border border-gray-700 bg-gray-900/50 p-3 text-sm"><div className="flex justify-between gap-2"><strong className="text-cyan-300">{vehicle.vehicleName}</strong><span className="text-xs text-gray-400">{vehicle.vehicleNumber}</span></div><div className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-300"><span>Trips: {vehicleTrips.length}</span><span>KM: {km.toFixed(1)}</span><span>Profit: ₹{profit.toFixed(0)}</span><span>Maintenance: ₹{(Number(vehicle.maintenanceCost) || 0).toFixed(0)}</span><span className="col-span-2 text-yellow-300">Loan remaining: ₹{loanRemaining.toFixed(0)}</span></div></div>;
              })}</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-teal-300">Driver Dashboard</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{drivers.map(driver => {
                const driverTrips = trips.filter(trip => String(trip.driverId) === String(driver.id));
                const km = driverTrips.reduce((sum, trip) => sum + transportCalculator.calculateTripStats(trip).totalDistance, 0);
                const payments = driverTrips.reduce((total, trip) => total + (trip.expenses || []).filter(expense => expense.category === 'Driver Payment').reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0) + (Number(trip.driverPayment) || 0), 0);
                return <div key={driver.id} className="rounded border border-gray-700 bg-gray-900/50 p-3 text-sm"><div className="flex justify-between gap-2"><strong className="text-cyan-300">{driver.driverName}</strong><span className="text-xs text-gray-400">{driver.status}</span></div><div className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-300"><span>Trips: {driverTrips.length}</span><span>KM: {km.toFixed(1)}</span><span className="col-span-2 text-orange-300">Payments: ₹{payments.toFixed(0)}</span></div></div>;
              })}</div>
            </div>
          </div>
        </div>
      )}

      {/* Trips Tab */}
      {activeTab === 'trips' && (
        <div className="space-y-4 sm:space-y-6">
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
