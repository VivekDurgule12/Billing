import React, { useState } from 'react';
import { transportStorage } from '../utils/transportStorage';

export default function CreateTrip({ drivers, vehicles, onTripCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    bookingDate: new Date().toISOString().split('T')[0],
    loadingDate: '',
    driverId: '',
    vehicleId: '',
    customerName: '',
    customerMobile: '',
    sourceCity: '',
    destinationCity: '',
    distance: '',
    tripType: 'Single Trip',
  });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.driverId || !formData.vehicleId || !formData.customerName) {
      setMessage('❌ Please fill all required fields');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    transportStorage.addTrip(formData);
    setMessage('✅ Trip created successfully');
    
    setFormData({
      bookingDate: new Date().toISOString().split('T')[0],
      loadingDate: '',
      driverId: '',
      vehicleId: '',
      customerName: '',
      customerMobile: '',
      sourceCity: '',
      destinationCity: '',
      distance: '',
      tripType: 'Single Trip',
    });
    
    setTimeout(() => {
      setShowModal(false);
      setMessage('');
      onTripCreated?.();
    }, 1500);
  };

  return (
    <>
      {message && (
        <div className="fixed top-4 right-4 bg-gray-800 border-l-4 border-teal-500 p-4 rounded shadow-lg z-50">
          {message}
        </div>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
      >
        ➕ Create New Trip
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto border border-gray-700">
            <h2 className="text-2xl font-bold text-teal-300 mb-4">Create New Trip</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />
                <input
                  type="date"
                  name="loadingDate"
                  value={formData.loadingDate}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />
                <select
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
                >
                  <option value="">Select Driver *</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.driverName}</option>
                  ))}
                </select>
                <select
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
                >
                  <option value="">Select Vehicle *</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.vehicleName} ({v.vehicleNumber})</option>
                  ))}
                </select>
                <input
                  type="text"
                  name="customerName"
                  placeholder="Customer Name *"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />
                <input
                  type="tel"
                  name="customerMobile"
                  placeholder="Customer Mobile"
                  value={formData.customerMobile}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />
                <input
                  type="text"
                  name="sourceCity"
                  placeholder="Source City"
                  value={formData.sourceCity}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />
                <input
                  type="text"
                  name="destinationCity"
                  placeholder="Destination City"
                  value={formData.destinationCity}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />
                <input
                  type="number"
                  name="distance"
                  placeholder="Distance (KM)"
                  value={formData.distance}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
                />
                <select
                  name="tripType"
                  value={formData.tripType}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
                >
                  <option value="Single Trip">Single Trip</option>
                  <option value="Round Trip">Round Trip</option>
                  <option value="Return Empty">Return Empty</option>
                  <option value="Multi-City">Multi-City</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  ❌ Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
                >
                  ✅ Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
