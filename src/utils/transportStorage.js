// Transport Storage - Persistent data management for transport module

const DRIVERS_KEY = 'transport_drivers';
const VEHICLES_KEY = 'transport_vehicles';
const TRIPS_KEY = 'transport_trips';
const GOODS_KEY = 'transport_goods';
const EXPENSES_KEY = 'transport_expenses';
const PAYMENTS_KEY = 'transport_payments';

const normalizeNumber = (value) => {
  const number = parseFloat(value);
  return Number.isFinite(number) ? number : 0;
};

export const transportStorage = {
  // ========== DRIVERS ==========
  getDrivers: () => {
    try {
      return JSON.parse(localStorage.getItem(DRIVERS_KEY) || '[]');
    } catch (error) {
      console.error('Error loading drivers:', error);
      return [];
    }
  },

  saveDrivers: (drivers) => {
    try {
      localStorage.setItem(DRIVERS_KEY, JSON.stringify(drivers));
      return true;
    } catch (error) {
      console.error('Error saving drivers:', error);
      return false;
    }
  },

  addDriver: (driver) => {
    try {
      const drivers = transportStorage.getDrivers();
      const newDriver = {
        id: Date.now(),
        driverName: driver.driverName?.trim() || '',
        mobileNumber: driver.mobileNumber?.trim() || '',
        licenseNumber: driver.licenseNumber?.trim() || '',
        licenseExpiry: driver.licenseExpiry || '',
        address: driver.address?.trim() || '',
        emergencyContact: driver.emergencyContact?.trim() || '',
        status: driver.status || 'Available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      drivers.push(newDriver);
      transportStorage.saveDrivers(drivers);
      return newDriver;
    } catch (error) {
      console.error('Error adding driver:', error);
      return null;
    }
  },

  updateDriver: (id, updatedData) => {
    try {
      const drivers = transportStorage.getDrivers();
      const index = drivers.findIndex(d => d.id === id);
      if (index > -1) {
        drivers[index] = { ...drivers[index], ...updatedData, updatedAt: new Date().toISOString() };
        transportStorage.saveDrivers(drivers);
        return drivers[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating driver:', error);
      return null;
    }
  },

  deleteDriver: (id) => {
    try {
      const drivers = transportStorage.getDrivers();
      const filtered = drivers.filter(d => d.id !== id);
      transportStorage.saveDrivers(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting driver:', error);
      return false;
    }
  },

  // ========== VEHICLES ==========
  getVehicles: () => {
    try {
      return JSON.parse(localStorage.getItem(VEHICLES_KEY) || '[]');
    } catch (error) {
      console.error('Error loading vehicles:', error);
      return [];
    }
  },

  saveVehicles: (vehicles) => {
    try {
      localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
      return true;
    } catch (error) {
      console.error('Error saving vehicles:', error);
      return false;
    }
  },

  addVehicle: (vehicle) => {
    try {
      const vehicles = transportStorage.getVehicles();
      const newVehicle = {
        id: Date.now(),
        vehicleName: vehicle.vehicleName?.trim() || '',
        vehicleNumber: vehicle.vehicleNumber?.trim() || '',
        vehicleType: vehicle.vehicleType || '',
        capacity: normalizeNumber(vehicle.capacity),
        capacityUnit: vehicle.capacityUnit || 'KG',
        insuranceNumber: vehicle.insuranceNumber?.trim() || '',
        fitnessExpiry: vehicle.fitnessExpiry || '',
        rcNumber: vehicle.rcNumber?.trim() || '',
        fuelType: vehicle.fuelType || 'Diesel',
        mileage: normalizeNumber(vehicle.mileage),
        loanAmount: normalizeNumber(vehicle.loanAmount),
        loanPaid: normalizeNumber(vehicle.loanPaid),
        maintenanceCost: normalizeNumber(vehicle.maintenanceCost),
        maintenanceDate: vehicle.maintenanceDate || '',
        maintenanceNote: vehicle.maintenanceNote?.trim() || '',
        status: vehicle.status || 'Available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      vehicles.push(newVehicle);
      transportStorage.saveVehicles(vehicles);
      return newVehicle;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      return null;
    }
  },

  updateVehicle: (id, updatedData) => {
    try {
      const vehicles = transportStorage.getVehicles();
      const index = vehicles.findIndex(v => v.id === id);
      if (index > -1) {
        vehicles[index] = { ...vehicles[index], ...updatedData, updatedAt: new Date().toISOString() };
        transportStorage.saveVehicles(vehicles);
        return vehicles[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      return null;
    }
  },

  deleteVehicle: (id) => {
    try {
      const vehicles = transportStorage.getVehicles();
      const filtered = vehicles.filter(v => v.id !== id);
      transportStorage.saveVehicles(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return false;
    }
  },

  // ========== TRIPS ==========
  getTrips: () => {
    try {
      return JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
    } catch (error) {
      console.error('Error loading trips:', error);
      return [];
    }
  },

  saveTrips: (trips) => {
    try {
      localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
      return true;
    } catch (error) {
      console.error('Error saving trips:', error);
      return false;
    }
  },

  generateTripNumber: () => {
    const trips = transportStorage.getTrips();
    const numbers = trips.map(t => parseInt(t.tripNumber?.replace('TR', '') || 0)).filter(n => n > 0);
    const nextNum = Math.max(...numbers, 999) + 1;
    return `TR${nextNum.toString().padStart(5, '0')}`;
  },

  addTrip: (trip) => {
    try {
      const trips = transportStorage.getTrips();
      const newTrip = {
        id: Date.now(),
        tripNumber: trip.tripNumber || transportStorage.generateTripNumber(),
        bookingDate: trip.bookingDate || new Date().toISOString().split('T')[0],
        loadingDate: trip.loadingDate || '',
        driverId: trip.driverId || null,
        vehicleId: trip.vehicleId || null,
        customerName: trip.customerName?.trim() || '',
        customerMobile: trip.customerMobile?.trim() || '',
        cleanerName: trip.cleanerName?.trim() || '',
        cleanerMobile: trip.cleanerMobile?.trim() || '',
        sourceCity: trip.sourceCity?.trim() || '',
        destinationCity: trip.destinationCity?.trim() || '',
        distance: normalizeNumber(trip.distance),
        tripType: trip.tripType || 'Single Trip',
        agreedAmount: normalizeNumber(trip.agreedAmount),
        receivedAmount: normalizeNumber(trip.receivedAmount),
        fareGroups: (trip.fareGroups || []).map((fare, fareIndex) => ({
          id: fare.id || Date.now() + fareIndex,
          amount: normalizeNumber(fare.amount),
          legs: (fare.legs || []).map((leg, legIndex) => ({
            id: leg.id || Date.now() + fareIndex * 100 + legIndex,
            from: leg.from?.trim() || '',
            to: leg.to?.trim() || '',
            distanceKm: normalizeNumber(leg.distanceKm),
            loadStatus: leg.loadStatus || 'Loaded',
          })),
        })),
        customerPayments: (trip.customerPayments || []).map((payment, index) => ({
          id: payment.id || Date.now() + index,
          date: payment.date || new Date().toISOString().split('T')[0],
          amount: normalizeNumber(payment.amount),
          method: payment.method || 'Cash',
          note: payment.note?.trim() || '',
        })),
        oilExpense: normalizeNumber(trip.oilExpense),
        driverPayment: normalizeNumber(trip.driverPayment),
        cleanerPayment: normalizeNumber(trip.cleanerPayment),
        otherExpense: normalizeNumber(trip.otherExpense),
        otherExpenseNote: trip.otherExpenseNote?.trim() || '',
        expenses: (trip.expenses || []).map((expense, index) => ({
          id: expense.id || Date.now() + index,
          category: expense.category || 'Other',
          amount: normalizeNumber(expense.amount),
          note: expense.note?.trim() || '',
        })),
        stops: trip.stops || [],
        goods: trip.goods || [],
        loadedWeight: normalizeNumber(trip.loadedWeight),
        status: trip.status || 'Pending',
        timeline: trip.timeline || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      trips.push(newTrip);
      transportStorage.saveTrips(trips);
      return newTrip;
    } catch (error) {
      console.error('Error adding trip:', error);
      return null;
    }
  },

  updateTrip: (id, updatedData) => {
    try {
      const trips = transportStorage.getTrips();
      const index = trips.findIndex(t => t.id === id);
      if (index > -1) {
        trips[index] = { ...trips[index], ...updatedData, updatedAt: new Date().toISOString() };
        transportStorage.saveTrips(trips);
        return trips[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating trip:', error);
      return null;
    }
  },

  deleteTrip: (id) => {
    try {
      const trips = transportStorage.getTrips();
      const filtered = trips.filter(t => t.id !== id);
      transportStorage.saveTrips(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting trip:', error);
      return false;
    }
  },

  // ========== GOODS ==========
  addGoodToTrip: (tripId, good) => {
    try {
      const trips = transportStorage.getTrips();
      const tripIndex = trips.findIndex(t => t.id === tripId);
      if (tripIndex > -1) {
        const newGood = {
          id: Date.now(),
          itemName: good.itemName?.trim() || '',
          quantity: normalizeNumber(good.quantity),
          weight: normalizeNumber(good.weight),
          unit: good.unit || 'KG',
          rate: normalizeNumber(good.rate),
          amount: normalizeNumber(good.weight) * normalizeNumber(good.rate),
          remarks: good.remarks?.trim() || '',
          status: 'Loaded',
          createdAt: new Date().toISOString(),
        };
        trips[tripIndex].goods.push(newGood);
        transportStorage.saveTrips(trips);
        return newGood;
      }
      return null;
    } catch (error) {
      console.error('Error adding good:', error);
      return null;
    }
  },

  removeGoodFromTrip: (tripId, goodId) => {
    try {
      const trips = transportStorage.getTrips();
      const tripIndex = trips.findIndex(t => t.id === tripId);
      if (tripIndex > -1) {
        trips[tripIndex].goods = trips[tripIndex].goods.filter(g => g.id !== goodId);
        transportStorage.saveTrips(trips);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing good:', error);
      return false;
    }
  },

  // ========== EXPENSES ==========
  getExpenses: () => {
    try {
      return JSON.parse(localStorage.getItem(EXPENSES_KEY) || '[]');
    } catch (error) {
      console.error('Error loading expenses:', error);
      return [];
    }
  },

  addExpense: (tripId, expense) => {
    try {
      const expenses = transportStorage.getExpenses();
      const newExpense = {
        id: Date.now(),
        tripId,
        type: expense.type || '',
        amount: normalizeNumber(expense.amount),
        description: expense.description?.trim() || '',
        createdAt: new Date().toISOString(),
      };
      expenses.push(newExpense);
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      return null;
    }
  },

  getExpensesByTrip: (tripId) => {
    const expenses = transportStorage.getExpenses();
    return expenses.filter(e => e.tripId === tripId);
  },

  // ========== PAYMENTS ==========
  getPayments: () => {
    try {
      return JSON.parse(localStorage.getItem(PAYMENTS_KEY) || '[]');
    } catch (error) {
      console.error('Error loading payments:', error);
      return [];
    }
  },

  addPayment: (tripId, payment) => {
    try {
      const payments = transportStorage.getPayments();
      const newPayment = {
        id: Date.now(),
        tripId,
        amount: normalizeNumber(payment.amount),
        method: payment.method || 'Cash',
        status: payment.status || 'Pending',
        transactionNumber: payment.transactionNumber?.trim() || '',
        remarks: payment.remarks?.trim() || '',
        createdAt: new Date().toISOString(),
      };
      payments.push(newPayment);
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
      return newPayment;
    } catch (error) {
      console.error('Error adding payment:', error);
      return null;
    }
  },

  getPaymentsByTrip: (tripId) => {
    const payments = transportStorage.getPayments();
    return payments.filter(p => p.tripId === tripId);
  },

  getTripStats: () => {
    const trips = transportStorage.getTrips();
    const today = new Date().toISOString().split('T')[0];

    const todayTrips = trips.filter(t => t.bookingDate === today);
    const activeTrips = trips.filter(t => ['Vehicle Assigned', 'Loading', 'In Transit', 'Reached', 'Unloading'].includes(t.status));
    const completedTrips = trips.filter(t => t.status === 'Completed');
    const pendingPayments = trips.filter(t => t.status === 'Completed' && !t.paymentStatus?.includes('Paid'));

    return {
      todaysTrips: todayTrips.length,
      activeTrips: activeTrips.length,
      completedTrips: completedTrips.length,
      pendingPayments: pendingPayments.length,
    };
  },
};
