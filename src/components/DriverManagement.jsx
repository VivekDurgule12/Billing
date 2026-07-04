import React, { useState, useEffect } from 'react';
import { transportStorage } from '../utils/transportStorage';

export default function DriverManagement({ onDataChange }) {
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    driverName: '',
    mobileNumber: '',
    licenseNumber: '',
    licenseExpiry: '',
    address: '',
    emergencyContact: '',
    status: 'Available',
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = () => {
    const loadedDrivers = transportStorage.getDrivers();
    setDrivers(loadedDrivers);
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

    if (!formData.driverName || !formData.mobileNumber) {
      setMessage('Error: Driver name and mobile number are required');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (editingId) {
      transportStorage.updateDriver(editingId, formData);
      setMessage('Success: Driver updated successfully');
      setEditingId(null);
    } else {
      transportStorage.addDriver(formData);
      setMessage('Success: Driver added successfully');
    }

    setFormData({
      driverName: '',
      mobileNumber: '',
      licenseNumber: '',
      licenseExpiry: '',
      address: '',
      emergencyContact: '',
      status: 'Available',
    });

    loadDrivers();
    onDataChange?.();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (driver) => {
    setFormData({
      driverName: driver.driverName,
      mobileNumber: driver.mobileNumber,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      address: driver.address,
      emergencyContact: driver.emergencyContact,
      status: driver.status,
    });
    setEditingId(driver.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      transportStorage.deleteDriver(id);
      setMessage('Success: Driver deleted successfully');
      loadDrivers();
      onDataChange?.();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.mobileNumber.includes(searchTerm)
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
          {editingId ? 'Edit Driver' : 'Add New Driver'}
        </h2>
        <form onSubmit={handleAddOrUpdate} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <input
              type="text"
              name="driverName"
              placeholder="Driver Name"
              value={formData.driverName}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
            />
            <input
              type="tel"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
            />
            <input
              type="text"
              name="licenseNumber"
              placeholder="License Number"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
            />
            <input
              type="date"
              name="licenseExpiry"
              placeholder="License Expiry"
              value={formData.licenseExpiry}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
              className="bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
            />
            <input
              type="tel"
              name="emergencyContact"
              placeholder="Emergency Contact"
              value={formData.emergencyContact}
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
              <option value="On Trip">On Trip</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              type="submit"
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 sm:py-3 rounded transition-all text-xs sm:text-base"
            >
              {editingId ? 'Update Driver' : 'Add Driver'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    driverName: '',
                    mobileNumber: '',
                    licenseNumber: '',
                    licenseExpiry: '',
                    address: '',
                    emergencyContact: '',
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
          placeholder="Search by name or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-700 text-white p-2 sm:p-3 rounded border border-gray-600 focus:border-teal-500 outline-none text-xs sm:text-base"
        />
      </div>

      {/* Drivers Table - Responsive */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-white text-xs sm:text-sm">
            <thead className="bg-gray-700 sticky top-0">
              <tr>
                <th className="p-2 sm:p-3 text-left">Name</th>
                <th className="p-2 sm:p-3 text-left hidden sm:table-cell">Mobile</th>
                <th className="p-2 sm:p-3 text-left hidden lg:table-cell">License</th>
                <th className="p-2 sm:p-3 text-left hidden md:table-cell">Expiry</th>
                <th className="p-2 sm:p-3 text-left">Status</th>
                <th className="p-2 sm:p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map(driver => (
                  <tr key={driver.id} className="border-t border-gray-700 hover:bg-gray-700 transition-all">
                    <td className="p-2 sm:p-3">{driver.driverName}</td>
                    <td className="p-2 sm:p-3 hidden sm:table-cell">{driver.mobileNumber}</td>
                    <td className="p-2 sm:p-3 hidden lg:table-cell">{driver.licenseNumber || '-'}</td>
                    <td className="p-2 sm:p-3 hidden md:table-cell text-xs">{driver.licenseExpiry || '-'}</td>
                    <td className="p-2 sm:p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        driver.status === 'Available' ? 'bg-green-600' :
                        driver.status === 'On Trip' ? 'bg-blue-600' : 'bg-orange-600'
                      }`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 text-center space-x-1">
                      <button
                        onClick={() => handleEdit(driver)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id)}
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
                    No drivers found. Add your first driver to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {drivers.length > 0 && (
        <div className="bg-gray-800 p-4 sm:p-6 rounded border border-gray-700">
          <p className="text-gray-300 text-sm sm:text-base"><strong>Total Drivers:</strong> {drivers.length}</p>
          <p className="text-green-400 mt-2 text-sm sm:text-base"><strong>Available:</strong> {drivers.filter(d => d.status === 'Available').length}</p>
        </div>
      )}
    </div>
  );
}
