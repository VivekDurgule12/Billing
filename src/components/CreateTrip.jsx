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
    cleanerName: '',
    cleanerMobile: '',
    sourceCity: '',
    destinationCity: '',
    distance: '',
    tripType: 'Single Trip',
    agreedAmount: '',
    receivedAmount: '',
    fareGroups: [],
    customerPayments: [],
    expenses: [],
  });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addExpense = () => {
    setFormData(prev => ({
      ...prev,
      expenses: [...prev.expenses, { id: Date.now(), category: 'Toll', amount: '', note: '' }],
    }));
  };

  const updateExpense = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.map(expense => expense.id === id ? { ...expense, [field]: value } : expense),
    }));
  };

  const removeExpense = (id) => {
    setFormData(prev => ({ ...prev, expenses: prev.expenses.filter(expense => expense.id !== id) }));
  };

  const addFare = () => {
    const id = Date.now();
    setFormData(prev => ({ ...prev, fareGroups: [...prev.fareGroups, {
      id,
      amount: '',
      legs: [
        { id: id + 1, from: prev.sourceCity, to: prev.destinationCity, distanceKm: '', loadStatus: 'Loaded' },
        { id: id + 2, from: prev.destinationCity, to: prev.sourceCity, distanceKm: '', loadStatus: 'Empty' },
      ],
    }] }));
  };

  const updateFare = (fareId, field, value) => setFormData(prev => ({ ...prev, fareGroups: prev.fareGroups.map(fare => fare.id === fareId ? { ...fare, [field]: value } : fare) }));
  const removeFare = (fareId) => setFormData(prev => ({ ...prev, fareGroups: prev.fareGroups.filter(fare => fare.id !== fareId) }));
  const addFareLeg = (fareId) => setFormData(prev => ({ ...prev, fareGroups: prev.fareGroups.map(fare => fare.id === fareId ? { ...fare, legs: [...fare.legs, { id: Date.now(), from: '', to: '', distanceKm: '', loadStatus: 'Loaded' }] } : fare) }));
  const updateFareLeg = (fareId, legId, field, value) => setFormData(prev => ({ ...prev, fareGroups: prev.fareGroups.map(fare => fare.id === fareId ? { ...fare, legs: fare.legs.map(leg => leg.id === legId ? { ...leg, [field]: value } : leg) } : fare) }));
  const removeFareLeg = (fareId, legId) => setFormData(prev => ({ ...prev, fareGroups: prev.fareGroups.map(fare => fare.id === fareId ? { ...fare, legs: fare.legs.filter(leg => leg.id !== legId) } : fare) }));

  const addCustomerPayment = () => setFormData(prev => ({ ...prev, customerPayments: [...prev.customerPayments, { id: Date.now(), date: new Date().toISOString().split('T')[0], amount: '', method: 'Cash', note: '' }] }));
  const updateCustomerPayment = (id, field, value) => setFormData(prev => ({ ...prev, customerPayments: prev.customerPayments.map(payment => payment.id === id ? { ...payment, [field]: value } : payment) }));
  const removeCustomerPayment = (id) => setFormData(prev => ({ ...prev, customerPayments: prev.customerPayments.filter(payment => payment.id !== id) }));

  const handleSubmit = (e) => {
    e.preventDefault();

    const fareTotal = formData.fareGroups.reduce((sum, fare) => sum + (Number(fare.amount) || 0), 0);
    if (!formData.driverId || !formData.vehicleId || !formData.customerName || (!formData.agreedAmount && fareTotal <= 0)) {
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
      cleanerName: '',
      cleanerMobile: '',
      sourceCity: '',
      destinationCity: '',
      distance: '',
      tripType: 'Single Trip',
      agreedAmount: '',
      receivedAmount: '',
      fareGroups: [],
      customerPayments: [],
      expenses: [],
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
          <div className="bg-gray-800 rounded-lg p-6 w-[95vw] max-w-7xl max-h-[90vh] overflow-y-auto border border-gray-700">
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
                <input type="text" name="cleanerName" placeholder="Cleaner Name" value={formData.cleanerName} onChange={handleInputChange} className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none" />
                <input type="tel" name="cleanerMobile" placeholder="Cleaner Contact" value={formData.cleanerMobile} onChange={handleInputChange} className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none" />
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
                <input type="number" min="0" step="0.01" name="agreedAmount" placeholder="Agreed Trip Amount *" value={formData.agreedAmount} onChange={handleInputChange} className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none" />
                <input type="number" min="0" step="0.01" name="receivedAmount" placeholder="Amount Received" value={formData.receivedAmount} onChange={handleInputChange} className="bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none" />
              </div>
              <div className="rounded-lg border border-indigo-600/60 bg-gray-900/40 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div><h3 className="font-bold text-indigo-300">Fares & Route Legs</h3><p className="text-xs text-gray-400">Create Fare 1, Fare 2, etc. and add loaded or empty city legs.</p></div>
                  <button type="button" onClick={addFare} className="rounded bg-indigo-600 px-3 py-2 text-sm font-bold hover:bg-indigo-700">+ Add Fare</button>
                </div>
                <div className="space-y-4">
                  {formData.fareGroups.map((fare, fareIndex) => (
                    <div key={fare.id} className="rounded border border-gray-600 p-3">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-end mb-4"><strong className="mr-auto text-indigo-300">Fare {fareIndex + 1}</strong><input type="number" min="0" step="0.01" placeholder="Fare amount" value={fare.amount} onChange={e => updateFare(fare.id, 'amount', e.target.value)} className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white" /><button type="button" onClick={() => addFareLeg(fare.id)} className="rounded bg-blue-600 px-3 py-2 text-sm">+ City Leg</button><button type="button" onClick={() => removeFare(fare.id)} className="rounded bg-red-600 px-3 py-2 text-sm">Remove Fare</button></div>
                      <div className="space-y-2">{fare.legs.map(leg => (
                        <div key={leg.id}  className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-gray-700 p-3">
                          <input placeholder="From city" value={leg.from} onChange={e => updateFareLeg(fare.id, leg.id, 'from', e.target.value)} className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white" />
                          <input placeholder="To city" value={leg.to} onChange={e => updateFareLeg(fare.id, leg.id, 'to', e.target.value)} className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white" />
                          <input type="number" min="0" step="0.1" placeholder="KM" value={leg.distanceKm} onChange={e => updateFareLeg(fare.id, leg.id, 'distanceKm', e.target.value)} className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white" />
                          <select value={leg.loadStatus} onChange={e => updateFareLeg(fare.id, leg.id, 'loadStatus', e.target.value)} className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"><option>Loaded</option><option>Empty</option></select>
                          <button type="button" onClick={() => removeFareLeg(fare.id, leg.id)} className="shrink-0 min-w-[100px] rounded bg-red-700 px-3 py-2">Remove</button>
                        </div>

                  ))}</div>
                  <p className="mt-2 text-right text-sm font-bold text-cyan-300">Fare KM: {fare.legs.reduce((sum, leg) => sum + (Number(leg.distanceKm) || 0), 0).toFixed(1)} km</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-right font-bold text-cyan-300">Total Trip KM: {formData.fareGroups.reduce((total, fare) => total + fare.legs.reduce((sum, leg) => sum + (Number(leg.distanceKm) || 0), 0), 0).toFixed(1)} km</p>
              </div>
              <div className="rounded-lg border border-green-600/60 bg-gray-900/40 p-4">
                <div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="font-bold text-green-300">Customer Payments</h3><p className="text-xs text-gray-400">Record payment in two, three, or more installments.</p></div><button type="button" onClick={addCustomerPayment} className="rounded bg-green-600 px-3 py-2 text-sm font-bold">+ Add Payment</button></div>
                <div className="space-y-2">{formData.customerPayments.map((payment, index) => (
                  <div key={payment.id} className="grid grid-cols-1 gap-2 rounded border border-gray-700 p-3 md:grid-cols-[auto_1fr_1fr_1fr_2fr_auto]"><span className="self-center font-bold">#{index + 1}</span><input type="date" value={payment.date} onChange={e => updateCustomerPayment(payment.id, 'date', e.target.value)} className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white" /><input type="number" min="0" step="0.01" placeholder="Amount" value={payment.amount} onChange={e => updateCustomerPayment(payment.id, 'amount', e.target.value)} className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white" /><select value={payment.method} onChange={e => updateCustomerPayment(payment.id, 'method', e.target.value)} className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"><option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Cheque</option></select><input placeholder="Reference / note" value={payment.note} onChange={e => updateCustomerPayment(payment.id, 'note', e.target.value)} className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white" /><button type="button" onClick={() => removeCustomerPayment(payment.id)} className="rounded bg-red-600 px-3 py-2">Remove</button></div>
                ))}</div>
                <p className="mt-3 text-right font-bold text-green-300">Total Received: ₹{formData.customerPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0).toFixed(2)}</p>
              </div>
              <div className="rounded-lg border border-gray-600 bg-gray-900/40 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-teal-300">Trip Expenses</h3>
                    <p className="text-xs text-gray-400">Add fuel, toll, meals, traffic fines, maintenance, payments, or any other expense.</p>
                  </div>
                  <button type="button" onClick={addExpense} className="whitespace-nowrap rounded bg-blue-600 px-3 py-2 text-sm font-bold hover:bg-blue-700">+ Add Expense</button>
                </div>
                <div className="space-y-3">
                  {formData.expenses.length === 0 && <p className="text-sm text-gray-500">No expenses added.</p>}
                  {formData.expenses.map(expense => (
                    <div key={expense.id} className="grid grid-cols-1 gap-2 rounded border border-gray-700 p-3 grid grid-cols-1
md:grid-cols-2
xl:grid-cols-4
gap-3">
                      <select value={expense.category} onChange={e => updateExpense(expense.id, 'category', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2 text-white">
                        {['Fuel / Oil', 'Toll', 'Breakfast / Meals', 'Traffic Fine', 'Maintenance', 'Driver Payment', 'Cleaner Payment', 'Parking', 'Loading / Unloading', 'Other'].map(category => <option key={category}>{category}</option>)}
                      </select>
                      <input type="number" min="0" step="0.01" placeholder="Amount" value={expense.amount} onChange={e => updateExpense(expense.id, 'amount', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2 text-white" />
                      <input type="text" placeholder="Bill number / details / note" value={expense.note} onChange={e => updateExpense(expense.id, 'note', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2 text-white" />
                      <button type="button" onClick={() => removeExpense(expense.id)} className="w-full
xl:w-auto
rounded
bg-red-600
px-4
py-2
font-semibold">Remove</button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-right font-bold text-orange-300">
                  Total Expenses: ₹{formData.expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0).toFixed(2)}
                </div>
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
