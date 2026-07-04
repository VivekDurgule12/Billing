import React, { useState } from 'react';
import { transportCalculator } from '../utils/transportCalculator';

export default function Reports({ trips, drivers, vehicles }) {
  const [reportType, setReportType] = useState('daily');

  const getDailyReport = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayTrips = trips.filter(t => t.bookingDate === today);
    return {
      totalTrips: todayTrips.length,
      completedTrips: todayTrips.filter(t => t.status === 'Completed').length,
      income: transportCalculator.calculateDailyIncome(trips),
    };
  };

  const getMonthlyReport = () => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const monthlyTrips = trips.filter(t => {
      const date = new Date(t.bookingDate);
      return date.getMonth() === month && date.getFullYear() === year;
    });
    return {
      totalTrips: monthlyTrips.length,
      completedTrips: monthlyTrips.filter(t => t.status === 'Completed').length,
      income: transportCalculator.calculateMonthlyIncome(trips),
    };
  };

  const renderReport = () => {
    if (reportType === 'daily') {
      const report = getDailyReport();
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded border border-gray-600">
            <p className="text-gray-400 text-sm">Total Trips Today</p>
            <p className="text-3xl font-bold text-teal-400 mt-2">{report.totalTrips}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded border border-gray-600">
            <p className="text-gray-400 text-sm">Completed Trips</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{report.completedTrips}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded border border-gray-600">
            <p className="text-gray-400 text-sm">Today's Income</p>
            <p className="text-3xl font-bold text-cyan-400 mt-2">₹{report.income.toFixed(0)}</p>
          </div>
        </div>
      );
    } else if (reportType === 'monthly') {
      const report = getMonthlyReport();
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded border border-gray-600">
            <p className="text-gray-400 text-sm">Total Trips This Month</p>
            <p className="text-3xl font-bold text-teal-400 mt-2">{report.totalTrips}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded border border-gray-600">
            <p className="text-gray-400 text-sm">Completed Trips</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{report.completedTrips}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded border border-gray-600">
            <p className="text-gray-400 text-sm">Monthly Income</p>
            <p className="text-3xl font-bold text-cyan-400 mt-2">₹{report.income.toFixed(0)}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-teal-300 mb-4">📊 Reports & Analytics</h2>
        
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              reportType === 'daily'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📅 Daily Report
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              reportType === 'monthly'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📈 Monthly Report
          </button>
        </div>

        {renderReport()}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-bold text-teal-300 mb-4">Fleet Summary</h3>
          <div className="space-y-2 text-gray-300">
            <p><strong>Total Vehicles:</strong> {vehicles.length}</p>
            <p><strong>Available:</strong> {vehicles.filter(v => v.status === 'Available').length}</p>
            <p><strong>Running:</strong> {vehicles.filter(v => v.status === 'Running').length}</p>
            <p><strong>Maintenance:</strong> {vehicles.filter(v => v.status === 'Maintenance').length}</p>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-bold text-teal-300 mb-4">Driver Summary</h3>
          <div className="space-y-2 text-gray-300">
            <p><strong>Total Drivers:</strong> {drivers.length}</p>
            <p><strong>Available:</strong> {drivers.filter(d => d.status === 'Available').length}</p>
            <p><strong>On Trip:</strong> {drivers.filter(d => d.status === 'On Trip').length}</p>
            <p><strong>On Leave:</strong> {drivers.filter(d => d.status === 'Leave').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
