// Transport Calculator - Business logic for freight charges, expenses, and profit

export const transportCalculator = {
  // Calculate freight charges based on pricing method
  calculateFreightCharges: (trip, pricingMethod) => {
    if (!trip.goods || trip.goods.length === 0) return 0;

    const totalWeight = trip.goods.reduce((sum, g) => sum + (parseFloat(g.weight) || 0), 0);
    const totalQuantity = trip.goods.reduce((sum, g) => sum + (parseFloat(g.quantity) || 0), 0);

    switch (pricingMethod) {
      case 'perKm':
        return (parseFloat(trip.distance) || 0) * (parseFloat(trip.pricePerKm) || 0);
      case 'perKg':
        return totalWeight * (parseFloat(trip.pricePerKg) || 0);
      case 'perTon':
        return (totalWeight / 1000) * (parseFloat(trip.pricePerTon) || 0);
      case 'perBag':
        return totalQuantity * (parseFloat(trip.pricePerBag) || 0);
      case 'fixed':
        return parseFloat(trip.fixedAmount) || 0;
      case 'manual':
        return parseFloat(trip.manualAmount) || 0;
      default:
        return 0;
    }
  },

  // Calculate total extra charges
  calculateExtraCharges: (trip) => {
    const charges = {
      loading: parseFloat(trip.loadingCharges) || 0,
      unloading: parseFloat(trip.unloadingCharges) || 0,
      labour: parseFloat(trip.labourCharges) || 0,
      fuel: parseFloat(trip.fuelCharges) || 0,
      toll: parseFloat(trip.tollCharges) || 0,
      parking: parseFloat(trip.parkingCharges) || 0,
      night: parseFloat(trip.nightCharges) || 0,
      waiting: parseFloat(trip.waitingCharges) || 0,
      other: parseFloat(trip.otherCharges) || 0,
    };
    return Object.values(charges).reduce((sum, val) => sum + val, 0);
  },

  // Calculate total expenses
  calculateTotalExpenses: (expenses) => {
    return expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  },

  // Calculate net profit
  calculateNetProfit: (freightCharges, extraCharges, expenses) => {
    return freightCharges + extraCharges - expenses;
  },

  // Calculate trip statistics
  calculateTripStats: (trip, expenses = []) => {
    const freightCharges = transportCalculator.calculateFreightCharges(trip, trip.pricingMethod);
    const extraCharges = transportCalculator.calculateExtraCharges(trip);
    const totalExpenses = transportCalculator.calculateTotalExpenses(expenses);
    const netProfit = transportCalculator.calculateNetProfit(freightCharges, extraCharges, totalExpenses);

    return {
      freightCharges,
      extraCharges,
      totalExpenses,
      totalIncome: freightCharges + extraCharges,
      netProfit,
      profitMargin: freightCharges + extraCharges > 0 ? (netProfit / (freightCharges + extraCharges)) * 100 : 0,
      isProfitable: netProfit > 0,
    };
  },

  // Calculate vehicle capacity usage
  calculateCapacityUsage: (trip, vehicle) => {
    if (!vehicle || !trip.goods || trip.goods.length === 0) {
      return { loadedWeight: 0, remainingCapacity: 0, capacityPercentage: 0, isOverloaded: false };
    }

    const totalWeight = trip.goods.reduce((sum, g) => sum + (parseFloat(g.weight) || 0), 0);
    const vehicleCapacity = parseFloat(vehicle.capacity) || 0;
    const remainingCapacity = Math.max(0, vehicleCapacity - totalWeight);
    const capacityPercentage = vehicleCapacity > 0 ? (totalWeight / vehicleCapacity) * 100 : 0;
    const isOverloaded = totalWeight > vehicleCapacity;

    return {
      loadedWeight: totalWeight,
      remainingCapacity,
      capacityPercentage,
      isOverloaded,
    };
  },

  // Calculate loading/unloading progress
  calculateLoadingProgress: (goods) => {
    if (!goods || goods.length === 0) return { loaded: 0, pending: 0, unloaded: 0, damaged: 0, lost: 0 };

    const statuses = goods.reduce(
      (acc, good) => {
        const status = good.status || 'Pending';
        acc[status] = (acc[status] || 0) + (parseFloat(good.quantity) || 1);
        return acc;
      },
      {}
    );

    return {
      loaded: statuses.Loaded || 0,
      pending: statuses.Pending || 0,
      unloaded: statuses.Unloaded || 0,
      damaged: statuses.Damaged || 0,
      lost: statuses.Lost || 0,
    };
  },

  // Format currency
  formatCurrency: (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  },

  // Calculate daily income
  calculateDailyIncome: (trips, payments = []) => {
    const today = new Date().toISOString().split('T')[0];
    const todayTrips = trips.filter(t => t.bookingDate === today && t.status === 'Completed');

    const income = todayTrips.reduce((sum, trip) => {
      const tripStats = transportCalculator.calculateTripStats(trip);
      return sum + tripStats.totalIncome;
    }, 0);

    return income;
  },

  // Calculate monthly income
  calculateMonthlyIncome: (trips) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTrips = trips.filter(trip => {
      const tripDate = new Date(trip.bookingDate);
      return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear && trip.status === 'Completed';
    });

    const income = monthlyTrips.reduce((sum, trip) => {
      const tripStats = transportCalculator.calculateTripStats(trip);
      return sum + tripStats.totalIncome;
    }, 0);

    return income;
  },

  // Format report data
  formatReportData: (trips, type = 'daily') => {
    const now = new Date();

    if (type === 'daily') {
      const today = now.toISOString().split('T')[0];
      return trips.filter(t => t.bookingDate === today);
    } else if (type === 'weekly') {
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const weekEnd = new Date(now.setDate(now.getDate() + 6));
      return trips.filter(t => {
        const date = new Date(t.bookingDate);
        return date >= weekStart && date <= weekEnd;
      });
    } else if (type === 'monthly') {
      const month = now.getMonth();
      const year = now.getFullYear();
      return trips.filter(t => {
        const date = new Date(t.bookingDate);
        return date.getMonth() === month && date.getFullYear() === year;
      });
    }
    return trips;
  },
};
