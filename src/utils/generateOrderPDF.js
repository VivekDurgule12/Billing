import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generateOrderPDF = async (
orderName
) => {

const invoices =
document.querySelectorAll(
".order-invoice"
);

if (!invoices.length) {
alert("No invoices found");
return;
}

const pdf = new jsPDF({
orientation: "portrait",
unit: "mm",
format: "a4"
});

const pageWidth =
pdf.internal.pageSize.getWidth();

const pageHeight =
pdf.internal.pageSize.getHeight();

const margin = 5;

let firstPage = true;

for (
let invoiceIndex = 0;
invoiceIndex < invoices.length;
invoiceIndex++
) {

 
if (!firstPage) {
  pdf.addPage();
}

firstPage = false;

const canvas =
  await html2canvas(
    invoices[invoiceIndex],
    {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    }
  );

const imgData =
  canvas.toDataURL(
    "image/jpeg",
    0.95
  );

const imgWidth =
  pageWidth - margin * 2;

const imgHeight =
  (canvas.height * imgWidth) /
  canvas.width;

const printableHeight =
  pageHeight - margin * 2;

if (
  imgHeight <= printableHeight
) {

  pdf.addImage(
    imgData,
    "JPEG",
    margin,
    margin,
    imgWidth,
    imgHeight
  );

} else {

  let heightLeft =
    imgHeight;

  let position =
    margin;

  pdf.addImage(
    imgData,
    "JPEG",
    margin,
    position,
    imgWidth,
    imgHeight
  );

  heightLeft -=
    printableHeight;

  while (
    heightLeft > 0
  ) {

    pdf.addPage();

    position =
      -(imgHeight - heightLeft) +
      margin;

    pdf.addImage(
      imgData,
      "JPEG",
      margin,
      position,
      imgWidth,
      imgHeight
    );

    heightLeft -=
      printableHeight;
  }
}
 

}

pdf.save(
`${orderName}.pdf`
);
};
