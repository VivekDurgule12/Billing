// Transport PDF Generator - Generate invoices and receipts

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { transportCalculator } from './transportCalculator';

const COMPANY_NAME = 'Durgule Transport';
const COMPANY_PHONE = '9112251220';
const COMPANY_LOCATION = 'Kolhapur';

export const transportPdfGenerator = {
  generateTransportInvoice: (trip, vehicle, driver, expenses = []) => {
    const doc = new jsPDF();
    const tripStats = transportCalculator.calculateTripStats(trip, expenses);
    const pageWidth = doc.internal.pageSize.getWidth();
    const tableStyles = { fontSize: 7.5, cellPadding: 1.6, textColor: [30, 30, 30] };
    const headStyles = { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontSize: 7.5, cellPadding: 1.8 };

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 31, 'F');
    doc.setFontSize(19);
    doc.setTextColor(20, 184, 166);
    doc.text(COMPANY_NAME, 12, 13);
    doc.setFontSize(8);
    doc.setTextColor(220, 225, 230);
    doc.text(`${COMPANY_LOCATION}, Maharashtra | Phone: ${COMPANY_PHONE}`, 12, 20);
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('TRANSPORT INVOICE', pageWidth - 12, 13, { align: 'right' });
    doc.setFontSize(8);
    doc.text(`${trip.tripNumber} | ${new Date(trip.bookingDate).toLocaleDateString('en-IN')}`, pageWidth - 12, 20, { align: 'right' });

    autoTable(doc, {
      startY: 36,
      head: [['Customer', 'Trip', 'Vehicle & Staff']],
      body: [[
        `${trip.customerName || 'N/A'}\n${trip.customerMobile || 'No contact'}`,
        `${trip.tripType || 'Trip'} | ${trip.status || 'Pending'}\nTotal KM: ${tripStats.totalDistance.toFixed(1)}`,
        `${vehicle?.vehicleName || 'N/A'} (${vehicle?.vehicleNumber || 'N/A'})\nDriver: ${driver?.driverName || 'N/A'} - ${driver?.mobileNumber || 'N/A'}\nCleaner: ${trip.cleanerName || 'N/A'} - ${trip.cleanerMobile || 'N/A'}`,
      ]],
      theme: 'grid',
      headStyles,
      bodyStyles: tableStyles,
      margin: { left: 12, right: 12 },
    });

    const routeRows = trip.fareGroups?.length
      ? trip.fareGroups.flatMap((fare, fareIndex) =>
        (fare.legs || []).map((leg, legIndex) => [
          `Fare ${fareIndex + 1}`,
          leg.from || 'N/A',
          leg.to || 'N/A',
          (Number(leg.distanceKm) || 0).toFixed(1),
          leg.loadStatus || 'Loaded',
          legIndex === 0 ? `Rs. ${(Number(fare.amount) || 0).toFixed(2)}` : '',
        ])
      ) : [['Fare 1', trip.sourceCity || 'N/A', trip.destinationCity || 'N/A', tripStats.totalDistance.toFixed(1), 'Loaded', `Rs. ${tripStats.totalIncome.toFixed(2)}`]];
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      head: [['Fare', 'From', 'To', 'KM', 'Load', 'Amount']],
      body: routeRows,
      theme: 'grid',
      headStyles,
      bodyStyles: tableStyles,
      margin: { left: 12, right: 12 },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      head: [['Trip Amount', 'Amount Received', 'Balance Due']],
      body: [[`Rs. ${tripStats.totalIncome.toFixed(2)}`, `Rs. ${tripStats.receivedAmount.toFixed(2)}`, `Rs. ${tripStats.balanceAmount.toFixed(2)}`]],
      theme: 'grid',
      headStyles,
      bodyStyles: { ...tableStyles, fontSize: 9, fontStyle: 'bold', halign: 'center' },
      margin: { left: 12, right: 12 },
    });

    const footerY = Math.min(doc.lastAutoTable.finalY + 18, 275);
    doc.setDrawColor(120, 120, 120);
    doc.line(12, footerY, 70, footerY);
    doc.line(pageWidth - 70, footerY, pageWidth - 12, footerY);
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text('Customer Signature', 12, footerY + 5);
    doc.text('Authorized Signature', pageWidth - 12, footerY + 5, { align: 'right' });
    doc.text('Thank you for choosing Durgule Transport', pageWidth / 2, 289, { align: 'center' });

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
      ['Payment Amount', `Rs. ${(Number(payment.amount) || 0).toFixed(2)}`],
      ['Payment Method', payment.method],
      ['Payment Status', payment.status],
      ['Transaction Number', payment.transactionNumber || 'N/A'],
      ['Date & Time', new Date(payment.createdAt).toLocaleString('en-IN')],
    ];

    autoTable(doc, {
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

  shareInvoice: async (trip, vehicle, driver, expenses = []) => {
    const doc = transportPdfGenerator.generateTransportInvoice(trip, vehicle, driver, expenses);
    const fileName = `Transport_Invoice_${trip.tripNumber}.pdf`;
    const file = new File([doc.output('blob')], fileName, { type: 'application/pdf' });
    const shareData = {
      title: `Transport Invoice ${trip.tripNumber}`,
      text: `Hello ${trip.customerName || 'Customer'}, please find your transport invoice ${trip.tripNumber}.`,
      files: [file],
    };

    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      await navigator.share(shareData);
      return 'shared';
    }

    doc.save(fileName);
    const phone = String(trip.customerMobile || '').replace(/\D/g, '');
    const indiaPhone = phone.length === 10 ? `91${phone}` : phone;
    const message = `${shareData.text} The PDF has been downloaded and can be attached here.`;
    window.open(`https://wa.me/${indiaPhone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    return 'downloaded';
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
