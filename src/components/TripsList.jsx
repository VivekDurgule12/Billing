import React, { useState } from 'react';
import { transportStorage } from '../utils/transportStorage';
import { transportPdfGenerator } from '../utils/transportPdfGenerator';
import { transportCalculator } from '../utils/transportCalculator';

export default function TripsList({ trips, drivers, vehicles, onDataChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [message, setMessage] = useState('');
  const [editingTrip, setEditingTrip] = useState(null);
  const [financeForm, setFinanceForm] = useState({});

  const getDriver = (driverId) => drivers.find(d => d.id === parseInt(driverId));
  const getVehicle = (vehicleId) => vehicles.find(v => v.id === parseInt(vehicleId));

  const getInvoiceData = (trip) => ({
    vehicle: getVehicle(trip.vehicleId),
    driver: getDriver(trip.driverId),
    expenses: transportStorage.getExpensesByTrip(trip.id),
  });

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3500);
  };

  const downloadInvoice = (trip) => {
    try {
      const { vehicle, driver, expenses } = getInvoiceData(trip);
      transportPdfGenerator.downloadInvoice(trip, vehicle, driver, expenses);
      showMessage('Invoice PDF downloaded successfully.');
    } catch (error) {
      console.error('Transport invoice download failed:', error);
      showMessage('Could not generate the invoice PDF.');
    }
  };

  const shareInvoice = async (trip) => {
    try {
      const { vehicle, driver, expenses } = getInvoiceData(trip);
      const result = await transportPdfGenerator.shareInvoice(trip, vehicle, driver, expenses);
      showMessage(result === 'shared' ? 'Invoice shared successfully.' : 'Invoice downloaded. Attach it in the WhatsApp chat that opened.');
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('Transport invoice share failed:', error);
        showMessage('Could not share the invoice.');
      }
    }
  };

  const openFinanceEditor = (trip) => {
    const legacyExpenses = [
      ['Fuel / Oil', trip.oilExpense],
      ['Driver Payment', trip.driverPayment],
      ['Cleaner Payment', trip.cleanerPayment],
      ['Other', trip.otherExpense, trip.otherExpenseNote],
    ].filter(([, amount]) => Number(amount) > 0)
      .map(([category, amount, note], index) => ({ id: `legacy-${index}`, category, amount, note: note || '' }));
    setEditingTrip(trip);
    setFinanceForm({
      agreedAmount: trip.agreedAmount || '',
      receivedAmount: trip.receivedAmount || '',
      fareGroups: (trip.fareGroups || []).map(fare => ({ ...fare, legs: (fare.legs || []).map(leg => ({ ...leg })) })),
      customerPayments: (trip.customerPayments || []).map(payment => ({ ...payment })),
      expenses: trip.expenses?.length ? trip.expenses.map(expense => ({ ...expense })) : legacyExpenses,
    });
  };

  const addFinanceExpense = () => {
    setFinanceForm(prev => ({
      ...prev,
      expenses: [...(prev.expenses || []), { id: Date.now(), category: 'Toll', amount: '', note: '' }],
    }));
  };

  const updateFinanceExpense = (id, field, value) => {
    setFinanceForm(prev => ({
      ...prev,
      expenses: prev.expenses.map(expense => expense.id === id ? { ...expense, [field]: value } : expense),
    }));
  };

  const removeFinanceExpense = (id) => {
    setFinanceForm(prev => ({ ...prev, expenses: prev.expenses.filter(expense => expense.id !== id) }));
  };

  const addEditorFare = () => { const id = Date.now(); setFinanceForm(prev => ({ ...prev, fareGroups: [...(prev.fareGroups || []), { id, amount: '', legs: [{ id: id + 1, from: '', to: '', distanceKm: '', loadStatus: 'Loaded' }] }] })); };
  const updateEditorFare = (fareId, field, value) => setFinanceForm(prev => ({ ...prev, fareGroups: prev.fareGroups.map(fare => fare.id === fareId ? { ...fare, [field]: value } : fare) }));
  const removeEditorFare = fareId => setFinanceForm(prev => ({ ...prev, fareGroups: prev.fareGroups.filter(fare => fare.id !== fareId) }));
  const addEditorLeg = fareId => setFinanceForm(prev => ({ ...prev, fareGroups: prev.fareGroups.map(fare => fare.id === fareId ? { ...fare, legs: [...fare.legs, { id: Date.now(), from: '', to: '', distanceKm: '', loadStatus: 'Loaded' }] } : fare) }));
  const updateEditorLeg = (fareId, legId, field, value) => setFinanceForm(prev => ({ ...prev, fareGroups: prev.fareGroups.map(fare => fare.id === fareId ? { ...fare, legs: fare.legs.map(leg => leg.id === legId ? { ...leg, [field]: value } : leg) } : fare) }));
  const removeEditorLeg = (fareId, legId) => setFinanceForm(prev => ({ ...prev, fareGroups: prev.fareGroups.map(fare => fare.id === fareId ? { ...fare, legs: fare.legs.filter(leg => leg.id !== legId) } : fare) }));
  const addEditorPayment = () => setFinanceForm(prev => ({ ...prev, customerPayments: [...(prev.customerPayments || []), { id: Date.now(), date: new Date().toISOString().split('T')[0], amount: '', method: 'Cash', note: '' }] }));
  const updateEditorPayment = (id, field, value) => setFinanceForm(prev => ({ ...prev, customerPayments: prev.customerPayments.map(payment => payment.id === id ? { ...payment, [field]: value } : payment) }));
  const removeEditorPayment = id => setFinanceForm(prev => ({ ...prev, customerPayments: prev.customerPayments.filter(payment => payment.id !== id) }));

  const saveFinances = (event) => {
    event.preventDefault();
    const updates = {
      ...financeForm,
      agreedAmount: Number(financeForm.agreedAmount) || 0,
      receivedAmount: Number(financeForm.receivedAmount) || 0,
      fareGroups: (financeForm.fareGroups || []).map(fare => ({ ...fare, amount: Number(fare.amount) || 0, legs: fare.legs || [] })),
      customerPayments: (financeForm.customerPayments || []).map(payment => ({ ...payment, amount: Number(payment.amount) || 0 })),
      expenses: (financeForm.expenses || []).map((expense, index) => ({
        ...expense,
        id: typeof expense.id === 'number' ? expense.id : Date.now() + index,
        amount: Number(expense.amount) || 0,
        note: expense.note?.trim() || '',
      })),
      oilExpense: 0,
      driverPayment: 0,
      cleanerPayment: 0,
      otherExpense: 0,
      otherExpenseNote: '',
    };
    transportStorage.updateTrip(editingTrip.id, updates);
    setEditingTrip(null);
    onDataChange?.();
    showMessage('Trip amounts and expenses updated.');
  };

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

  const changeTripStatus = (tripId, status) => {
    const updated = transportStorage.updateTrip(tripId, { status });
    if (updated) {
      onDataChange?.();
      showMessage(`Trip status changed to ${status}.`);
    } else {
      showMessage('Could not update trip status.');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      {message && <div className="mb-4 rounded border border-teal-500 bg-gray-900 p-3 text-sm text-white">{message}</div>}
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
              <th className="p-3 text-left">Agreed</th>
              <th className="p-3 text-left">Received</th>
              <th className="p-3 text-left">Profit</th>
              <th className="p-3 text-left">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.length > 0 ? (
              filteredTrips.map(trip => {
                const driver = getDriver(trip.driverId);
                const vehicle = getVehicle(trip.vehicleId);
                const expenses = transportStorage.getExpensesByTrip(trip.id);
                const finances = transportCalculator.calculateTripStats(trip, expenses);
                return (
                  <tr key={trip.id} className="border-t border-gray-700 hover:bg-gray-700 transition-all">
                    <td className="p-3 font-semibold text-teal-400">{trip.tripNumber}</td>
                    <td className="p-3">{trip.customerName}</td>
                    <td className="p-3">{driver?.driverName || 'N/A'}</td>
                    <td className="p-3">{vehicle?.vehicleName || 'N/A'}</td>
                    <td className="p-3 text-xs">{trip.sourceCity} → {trip.destinationCity}</td>
                    <td className="p-3">
                      <select
                        value={trip.status}
                        onChange={event => changeTripStatus(trip.id, event.target.value)}
                        className={`${getStatusColor(trip.status)} cursor-pointer rounded border border-white/20 px-2 py-1 text-xs font-bold text-white outline-none`}
                        aria-label={`Change status for ${trip.tripNumber}`}
                      >
                        {['Pending', 'Vehicle Assigned', 'Loading', 'In Transit', 'Reached', 'Unloading', 'Completed', 'Cancelled'].map(status => (
                          <option key={status} value={status} className="bg-gray-800 text-white">{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-xs">{new Date(trip.bookingDate).toLocaleDateString('en-IN')}</td>
                    <td className="p-3">₹{finances.totalIncome.toFixed(2)}</td>
                    <td className="p-3">₹{finances.receivedAmount.toFixed(2)}</td>
                    <td className={`p-3 font-bold ${finances.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{finances.netProfit.toFixed(2)}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => downloadInvoice(trip)} className="rounded bg-teal-600 px-3 py-1 text-xs font-bold hover:bg-teal-700">Download PDF</button>
                        <button onClick={() => shareInvoice(trip)} className="rounded bg-green-600 px-3 py-1 text-xs font-bold hover:bg-green-700">Share Invoice</button>
                        <button onClick={() => openFinanceEditor(trip)} className="rounded bg-blue-600 px-3 py-1 text-xs font-bold hover:bg-blue-700">Edit Amounts</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" className="p-6 text-center text-gray-400">
                  No trips found. Create your first trip to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={saveFinances} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 p-6 text-white">
            <h3 className="mb-1 text-xl font-bold text-teal-300">Trip Accounts – {editingTrip.tripNumber}</h3>
            <p className="mb-4 text-sm text-gray-400">Private business details. These expenses and profit will not appear on the invoice.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['agreedAmount', 'Agreed Trip Amount'],
                ['receivedAmount', 'Amount Received'],
              ].map(([name, label]) => (
                <label key={name} className="text-sm text-gray-300">{label}
                  <input type="number" min="0" step="0.01" value={financeForm[name]} onChange={e => setFinanceForm(prev => ({ ...prev, [name]: e.target.value }))} className="mt-1 w-full rounded border border-gray-600 bg-gray-700 p-2 text-white outline-none focus:border-teal-500" />
                </label>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-indigo-600/60 bg-gray-900/40 p-4">
              <div className="mb-3 flex justify-between"><h4 className="font-bold text-indigo-300">Fares & Route Legs</h4><button type="button" onClick={addEditorFare} className="rounded bg-indigo-600 px-3 py-2 text-sm font-bold">+ Add Fare</button></div>
              <div className="space-y-3">{(financeForm.fareGroups || []).map((fare, fareIndex) => (
                <div key={fare.id} className="rounded border border-gray-600 p-3"><div className="mb-2 flex flex-wrap items-center gap-2"><strong className="mr-auto">Fare {fareIndex + 1}</strong><input type="number" min="0" step="0.01" placeholder="Amount" value={fare.amount} onChange={e => updateEditorFare(fare.id, 'amount', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2" /><button type="button" onClick={() => addEditorLeg(fare.id)} className="rounded bg-blue-600 px-3 py-2">+ Leg</button><button type="button" onClick={() => removeEditorFare(fare.id)} className="rounded bg-red-600 px-3 py-2">Remove</button></div>
                  <div className="space-y-2">{fare.legs.map(leg => <div key={leg.id} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_0.7fr_1fr_auto]"><input placeholder="From city" value={leg.from} onChange={e => updateEditorLeg(fare.id, leg.id, 'from', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2" /><input placeholder="To city" value={leg.to} onChange={e => updateEditorLeg(fare.id, leg.id, 'to', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2" /><input type="number" min="0" step="0.1" placeholder="KM" value={leg.distanceKm || ''} onChange={e => updateEditorLeg(fare.id, leg.id, 'distanceKm', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2" /><select value={leg.loadStatus} onChange={e => updateEditorLeg(fare.id, leg.id, 'loadStatus', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2"><option>Loaded</option><option>Empty</option></select><button type="button" onClick={() => removeEditorLeg(fare.id, leg.id)} className="rounded bg-red-700 px-3 py-2">Remove</button></div>)}</div>
                  <p className="mt-2 text-right text-sm font-bold text-cyan-300">Fare KM: {fare.legs.reduce((sum, leg) => sum + (Number(leg.distanceKm) || 0), 0).toFixed(1)} km</p>
                </div>
              ))}</div>
              <p className="mt-3 text-right font-bold text-cyan-300">Total Trip KM: {(financeForm.fareGroups || []).reduce((total, fare) => total + fare.legs.reduce((sum, leg) => sum + (Number(leg.distanceKm) || 0), 0), 0).toFixed(1)} km</p>
            </div>
            <div className="mt-5 rounded-lg border border-green-600/60 bg-gray-900/40 p-4">
              <div className="mb-3 flex justify-between"><h4 className="font-bold text-green-300">Customer Payment Installments</h4><button type="button" onClick={addEditorPayment} className="rounded bg-green-600 px-3 py-2 text-sm font-bold">+ Add Payment</button></div>
              <div className="space-y-2">{(financeForm.customerPayments || []).map((payment, index) => <div key={payment.id} className="grid grid-cols-1 gap-2 rounded border border-gray-700 p-3 md:grid-cols-[auto_1fr_1fr_1fr_2fr_auto]"><span className="self-center font-bold">#{index + 1}</span><input type="date" value={payment.date} onChange={e => updateEditorPayment(payment.id, 'date', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2" /><input type="number" min="0" step="0.01" placeholder="Amount" value={payment.amount} onChange={e => updateEditorPayment(payment.id, 'amount', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2" /><select value={payment.method} onChange={e => updateEditorPayment(payment.id, 'method', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2"><option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Cheque</option></select><input placeholder="Reference / note" value={payment.note || ''} onChange={e => updateEditorPayment(payment.id, 'note', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2" /><button type="button" onClick={() => removeEditorPayment(payment.id)} className="rounded bg-red-600 px-3 py-2">Remove</button></div>)}</div>
            </div>
            <div className="mt-5 rounded-lg border border-gray-600 bg-gray-900/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="font-bold text-teal-300">Itemized Expenses</h4>
                <button type="button" onClick={addFinanceExpense} className="rounded bg-blue-600 px-3 py-2 text-sm font-bold hover:bg-blue-700">+ Add Expense</button>
              </div>
              <div className="space-y-3">
                {(financeForm.expenses || []).length === 0 && <p className="text-sm text-gray-500">No expenses added.</p>}
                {(financeForm.expenses || []).map(expense => (
                  <div key={expense.id} className="grid grid-cols-1 gap-2 rounded border border-gray-700 p-3 md:grid-cols-[1fr_1fr_2fr_auto]">
                    <select value={expense.category} onChange={e => updateFinanceExpense(expense.id, 'category', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2 text-white">
                      {['Fuel / Oil', 'Toll', 'Breakfast / Meals', 'Traffic Fine', 'Maintenance', 'Driver Payment', 'Cleaner Payment', 'Parking', 'Loading / Unloading', 'Other'].map(category => <option key={category}>{category}</option>)}
                    </select>
                    <input type="number" min="0" step="0.01" placeholder="Amount" value={expense.amount} onChange={e => updateFinanceExpense(expense.id, 'amount', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2 text-white" />
                    <input type="text" placeholder="Bill number / details / note" value={expense.note || ''} onChange={e => updateFinanceExpense(expense.id, 'note', e.target.value)} className="rounded border border-gray-600 bg-gray-700 p-2 text-white" />
                    <button type="button" onClick={() => removeFinanceExpense(expense.id)} className="rounded bg-red-600 px-3 py-2 font-bold hover:bg-red-700">Remove</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
              <div className="rounded bg-gray-700 p-3"><p className="text-xs text-gray-400">Total Expenses</p><p className="font-bold text-orange-300">₹{(financeForm.expenses || []).reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0).toFixed(2)}</p></div>
              <div className="rounded bg-gray-700 p-3"><p className="text-xs text-gray-400">Profit</p><p className="font-bold text-green-400">₹{(((financeForm.fareGroups || []).reduce((sum, fare) => sum + (Number(fare.amount) || 0), 0) || Number(financeForm.agreedAmount) || 0) - (financeForm.expenses || []).reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)).toFixed(2)}</p></div>
              <div className="rounded bg-gray-700 p-3"><p className="text-xs text-gray-400">Customer Balance</p><p className="font-bold text-yellow-300">₹{Math.max(0, ((financeForm.fareGroups || []).reduce((sum, fare) => sum + (Number(fare.amount) || 0), 0) || Number(financeForm.agreedAmount) || 0) - ((financeForm.customerPayments || []).reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0) || Number(financeForm.receivedAmount) || 0)).toFixed(2)}</p></div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingTrip(null)} className="rounded bg-gray-600 px-4 py-2 font-bold hover:bg-gray-700">Cancel</button>
              <button type="submit" className="rounded bg-teal-600 px-4 py-2 font-bold hover:bg-teal-700">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
