import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Create a ZIP file containing multiple PDFs and trigger download
 * @param {Array} pdfData - Array of objects with {name: string, data: Uint8Array}
 * @param {string} zipFileName - Name for the ZIP file (default: 'physician-qa-pdfs.zip')
 */
export async function downloadPDFsAsZip(pdfData, zipFileName = 'physician-qa-pdfs.zip') {
  try {
    const zip = new JSZip();
    
    // Add each PDF to the ZIP
    pdfData.forEach(({ name, data }) => {
      zip.file(name, data);
    });
    
    // Generate the ZIP file
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });
    
    // Trigger download
    saveAs(zipBlob, zipFileName);
    
    return true;
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    throw new Error(`Failed to create ZIP file: ${error.message}`);
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
    .replace(/^Dr\.?\s*/i, '') // Remove "Dr." prefix
    .replace(/[^a-zA-Z0-9]/g, '') // Remove non-alphanumeric chars
    .substring(0, 20); // Limit length
  
  // Format date as YYYYMMDD
  const year = data.dateObj.getFullYear();
  const month = String(data.dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(data.dateObj.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  return `doc-${cleanDoctor}-${dateStr}-${data.number}.pdf`;
}
