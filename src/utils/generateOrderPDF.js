import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generateOrderPDF = async (
  orderName,
  deliveryDate
) => {
  const invoices =
    document.querySelectorAll(".order-invoice");

  if (!invoices.length) {
    alert("No invoices found");
    return;
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5",
    compress: true,
  });

  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const pageHeight =
    pdf.internal.pageSize.getHeight();

  const margin = 2;

  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;

  let firstPage = true;

  for (const invoice of invoices) {
    const canvas = await html2canvas(
      invoice,
      {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      }
    );

    const scale = Math.min(
      printableWidth / canvas.width,
      printableHeight / canvas.height
    );
    const imgWidth = canvas.width * scale;
    const imgHeight = canvas.height * scale;
   const x = (pageWidth - imgWidth) / 2;
const y = margin;

    if (!firstPage) {
      pdf.addPage();
    }

    firstPage = false;

    // OrderDetails already chunks each invoice into safe, complete pages.
    // Fit each chunk once; never crop or create an accidental blank page.
    pdf.addImage(
      canvas.toDataURL("image/jpeg", 0.95),
      "JPEG",
      x,
      y,
      imgWidth,
      imgHeight
    );
  }

const formattedDate =
  new Date(deliveryDate)
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

pdf.save(
  `${orderName}_${formattedDate}.pdf`
);}
