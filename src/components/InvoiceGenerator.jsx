import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = async ({
  customerData,
  lineItems,
  totals,
  summary,
  invoiceNumber
}) => {

  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const currentDate =
    new Date().toLocaleDateString("en-IN");

  const drawHeader = () => {

    pdf.setFontSize(18);
    pdf.setFont(undefined, "bold");

    pdf.text(
      "DURGULE TRADERS",
      pageWidth / 2,
      15,
      { align: "center" }
    );

    pdf.setFontSize(10);
    pdf.setFont(undefined, "normal");

    pdf.text(
      "9922019611, 8806821919",
      pageWidth - 10,
      22,
      { align: "right" }
    );

    pdf.line(
      10,
      25,
      pageWidth - 10,
      25
    );

    pdf.text(
      `Customer : ${customerData.name || ""}`,
      10,
      33
    );

    pdf.text(
      `Contact : ${customerData.mobile || ""}`,
      10,
      39
    );

    pdf.text(
      `Address : ${customerData.address || ""}`,
      10,
      45
    );

    pdf.text(
      `Date : ${currentDate}`,
      pageWidth - 10,
      33,
      { align: "right" }
    );

    pdf.text(
      `Invoice : INV-${invoiceNumber}`,
      pageWidth - 10,
      39,
      { align: "right" }
    );
  };

  const rows = lineItems.map((item, index) => [
    index + 1,
    item.name || "",
    item.qty || 0,
    `₹${Number(item.rate).toFixed(2)}`,
    `₹${Number(item.amount).toFixed(2)}`
  ]);

  autoTable(pdf, {
    startY: 55,

    margin: {
      top: 55,
      bottom: 20,
      left: 10,
      right: 10
    },

    showHead: "everyPage",

    pageBreak: "auto",

    rowPageBreak: "avoid",

    head: [[
      "Sr No",
      "Item Name",
      "Qty",
      "Rate",
      "Amount"
    ]],

    body: rows,

    theme: "grid",

    styles: {
      fontSize: 10,
      cellPadding: 3,
      overflow: "linebreak",
      valign: "middle"
    },

    headStyles: {
      fillColor: [240, 240, 240],
      textColor: 0,
      fontStyle: "bold"
    },

    columnStyles: {
      0: { halign: "center", cellWidth: 18 },
      1: { halign: "center", cellWidth: 75 },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "right", cellWidth: 30 },
      4: { halign: "right", cellWidth: 35 }
    },

    didDrawPage: (data) => {

      drawHeader();

      pdf.setFontSize(9);

      pdf.text(
        `Page ${data.pageNumber}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
    }
  });

  let finalY =
    pdf.lastAutoTable.finalY + 10;

  if (finalY > pageHeight - 70) {

    pdf.addPage();

    drawHeader();

    finalY = 60;
  }

  pdf.setFontSize(10);
  pdf.setFont(undefined, "normal");

  const summaryLines = [
    `Total Weight : ${totals.totalWeight.toFixed(2)}`,
    `Subtotal : ₹${totals.subtotal.toFixed(2)}`
  ];

  if (totals.porterage > 0) {
    summaryLines.push(
      `Porterage : ₹${totals.porterage.toFixed(2)}`
    );
  }

  if (totals.discount > 0) {
    summaryLines.push(
      `Discount : ₹${totals.discount.toFixed(2)}`
    );
  }

  if (summary.receivedAmount > 0) {
    summaryLines.push(
      `Received : ₹${summary.receivedAmount.toFixed(2)}`
    );
  }

  if (totals.payable > 0) {
    summaryLines.push(
      `Balance : ₹${totals.payable.toFixed(2)}`
    );
  }

  summaryLines.forEach((line, index) => {

    pdf.text(
      line,
      120,
      finalY + (index * 7)
    );

  });

  pdf.setFontSize(14);
  pdf.setFont(undefined, "bold");

  pdf.text(
    `Grand Total : ₹${totals.total.toFixed(2)}`,
    120,
    finalY +
    (summaryLines.length * 7) +
    12
  );

  const totalPages =
    pdf.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {

    pdf.setPage(i);

    pdf.setFontSize(9);

    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      {
        align: "center"
      }
    );
  }

  const fileName =
    `${customerData.name || "Invoice"}_${invoiceNumber}.pdf`;

  pdf.save(fileName);
};