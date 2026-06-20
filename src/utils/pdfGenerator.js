import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generateInvoicePDF = async ({
  customerData,
  totals,
  invoiceNumber,
}) => {

  const invoice =
    document.getElementById(
      "invoice-template"
    );

  if (!invoice) {
    alert("Invoice template not found");
    return;
  }

  try {

    const canvas =
      await html2canvas(
        invoice,
        {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor:
            "#ffffff",
        }
      );

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const margin = 5;

    const footerHeight = 10;

    const imgWidth =
      pageWidth - margin * 2;

    const pageCanvasHeight =
      Math.floor(
        (
          canvas.width *
          (
            pageHeight -
            margin * 2 -
            footerHeight
          )
        ) /
        imgWidth
      );

    let renderedHeight = 0;

    let pageNumber = 1;

    while (
      renderedHeight <
      canvas.height
    ) {

      const pageCanvas =
        document.createElement(
          "canvas"
        );

      pageCanvas.width =
        canvas.width;

      pageCanvas.height =
        Math.min(
          pageCanvasHeight,
          canvas.height -
            renderedHeight
        );

      const ctx =
        pageCanvas.getContext(
          "2d"
        );

      ctx.drawImage(
        canvas,
        0,
        renderedHeight,
        canvas.width,
        pageCanvas.height,
        0,
        0,
        canvas.width,
        pageCanvas.height
      );

      const pageImg =
        pageCanvas.toDataURL(
          "image/jpeg",
          0.95
        );

      if (
        pageNumber > 1
      ) {
        pdf.addPage();
      }

      const pageImgHeight =
        (
          pageCanvas.height *
          imgWidth
        ) /
        pageCanvas.width;

      pdf.addImage(
        pageImg,
        "JPEG",
        margin,
        margin,
        imgWidth,
        pageImgHeight
      );

      // Footer
      pdf.setFontSize(9);

      pdf.text(
        `INV-${invoiceNumber}`,
        10,
        pageHeight - 5
      );

      pdf.text(
        `Page ${pageNumber}`,
        pageWidth / 2,
        pageHeight - 5,
        {
          align: "center"
        }
      );

      pdf.text(
        new Date()
          .toLocaleDateString(),
        pageWidth - 25,
        pageHeight - 5
      );

      renderedHeight +=
        pageCanvasHeight;

      pageNumber++;
    }

    const fileName = `${
      customerData?.name
        ?.trim()
        ?.replace(/\s+/g, "_") ||
      "Invoice"
    }_${
      Math.round(
        totals?.total || 0
      )
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