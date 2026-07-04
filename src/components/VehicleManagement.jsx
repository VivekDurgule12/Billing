import React, { useState, useEffect } from 'react';
import { transportStorage } from '../utils/transportStorage';

export default function VehicleManagement({ onDataChange }) {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicleName: '',
    vehicleNumber: '',
    vehicleType: 'Truck',
    capacity: '',
    capacityUnit: 'KG',
    insuranceNumber: '',
    fitnessExpiry: '',
    rcNumber: '',
    fuelType: 'Diesel',
    mileage: '',
    status: 'Available',
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = () => {
    const loadedVehicles = transportStorage.getVehicles();
    setVehicles(loadedVehicles);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();

    if (!formData.vehicleName || !formData.vehicleNumber || !formData.capacity) {
      setMessage('Error: Vehicle name, number, and capacity are required');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (editingId) {
      transportStorage.updateVehicle(editingId, formData);
      setMessage('Success: Vehicle updated successfully');
      setEditingId(null);
    } else {
      transportStorage.addVehicle(formData);
      setMessage('Success: Vehicle added successfully');
    }

    setFormData({
      vehicleName: '',
      vehicleNumber: '',
      vehicleType: 'Truck',
      capacity: '',
      capacityUnit: 'KG',
      insuranceNumber: '',
      fitnessExpiry: '',
      rcNumber: '',
      fuelType: 'Diesel',
      mileage: '',
      status: 'Available',
    });

    loadVehicles();
    onDataChange?.();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (vehicle) => {
    setFormData({
      vehicleName: vehicle.vehicleName,
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      capacity: vehicle.capacity,
      capacityUnit: vehicle.capacityUnit,
      insuranceNumber: vehicle.insuranceNumber,
      fitnessExpiry: vehicle.fitnessExpiry,
      rcNumber: vehicle.rcNumber,
      fuelType: vehicle.fuelType,
      mileage: vehicle.mileage,
      status: vehicle.status,
    });
    setEditingId(vehicle.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      transportStorage.deleteVehicle(id);
      setMessage('Success: Vehicle deleted successfully');
      loadVehicles();
      onDataChange?.();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {message && (
        <div className={`fixed top-4 right-4 p-3 sm:p-4 rounded shadow-lg z-50 text-xs sm:text-sm max-w-xs sm:max-w-md ${
          message.includes('Error') 
            ? 'bg-red-800 border-l-4 border-red-500 text-red-100'
            : 'bg-green-800 border-l-4 border-green-500 text-green-100'
        }`}>
          {message}
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-700">
        <h2 className="text-lg sm:text-xl font-semibold text-teal-300 mb-4">
          {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h2>
        <form onSubmit={handleAddOrUpdate} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <input
              type="text"
              name="vehicleName"
              placeholder="Vehicle Name"
              value={formData.vehicleName}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
            />
            <input
              type="text"
              name="vehicleNumber"
              placeholder="Vehicle Number"
              value={formData.vehicleNumber}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
            />
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
            >
              <option value="Truck">Truck</option>
              <option value="Pickup">Pickup</option>
              <option value="Tempo">Tempo</option>
              <option value="Mini Truck">Mini Truck</option>
              <option value="Container">Container</option>
              <option value="Tanker">Tanker</option>
            </select>
            <div className="flex gap-2 sm:gap-3 col-span-1 sm:col-span-2 lg:col-span-1">
              <input
                type="number"
                name="capacity"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                className="flex-1 bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
              />
              <select
                name="capacityUnit"
                value={formData.capacityUnit}
                onChange={handleInputChange}
                className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
              >
                <option value="KG">KG</option>
                <option value="Ton">Ton</option>
              </select>
            </div>
            <input
              type="text"
              name="rcNumber"
              placeholder="RC Number"
              value={formData.rcNumber}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
            />
            <input
              type="text"
              name="insuranceNumber"
              placeholder="Insurance Number"
              value={formData.insuranceNumber}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
            />
            <input
              type="date"
              name="fitnessExpiry"
              placeholder="Fitness Expiry"
              value={formData.fitnessExpiry}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
            />
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
            >
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="CNG">CNG</option>
              <option value="LPG">LPG</option>
            </select>
            <input
              type="number"
              name="mileage"
              placeholder="Mileage (KM/L)"
              value={formData.mileage}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
            />
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
            >
              <option value="Available">Available</option>
              <option value="Running">Running</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              type="submit"
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 sm:py-3 rounded transition-all text-xs sm:text-base"
            >
              {editingId ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    vehicleName: '',
                    vehicleNumber: '',
                    vehicleType: 'Truck',
                    capacity: '',
                    capacityUnit: 'KG',
                    insuranceNumber: '',
                    fitnessExpiry: '',
                    rcNumber: '',
                    fuelType: 'Diesel',
                    mileage: '',
                    status: 'Available',
                  });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded transition-all text-xs sm:text-base"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <input
          type="text"
          placeholder="Search by name or number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
        />
      </div>

      {/* Vehicles Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-white text-xs sm:text-sm">
            <thead className="bg-gray-700 sticky top-0">
              <tr>
                <th className="p-2 sm:p-3 text-left">Name</th>
                <th className="p-2 sm:p-3 text-left hidden sm:table-cell">Number</th>
                <th className="p-2 sm:p-3 text-left hidden md:table-cell">Type</th>
                <th className="p-2 sm:p-3 text-left">Capacity</th>
                <th className="p-2 sm:p-3 text-left hidden lg:table-cell">Status</th>
                <th className="p-2 sm:p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map(vehicle => (
                  <tr key={vehicle.id} className="border-t border-gray-700 hover:bg-gray-700 transition-all">
                    <td className="p-2 sm:p-3">{vehicle.vehicleName}</td>
                    <td className="p-2 sm:p-3 hidden sm:table-cell">{vehicle.vehicleNumber}</td>
                    <td className="p-2 sm:p-3 hidden md:table-cell text-xs">{vehicle.vehicleType}</td>
                    <td className="p-2 sm:p-3 text-xs">{vehicle.capacity} {vehicle.capacityUnit}</td>
                    <td className="p-2 sm:p-3 hidden lg:table-cell">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        vehicle.status === 'Available' ? 'bg-green-600' :
                        vehicle.status === 'Running' ? 'bg-blue-600' : 'bg-orange-600'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 text-center space-x-1">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-4 sm:p-6 text-center text-gray-400 text-xs sm:text-base">
                    No vehicles found. Add your first vehicle to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {vehicles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-gray-800 p-3 sm:p-4 rounded border border-gray-700">
            <p className="text-gray-300 text-xs sm:text-base"><strong>Total:</strong> {vehicles.length}</p>
          </div>
          <div className="bg-gray-800 p-3 sm:p-4 rounded border border-gray-700">
            <p className="text-green-400 text-xs sm:text-base"><strong>Available:</strong> {vehicles.filter(v => v.status === 'Available').length}</p>
          </div>
          <div className="bg-gray-800 p-3 sm:p-4 rounded border border-gray-700">
            <p className="text-orange-400 text-xs sm:text-base"><strong>Maintenance:</strong> {vehicles.filter(v => v.status === 'Maintenance').length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
