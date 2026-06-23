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

  const printableWidth =
    pageWidth - margin * 2;

  const printableHeight =
    pageHeight - margin * 2;

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

    const imgData = canvas.toDataURL(
      "image/jpeg",
      0.95
    );

    const imgWidth = printableWidth;

    const imgHeight =
      (canvas.height * imgWidth) /
      canvas.width;

    const x =
      (pageWidth - imgWidth) / 2;

    if (!firstPage) {
      pdf.addPage();
    }

    firstPage = false;

    // Single page invoice
    if (imgHeight <= printableHeight) {
      pdf.addImage(
        imgData,
        "JPEG",
        x,
        margin,
        imgWidth,
        imgHeight
      );
    } else {
      let remainingHeight =
        imgHeight;

      let yPosition = margin;

 console.log("imgWidth =", imgWidth);
console.log("imgHeight =", imgHeight);
console.log("x =", x);
console.log("canvas.width =", canvas.width);
console.log("canvas.height =", canvas.height);

if (
  isNaN(imgWidth) ||
  isNaN(imgHeight) ||
  isNaN(x) ||
  !isFinite(imgWidth) ||
  !isFinite(imgHeight) ||
  !isFinite(x)
) {
  console.error("INVALID VALUES", {
    imgWidth,
    imgHeight,
    x,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height
  });

  return;
}

      pdf.addImage(
        imgData,
        "JPEG",
        x,
    
        yPosition,
        imgWidth,
        imgHeight
      );

      remainingHeight -=
        printableHeight;

      while (
        remainingHeight > 0
      ) {
        pdf.addPage();

        yPosition =
          -(imgHeight -
            remainingHeight) +
          margin;

        pdf.addImage(
          imgData,
          "JPEG",
          x,
          yPosition,
          imgWidth,
          imgHeight
        );

        remainingHeight -=
          printableHeight;
      }
    }
  }

const formattedDate =
  new Date(deliveryDate)
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

pdf.save(
  `${orderName}_${formattedDate}.pdf`
);}