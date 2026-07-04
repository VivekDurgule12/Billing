import React, { useState } from 'react';
import { transportStorage } from '../utils/transportStorage';

export default function TripsList({ trips, drivers, vehicles, onDataChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getDriver = (driverId) => drivers.find(d => d.id === parseInt(driverId));
  const getVehicle = (vehicleId) => vehicles.find(v => v.id === parseInt(vehicleId));

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.tripNumber.includes(searchTerm) ||
      trip.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.sourceCity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-600',
      'Vehicle Assigned': 'bg-blue-600',
      'Loading': 'bg-cyan-600',
      'In Transit': 'bg-purple-600',
      'Reached': 'bg-indigo-600',
      'Unloading': 'bg-orange-600',
      'Completed': 'bg-green-600',
      'Cancelled': 'bg-red-600',
    };
    return colors[status] || 'bg-gray-600';
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold text-teal-300 mb-4">📋 Trips List</h2>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="🔍 Search by trip number, customer, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Vehicle Assigned">Vehicle Assigned</option>
          <option value="Loading">Loading</option>
          <option value="In Transit">In Transit</option>
          <option value="Reached">Reached</option>
          <option value="Unloading">Unloading</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Trips Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-white text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3 text-left">Trip #</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Driver</th>
              <th className="p-3 text-left">Vehicle</th>
              <th className="p-3 text-left">Route</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.length > 0 ? (
              filteredTrips.map(trip => {
                const driver = getDriver(trip.driverId);
                const vehicle = getVehicle(trip.vehicleId);
                return (
                  <tr key={trip.id} className="border-t border-gray-700 hover:bg-gray-700 transition-all">
                    <td className="p-3 font-semibold text-teal-400">{trip.tripNumber}</td>
                    <td className="p-3">{trip.customerName}</td>
                    <td className="p-3">{driver?.driverName || 'N/A'}</td>
                    <td className="p-3">{vehicle?.vehicleName || 'N/A'}</td>
                    <td className="p-3 text-xs">{trip.sourceCity} → {trip.destinationCity}</td>
                    <td className="p-3">
                      <span className={`${getStatusColor(trip.status)} text-white px-2 py-1 rounded text-xs font-bold`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs">{new Date(trip.bookingDate).toLocaleDateString('en-IN')}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-400">
                  No trips found. Create your first trip to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
