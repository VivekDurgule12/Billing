import React, { useState, useEffect } from 'react';
import { storageManager } from '../utils/storageManager';

export default function BillingModule() {
  const [lineItems, setLineItems] = useState([]);
  const [customerData, setCustomerData] = useState({
    name: '',
    mobile: '',
    address: '',
  });
  const [summary, setSummary] = useState({
    porterage: 0,
    oldBalance: 0,
    discountType: 'fixed',
    discountValue: 0,
    receivedAmount: 0,
    note: '',
  });
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadInventory = async () => {
      setInventory(await storageManager.seedDefaultInventory());
    };

    loadInventory();
  }, []);

  const handleAddLineItem = () => {
    if (!selectedItem) {
      setMessage('❌ Please select an item');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    const item = inventory.find(i => i.item === selectedItem);
    if (item) {
      const newId = Date.now();
      setLineItems([
        ...lineItems,
        {
          id: newId,
          sn: item.sn,
          name: item.item,
          qty: 1,
          rate: item.sellingPrice,
          amount: item.sellingPrice,
          weightPerUnit: item.weightPerUnit,
          unitType: item.unitType,
        },
      ]);
      setSelectedItem('');
      setTimeout(() => {
        document.querySelector(`[data-line-id="${newId}"][data-line-field="qty"]`)?.focus();
      }, 0);
      setMessage('✅ Item added');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const handleUpdateLineItem = (id, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate') {
          updatedItem.amount = updatedItem.qty * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveLineItem = (id) => {
    setLineItems(lineItems.filter(item => item.id !== id));
    setMessage('✅ Item removed');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleBillingEnterMove = (e) => {
    if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const fields = Array.from(document.querySelectorAll('[data-billing-flow]'));
    const currentIndex = fields.indexOf(e.target);
    if (currentIndex === -1) {
      return;
    }

    e.preventDefault();
    const nextField = fields[currentIndex + 1];
    if (nextField) {
      nextField.focus();
      nextField.select?.();
    }
  };

  const handleItemSelectKeyDown = (e) => {
    if (e.key === 'Enter' && selectedItem) {
      e.preventDefault();
      handleAddLineItem();
      return;
    }

    handleBillingEnterMove(e);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const discount = summary.discountType === 'percentage'
      ? (subtotal * summary.discountValue) / 100
      : summary.discountValue;
    const afterDiscount = subtotal - discount;
    const total = afterDiscount + summary.porterage + summary.oldBalance;
    const payable = total - summary.receivedAmount;
    const totalWeight = lineItems.reduce((sum, item) => 
      sum + (item.qty * (item.weightPerUnit || 0)), 0);

    return { subtotal, discount, afterDiscount, total, payable, totalWeight };
  };

  const totals = calculateTotals();

  const handleGeneratePDF = () => {
    if (!customerData.name || lineItems.length === 0) {
      setMessage('❌ Please add customer and items before generating invoice');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const invoiceText = generateInvoiceText();
    const dataBlob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    storageManager.saveInvoice({
      customer: customerData,
      items: lineItems,
      summary,
      totals,
    });

    setMessage('✅ Invoice generated and saved');
    setTimeout(() => setMessage(''), 3000);
  };
const generateInvoiceText = () => {
  let text = '';

  text += '=================================================================\n';
  text += '                         INVOICE\n';
  text += '                    DURGULE BILLING STORE\n';
  text += '=================================================================\n\n';

  text += `Customer: ${customerData.name}\n`;
  text += `Mobile: ${customerData.mobile}\n`;
  text += `Address: ${customerData.address}\n`;
  text += `Date: ${new Date().toLocaleDateString()}\n`;
  text += `Invoice #: ${storageManager.getInvoices().length + 1001}\n\n`;

  text += '--------------------------------------\n';
  text += 'ITEMS\n';
  text += '--------------------------------------\n';

  lineItems.forEach((item, index) => {
    text += `${index + 1}. ${item.name}\n`;
    text += `   Qty: ${item.qty} x Rate: ₹${item.rate.toFixed(2)} = ₹${item.amount.toFixed(2)}\n`;
    text += `   Weight: ${(item.qty * (item.weightPerUnit || 0)).toFixed(2)} ${item.unitType || 'KG'}\n\n`;
  });

  text += '--------------------------------------\n';
  text += 'BILLING DETAILS\n';
  text += '--------------------------------------\n';

  text += `Subtotal:          ₹${totals.subtotal.toFixed(2)}\n`;
  text += `Porterage:         ₹${summary.porterage.toFixed(2)}\n`;
  text += `Old Balance:       ₹${summary.oldBalance.toFixed(2)}\n`;

  if (summary.discountValue > 0) {
    text += `Discount (${summary.discountType === 'percentage'
      ? summary.discountValue + '%'
      : '₹' + summary.discountValue}): -₹${totals.discount.toFixed(2)}\n`;
  }

  text += '\n';
  text += `Total Bill:        ₹${totals.total.toFixed(2)}\n`;
  text += `Received:          ₹${summary.receivedAmount.toFixed(2)}\n`;
  text += `Payable:           ₹${totals.payable.toFixed(2)}\n`;

  text += '\n';
  text += `Total Order Weight: ${totals.totalWeight.toFixed(2)} ${lineItems[0]?.unitType || 'KG'}\n`;

  if (summary.note) {
    text += `\nNote: ${summary.note}\n`;
  }

  text += '\n--------------------------------------\n';
  text += 'Thank you for your business!\n';
  text += '--------------------------------------\n';

  return text;
};

  const handlePrint = () => {
    if (!customerData.name || lineItems.length === 0) {
      setMessage('❌ Please add customer and items before printing');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: monospace; padding: 20px; background: white; }
          .header { text-align: center; margin-bottom: 20px; font-size: 18px; font-weight: bold; }
          .customer { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f0f0f0; padding: 8px; text-align: left; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          .summary { text-align: right; margin-top: 20px; }
          .summary-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { font-weight: bold; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="header">INVOICE - DURGULE BILLING STORE</div>
        <div class="customer">
          <strong>Customer:</strong> ${customerData.name}<br>
          <strong>Mobile:</strong> ${customerData.mobile}<br>
          <strong>Address:</strong> ${customerData.address}<br>
          <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
          <strong>Invoice #:</strong> ${storageManager.getInvoices().length + 1001}
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>₹${item.rate.toFixed(2)}</td>
                <td>₹${item.amount.toFixed(2)}</td>
                <td>${(item.qty * item.weightPerUnit).toFixed(2)} ${item.unitType}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="summary">
          <div class="summary-row"><span>Subtotal:</span><span>₹${totals.subtotal.toFixed(2)}</span></div>
          <div class="summary-row"><span>Porterage:</span><span>₹${summary.porterage.toFixed(2)}</span></div>
          <div class="summary-row"><span>Old Balance:</span><span>₹${summary.oldBalance.toFixed(2)}</span></div>
          ${summary.discountValue > 0 ? `<div class="summary-row"><span>Discount:</span><span>-₹${totals.discount.toFixed(2)}</span></div>` : ''}
          <div class="summary-row total"><span>Total Bill:</span><span>₹${totals.total.toFixed(2)}</span></div>
          <div class="summary-row"><span>Received:</span><span>₹${summary.receivedAmount.toFixed(2)}</span></div>
          <div class="summary-row total"><span>Payable:</span><span>₹${totals.payable.toFixed(2)}</span></div>
          <div class="summary-row"><span>Total Weight:</span><span>${totals.totalWeight.toFixed(2)} ${lineItems[0]?.unitType || 'KG'}</span></div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleClearBill = () => {
    if (window.confirm('Clear all items and customer data?')) {
      setLineItems([]);
      setCustomerData({ name: '', mobile: '', address: '' });
      setSummary({
        porterage: 0,
        oldBalance: 0,
        discountType: 'fixed',
        discountValue: 0,
        receivedAmount: 0,
        note: '',
      });
      setMessage('✅ Bill cleared');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-teal-300 mb-6">💳 Billing Module</h1>

      {message && (
        <div className="fixed top-4 right-4 bg-gray-800 border-l-4 border-teal-500 p-4 rounded shadow-lg z-50">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Billing Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Form */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-teal-300 mb-4">👤 Customer Details</h2>
            <div className="space-y-3">
              <input
                type="text"
                data-billing-flow
                placeholder="Customer Name *"
                value={customerData.name}
                onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                onKeyDown={handleBillingEnterMove}
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
              />
              <input
                type="text"
                data-billing-flow
                placeholder="Mobile Number"
                value={customerData.mobile}
                onChange={(e) => setCustomerData({...customerData, mobile: e.target.value})}
                onKeyDown={handleBillingEnterMove}
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
              />
              <input
                type="text"
                data-billing-flow
                placeholder="Address"
                value={customerData.address}
                onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                onKeyDown={handleBillingEnterMove}
                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-teal-300 mb-4">📝 Add Items</h2>
            <div className="flex gap-2 mb-4">
              <select
                data-billing-flow
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                onKeyDown={handleItemSelectKeyDown}
                className="flex-1 bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
              >
                <option value="">Select Product...</option>
                {inventory.map(item => (
                  <option key={item.sn} value={item.item}>
                    {item.item} (₹{item.sellingPrice})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddLineItem}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded transition-all"
              >
                ➕ Add
              </button>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-white text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-right">Amount</th>
                    <th className="p-2 text-right">Weight</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length > 0 ? (
                    lineItems.map(item => (
                      <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-700">
                        <td className="p-2 font-semibold">{item.name}</td>
                        <td className="p-2">
                          <input
                            type="number"
                            data-billing-flow
                            data-line-id={item.id}
                            data-line-field="qty"
                            value={item.qty}
                            onChange={(e) => handleUpdateLineItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                            onKeyDown={handleBillingEnterMove}
                            className="w-16 bg-gray-600 text-white p-1 rounded text-center"
                            min="1"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            data-billing-flow
                            data-line-id={item.id}
                            data-line-field="rate"
                            value={item.rate}
                            onChange={(e) => handleUpdateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            onKeyDown={handleBillingEnterMove}
                            className="w-20 bg-gray-600 text-white p-1 rounded text-right"
                          />
                        </td>
                        <td className="p-2 text-right font-semibold">₹{item.amount.toFixed(2)}</td>
                        <td className="p-2 text-right text-sm">
                          {(item.qty * (item.weightPerUnit || 0)).toFixed(2)} {item.unitType}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-400">
                        No items added. Select and add items above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Weight Summary */}
            {lineItems.length > 0 && (
              <div className="mt-4 p-3 bg-gray-700 rounded">
                <p className="text-teal-300 font-semibold">
                  ⚖️ Total Order Weight: {totals.totalWeight.toFixed(2)} {lineItems[0]?.unitType || 'KG'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Summary */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit sticky top-6 space-y-4">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">💰 Billing Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold">₹{totals.subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Porterage (₹)</label>
            <input
              type="number"
              data-billing-flow
              value={summary.porterage}
              onChange={(e) => setSummary({...summary, porterage: parseFloat(e.target.value) || 0})}
              onKeyDown={handleBillingEnterMove}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Old Balance (₹)</label>
            <input
              type="number"
              data-billing-flow
              value={summary.oldBalance}
              onChange={(e) => setSummary({...summary, oldBalance: parseFloat(e.target.value) || 0})}
              onKeyDown={handleBillingEnterMove}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Discount</label>
            <div className="flex gap-2 mb-2">
              <select
                data-billing-flow
                value={summary.discountType}
                onChange={(e) => setSummary({...summary, discountType: e.target.value})}
                onKeyDown={handleBillingEnterMove}
                className="flex-1 bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
              >
                <option value="fixed">Fixed (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
            <input
              type="number"
              data-billing-flow
              value={summary.discountValue}
              onChange={(e) => setSummary({...summary, discountValue: parseFloat(e.target.value) || 0})}
              onKeyDown={handleBillingEnterMove}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
              placeholder="0"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Received Amount (₹)</label>
            <input
              type="number"
              data-billing-flow
              value={summary.receivedAmount}
              onChange={(e) => setSummary({...summary, receivedAmount: parseFloat(e.target.value) || 0})}
              onKeyDown={handleBillingEnterMove}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
            />
          </div>

          <div className="bg-gray-700 p-4 rounded space-y-2 border border-gray-600">
            <div className="flex justify-between text-sm">
              <span>After Discount:</span>
              <span>₹{totals.afterDiscount.toFixed(2)}</span>
            </div>
            {summary.discountValue > 0 && (
              <div className="flex justify-between text-sm text-green-400">
                <span>Discount:</span>
                <span>-₹{totals.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-2 mt-2 text-teal-300">
              <span>Grand Total:</span>
              <span>₹{totals.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-yellow-400 font-semibold">
              <span>Payable:</span>
              <span>₹{Math.max(0, totals.payable).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Note</label>
            <textarea
              value={summary.note}
              onChange={(e) => setSummary({...summary, note: e.target.value})}
              placeholder="Add a note..."
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-teal-500 outline-none"
              rows="2"
            />
          </div>

          <div className="space-y-2 pt-4">
            <button
              onClick={handleGeneratePDF}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition-all"
            >
              📥 Download Invoice
            </button>
            <button
              onClick={handlePrint}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-all"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleClearBill}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded transition-all"
            >
              🗑️ Clear Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
