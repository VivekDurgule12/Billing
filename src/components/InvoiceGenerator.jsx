import React from 'react';
import jsPDF from 'jspdf';

function InvoiceGenerator({ customer, items, totalAmount, remainingAmount }) {
  const formatINR = (number) => Number(number).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(20, 184, 166); // Teal
    doc.text('Invoice', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black
    doc.text(`Customer: ${customer.name || 'N/A'}`, 20, 40);
    doc.text(`Address: ${customer.address || 'N/A'}`, 20, 50);
    doc.text(`Date: ${customer.date || 'N/A'}`, 20, 60);

    doc.setFontSize(14);
    doc.setTextColor(249, 115, 22); // Orange
    doc.text('Items', 20, 80);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const headers = ['S.No', 'Item Name', 'Qty', 'Price', 'Total'];
    const startY = 90;
    headers.forEach((header, i) => doc.text(header, 20 + i * 40, startY));
    doc.line(20, startY + 2, 180, startY + 2);

    let y = startY + 10;
    const validItems = items.filter(
      (item) => item.name && Number(item.quantity) >= 1 && Number(item.price) >= 0
    );
    validItems.forEach((item, index) => {
      doc.text(`${index + 1}`, 20, y);
      doc.text(item.name, 60, y);
      doc.text(`${item.quantity}`, 100, y);
      doc.text(`₹${formatINR(item.price)}`, 140, y);
      doc.text(`₹${formatINR(item.total)}`, 180, y);
      y += 10;
    });

    doc.line(20, y, 180, y);
    doc.setFontSize(12);
    doc.text(`Total Amount: ₹${formatINR(totalAmount)}`, 20, y + 10);
    doc.text(`Remaining Amount: ₹${formatINR(remainingAmount)}`, 20, y + 20);
    doc.text(`Final Bill Total: ₹${formatINR(totalAmount)}`, 20, y + 30);

    // Save and provide feedback
    const fileName = `invoice_${customer.name || 'bill'}.pdf`;
    doc.save(fileName);
    alert(`PDF downloaded as "${fileName}"! Check your Downloads folder.`);
  };

  const shareText = () => {
    const validItems = items.filter(
      (item) => item.name && Number(item.quantity) >= 1 && Number(item.price) >= 0
    );
    const text = [
      `Invoice`,
      `Customer: ${customer.name || 'N/A'}`,
      `Address: ${customer.address || 'N/A'}`,
      `Date: ${customer.date || 'N/A'}`,
      '',
      'Items:',
      'S.No  Item Name           Qty  Price      Total',
      validItems
        .map((item, index) =>
          `${(index + 1).toString().padEnd(6)}${item.name.padEnd(20)}${item.quantity.toString().padEnd(5)}₹${formatINR(item.price).padEnd(11)}₹${formatINR(item.total)}`
'________________________________________'
        )
        .join('\n'),
      '',
      `Total Amount: ₹${formatINR(totalAmount)}`,
      `Remaining Amount: ₹${formatINR(remainingAmount)}`,
      `Final Bill Total: ₹${formatINR(totalAmount)}`,
    ].join('\n');

    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Invoice copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
      <button
        onClick={generatePDF}
        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl hover:bg-orange-700 hover:scale-105 transition-all duration-300 shadow-lg w-full sm:w-1/3 text-lg font-semibold flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download PDF
      </button>
      <button
        onClick={shareText}
        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 hover:scale-105 transition-all duration-300 shadow-lg w-full sm:w-1/3 text-lg font-semibold flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C9.344 12.717 10.147 12.4 11 12.4c.853 0 1.656.317 2.316.942M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 6a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Share Invoice
      </button>
    </div>
  );
}

export default InvoiceGenerator;