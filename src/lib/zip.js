import { PDFDocument } from "pdf-lib";

/**
 * Print multiple PDFs by combining them into a single document
 * @param {Array} pdfData - Array of objects with {name: string, data: Uint8Array}
 */
export async function printPDFs(pdfData) {
  try {
    // Create a new PDF document to combine all PDFs
    const combinedPdf = await PDFDocument.create();

    // Add each PDF to the combined document
    for (const { name, data } of pdfData) {
      // Load the individual PDF
      const pdf = await PDFDocument.load(data);

      // Copy all pages from this PDF to the combined PDF
      const pages = await combinedPdf.copyPages(pdf, pdf.getPageIndices());

      // Add each page to the combined document
      pages.forEach((page) => combinedPdf.addPage(page));
    }

    // Serialize the combined PDF
    const combinedPdfBytes = await combinedPdf.save();

    // Create blob and open for printing
    const pdfBlob = new Blob([combinedPdfBytes], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Open in new tab
    const printWindow = window.open(pdfUrl, "_blank");

    if (printWindow) {
      // Wait for the PDF to load before triggering print
      printWindow.addEventListener("load", () => {
        setTimeout(() => {
          printWindow.print();
        }, 1000); // Small delay to ensure PDF is fully loaded
      });
    } else {
      // Fallback if popup is blocked - just open the PDF
      window.open(pdfUrl, "_blank");
    }

    // Clean up the object URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 15000); // Longer delay for larger combined PDF

    return true;
  } catch (error) {
    console.error("Error printing combined PDF:", error);
    throw new Error(`Failed to print combined PDF: ${error.message}`);
  }
}

/**
 * Generate filename for a PDF based on the data
 * @param {Object} data - PDF data
 * @param {string} data.doctor - Doctor name
 * @param {Date} data.dateObj - Date object
 * @param {number} data.number - Number value
 * @returns {string} Generated filename
 */
export function generatePDFFilename(data) {
  // Clean doctor name for filename (remove spaces, special chars)
  const cleanDoctor = data.doctor
    .replace(/^Dr\.?\s*/i, "") // Remove "Dr." prefix
    .replace(/[^a-zA-Z0-9]/g, "") // Remove non-alphanumeric chars
    .substring(0, 20); // Limit length

  // Format date as YYYYMMDD
  const year = data.dateObj.getFullYear();
  const month = String(data.dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(data.dateObj.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  return `doc-${cleanDoctor}-${dateStr}-${data.number}.pdf`;
}

/**
 * Generate filename for a combined PDF
 * @param {Array} pdfDataArray - Array of PDF data objects
 * @returns {string} Generated filename for combined PDF
 */
export function generateCombinedPDFFilename(pdfDataArray) {
  if (pdfDataArray.length === 0) {
    return "combined-pdfs.pdf";
  }

  // Use the first PDF's date for the filename
  const firstPdf = pdfDataArray[0];
  const year = firstPdf.data.dateObj.getFullYear();
  const month = String(firstPdf.data.dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(firstPdf.data.dateObj.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  return `combined-docs-${dateStr}-${pdfDataArray.length}pdfs.pdf`;
}
