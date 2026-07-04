// Transport PDF Generator - Generate invoices and receipts

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { transportCalculator } from './transportCalculator';

const COMPANY_NAME = 'Durgule Transport';
const COMPANY_PHONE = '9112251220';
const COMPANY_LOCATION = 'Kolhapur';

export const transportPdfGenerator = {
  generateTransportInvoice: (trip, vehicle, driver, expenses = []) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 10;

    // Company Header
    doc.setFontSize(20);
    doc.setTextColor(20, 184, 166);
    doc.text(COMPANY_NAME, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${COMPANY_LOCATION} | ${COMPANY_PHONE}`, pageWidth / 2, yPosition, { align: 'center' });

    // Invoice title
    yPosition += 12;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('TRANSPORT INVOICE', 14, yPosition);

    yPosition += 8;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text([
      `Trip Number: ${trip.tripNumber}`,
      `Date: ${new Date(trip.bookingDate).toLocaleDateString('en-IN')}`,
      `Status: ${trip.status}`,
    ], 14, yPosition);

    // Trip Information
    yPosition += 18;
    doc.setFontSize(11);
    doc.setTextColor(20, 184, 166);
    doc.text('TRIP INFORMATION', 14, yPosition);

    yPosition += 8;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const tripData = [
      ['Trip Number', trip.tripNumber],
      ['Booking Date', new Date(trip.bookingDate).toLocaleDateString('en-IN')],
      ['Trip Type', trip.tripType],
      ['Distance (KM)', trip.distance?.toString() || 'N/A'],
      ['Source', trip.sourceCity],
      ['Destination', trip.destinationCity],
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Field', 'Value']],
      body: tripData,
      theme: 'grid',
      headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [0, 0, 0] },
      margin: { left: 14, right: 14 },
      columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 'auto' } },
    });

    yPosition = doc.lastAutoTable.finalY + 8;

    // Customer Information
    doc.setFontSize(11);
    doc.setTextColor(20, 184, 166);
    doc.text('CUSTOMER INFORMATION', 14, yPosition);

    yPosition += 8;
    const customerData = [
      ['Name', trip.customerName],
      ['Mobile', trip.customerMobile],
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Field', 'Value']],
      body: customerData,
      theme: 'grid',
      headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [0, 0, 0] },
      margin: { left: 14, right: 14 },
      columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 'auto' } },
    });

    yPosition = doc.lastAutoTable.finalY + 8;

    // Driver & Vehicle Information
    doc.setFontSize(11);
    doc.setTextColor(20, 184, 166);
    doc.text('DRIVER & VEHICLE INFORMATION', 14, yPosition);

    yPosition += 8;
    const driverVehicleData = [
      ['Driver', driver?.driverName || 'N/A'],
      ['Driver Contact', driver?.mobileNumber || 'N/A'],
      ['Vehicle', vehicle?.vehicleName || 'N/A'],
      ['Vehicle Number', vehicle?.vehicleNumber || 'N/A'],
      ['Vehicle Capacity', vehicle ? `${vehicle.capacity} ${vehicle.capacityUnit}` : 'N/A'],
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Field', 'Value']],
      body: driverVehicleData,
      theme: 'grid',
      headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [0, 0, 0] },
      margin: { left: 14, right: 14 },
      columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 'auto' } },
    });

    yPosition = doc.lastAutoTable.finalY + 8;

    // Goods Information
    if (trip.goods && trip.goods.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(20, 184, 166);
      doc.text('GOODS DETAILS', 14, yPosition);

      yPosition += 8;
      const goodsData = trip.goods.map(good => [
        good.itemName,
        good.quantity,
        good.weight,
        good.unit,
        `₹${good.rate.toFixed(2)}`,
        `₹${good.amount.toFixed(2)}`,
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Item Name', 'Qty', 'Weight', 'Unit', 'Rate', 'Amount']],
        body: goodsData,
        theme: 'grid',
        headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] },
        bodyStyles: { textColor: [0, 0, 0] },
        margin: { left: 14, right: 14 },
      });

      yPosition = doc.lastAutoTable.finalY + 8;
    }

    // Charges
    const tripStats = transportCalculator.calculateTripStats(trip, expenses);
    const chargesData = [
      ['Freight Charges', `₹${tripStats.freightCharges.toFixed(2)}`],
      ['Extra Charges', `₹${tripStats.extraCharges.toFixed(2)}`],
      ['Total Income', `₹${tripStats.totalIncome.toFixed(2)}`],
      ['Total Expenses', `₹${tripStats.totalExpenses.toFixed(2)}`],
      ['Net Profit/Loss', `₹${tripStats.netProfit.toFixed(2)}`],
    ];

    doc.setFontSize(11);
    doc.setTextColor(20, 184, 166);
    doc.text('CHARGES & SUMMARY', 14, yPosition);

    yPosition += 8;
    doc.autoTable({
      startY: yPosition,
      head: [['Description', 'Amount']],
      body: chargesData,
      theme: 'grid',
      headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [0, 0, 0] },
      margin: { left: 14, right: 14 },
      columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 'auto' } },
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Signature section
    doc.setFontSize(9);
    doc.text('Authorized Signature: ________________', 14, yPosition);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 120, yPosition);

    return doc;
  },

  generatePaymentReceipt: (trip, payment) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 10;

    // Company Header
    doc.setFontSize(18);
    doc.setTextColor(20, 184, 166);
    doc.text(COMPANY_NAME, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${COMPANY_LOCATION} | ${COMPANY_PHONE}`, pageWidth / 2, yPosition, { align: 'center' });

    // Receipt title
    yPosition += 12;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('PAYMENT RECEIPT', 14, yPosition);

    yPosition += 10;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text([
      `Receipt Number: RCP${Date.now()}`,
      `Trip: ${trip.tripNumber}`,
      `Date: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`,
    ], 14, yPosition);

    yPosition += 22;
    doc.setFontSize(11);
    doc.setTextColor(20, 184, 166);
    doc.text('PAYMENT DETAILS', 14, yPosition);

    yPosition += 10;
    const paymentData = [
      ['Trip Number', trip.tripNumber],
      ['Customer Name', trip.customerName],
      ['Customer Mobile', trip.customerMobile],
      ['Payment Amount', `₹${payment.amount.toFixed(2)}`],
      ['Payment Method', payment.method],
      ['Payment Status', payment.status],
      ['Transaction Number', payment.transactionNumber || 'N/A'],
      ['Date & Time', new Date(payment.createdAt).toLocaleString('en-IN')],
    ];

    doc.autoTable({
      startY: yPosition,
      head: [['Description', 'Value']],
      body: paymentData,
      theme: 'grid',
      headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [0, 0, 0] },
      margin: { left: 14, right: 14 },
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Signature
    doc.setFontSize(9);
    doc.text('Authorized By: ________________', 14, yPosition);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 120, yPosition);

    return doc;
  },

  downloadInvoice: (trip, vehicle, driver, expenses = []) => {
    const doc = transportPdfGenerator.generateTransportInvoice(trip, vehicle, driver, expenses);
    doc.save(`Transport_Invoice_${trip.tripNumber}.pdf`);
  },

  downloadReceipt: (trip, payment) => {
    const doc = transportPdfGenerator.generatePaymentReceipt(trip, payment);
    doc.save(`Payment_Receipt_${trip.tripNumber}.pdf`);
  },

  printInvoice: (trip, vehicle, driver, expenses = []) => {
    const doc = transportPdfGenerator.generateTransportInvoice(trip, vehicle, driver, expenses);
    doc.output('dataurlstring', (url) => {
      const printWindow = window.open(url);
      printWindow.print();
    });
  },

  printReceipt: (trip, payment) => {
    const doc = transportPdfGenerator.generatePaymentReceipt(trip, payment);
    doc.output('dataurlstring', (url) => {
      const printWindow = window.open(url);
      printWindow.print();
    });
  },
};
