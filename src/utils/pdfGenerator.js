import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generateInvoicePDF = async ({
  customerData,
  totals
}) => {

  const invoice =
    document.getElementById("invoice-template");

  if (!invoice) {
    alert("Invoice template not found");
    return;
  }

  const canvas = await html2canvas(invoice, {
    scale: 3
  });

  const imgData =
    canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5"
  });

  const width = 148;
  const height =
    (canvas.height * width) / canvas.width;

  pdf.addImage(
    imgData,
    "PNG",
    0,
    0,
    width,
    height
  );

  const fileName =
    `${customerData.name.replace(/\s+/g, "_")}_` +
    `${totals.total.toFixed(0)}_` +
    `${new Date().toISOString().split("T")[0]}.pdf`;
console.log("Saving PDF:", fileName);
  pdf.save(fileName);
};