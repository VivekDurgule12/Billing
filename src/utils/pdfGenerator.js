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

  try {

    const canvas = await html2canvas(
      invoice,
      {
        scale: 2,
        useCORS: true,
        logging: false
      }
    );

    const imgData =
      canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const imgWidth =
      pageWidth;

    const imgHeight =
      (canvas.height * imgWidth) /
      canvas.width;

    let heightLeft =
      imgHeight;

    let position = 0;

    // First Page
    pdf.addImage(
      imgData,
      "PNG",
      0,
      position,
      imgWidth,
      imgHeight
    );

    heightLeft -= pageHeight;

    // Additional Pages
    while (heightLeft > 0) {

      position =
        heightLeft - imgHeight;

      pdf.addPage();

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= pageHeight;
    }

    const fileName =
      `${customerData.name
        .replace(/\s+/g, "_")}_${
        totals.total.toFixed(0)
      }_${
        new Date()
          .toISOString()
          .split("T")[0]
      }.pdf`;

    pdf.save(fileName);

  } catch (error) {

    console.error(
      "PDF Generation Error:",
      error
    );

    alert(
      "Failed to generate PDF"
    );
  }
};