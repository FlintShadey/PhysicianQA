import { PDFDocument, rgb } from 'pdf-lib';
import { PDF_COORDS } from '../config/pdfCoords.js';
import { PDF_FIELD_DESCRIPTIONS, PDF_OPTIONS, ERROR_MESSAGES } from '../config/pdfConfig.js';

/**
 * Load the base PDF template from public folder
 * @returns {Promise<Uint8Array>} PDF bytes
 */
export async function loadBasePDF() {
  try {
    const response = await fetch('./PhysicianQA.pdf');
    if (!response.ok) {
      throw new Error(`Failed to load PDF: ${response.status} ${response.statusText}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  } catch (error) {
    console.error('Error loading base PDF:', error);
    throw new Error(ERROR_MESSAGES.pdfLoadFailed);
  }
}

/**
 * Create a filled PDF with the provided data
 * @param {Object} data - The data to fill in the PDF
 * @param {string} data.doctor - ${PDF_FIELD_DESCRIPTIONS.doctor}
 * @param {string} data.date - ${PDF_FIELD_DESCRIPTIONS.date}
 * @param {number} data.number - ${PDF_FIELD_DESCRIPTIONS.number}
 * @returns {Promise<Uint8Array>} Generated PDF bytes
 */
export async function createFilledPDF(data) {
  try {
    console.log('Starting PDF generation with data:', data);
    
    // Load the base PDF
    const pdfBytes = await loadBasePDF();
    console.log('Base PDF loaded, size:', pdfBytes.length, 'bytes');
    
    // Create a new PDF document to ensure we preserve original content
    const newPdfDoc = await PDFDocument.create();
    const originalPdfDoc = await PDFDocument.load(pdfBytes);
    
    console.log('PDF documents loaded successfully');
    
    // Copy the first page from the original PDF to preserve all content
    const [originalPage] = await newPdfDoc.copyPages(originalPdfDoc, [0]);
    const addedPage = newPdfDoc.addPage(originalPage);
    
    const pageSize = addedPage.getSize();
    console.log('First page copied and added, size:', pageSize);
    
    // Debug: Check if the page has any existing content
    try {
      const pageNode = addedPage.node;
      console.log('Page has content streams:', !!pageNode.Contents);
      console.log('Page resources:', !!pageNode.Resources);
    } catch (e) {
      console.log('Could not inspect page content:', e.message);
    }
    
    // Add text overlays on top of the original content
    addTextToPage(addedPage, 'doctor', data.doctor);
    addTextToPage(addedPage, 'date', data.date);
    addTextToPage(addedPage, 'number', data.number.toString());
    
    // Debug overlay controlled by config - uncomment to enable coordinate debugging
    // if (PDF_OPTIONS.debug.enabled) {
    //   console.log('Drawing debug overlay...');
    //   drawDebugOverlay(addedPage);
    // }
    
    console.log('About to save PDF...');
    // Save and return the PDF
    const filledPdfBytes = await newPdfDoc.save();
    console.log('PDF saved successfully, final size:', filledPdfBytes.length, 'bytes');
    return filledPdfBytes;
  } catch (error) {
    console.error('Error creating filled PDF:', error);
    throw new Error(`${ERROR_MESSAGES.pdfProcessingFailed}: ${error.message}`);
  }
}

/**
 * Add text to a PDF page at specified coordinates
 * @param {Object} page - PDF page object
 * @param {string} field - Field name (doctor, date, number)
 * @param {string} text - Text to add
 */
function addTextToPage(page, field, text) {
  const coords = PDF_COORDS[field];
  if (!coords) {
    console.warn(`${ERROR_MESSAGES.coordinatesNotFound}: ${field}`);
    return;
  }
  
  // Debug logging to verify coordinates are being used
  console.log(`Adding text "${text}" for field "${field}" at coordinates:`, coords);
  
  try {
    page.drawText(text, {
      x: coords.x,
      y: coords.y,
      size: coords.fontSize,
      color: rgb(PDF_OPTIONS.textColor.r, PDF_OPTIONS.textColor.g, PDF_OPTIONS.textColor.b),
    });
  } catch (error) {
    console.error(`Error adding text for field ${field}:`, error);
  }
}

/**
 * Draw debug overlay with crosshairs and rulers (dev only)
 * @param {Object} page - PDF page object
 */
function drawDebugOverlay(page) {
  const { width, height } = page.getSize();
  const { debug } = PDF_OPTIONS;
  
  // Draw crosshairs at each coordinate
  Object.entries(PDF_COORDS).forEach(([field, coords]) => {
    // Vertical line
    page.drawLine({
      start: { x: coords.x, y: 0 },
      end: { x: coords.x, y: height },
      thickness: debug.crosshairThickness,
      color: rgb(debug.crosshairColor.r, debug.crosshairColor.g, debug.crosshairColor.b),
      opacity: debug.crosshairOpacity
    });
    
    // Horizontal line
    page.drawLine({
      start: { x: 0, y: coords.y },
      end: { x: width, y: coords.y },
      thickness: debug.crosshairThickness,
      color: rgb(debug.crosshairColor.r, debug.crosshairColor.g, debug.crosshairColor.b),
      opacity: debug.crosshairOpacity
    });
    
    // Label
    page.drawText(`${field} (${coords.x}, ${coords.y})`, {
      x: coords.x + 5,
      y: coords.y + 5,
      size: debug.labelFontSize,
      color: rgb(debug.crosshairColor.r, debug.crosshairColor.g, debug.crosshairColor.b)
    });
  });
  
  // Draw ruler marks along edges
  drawRulerMarks(page, width, height);
}

/**
 * Draw ruler marks for coordinate reference (dev only)
 * @param {Object} page - PDF page object
 * @param {number} width - Page width
 * @param {number} height - Page height
 */
function drawRulerMarks(page, width, height) {
  const { debug } = PDF_OPTIONS;
  
  // Horizontal ruler (bottom)
  for (let x = 0; x <= width; x += 50) {
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: 10 },
      thickness: debug.rulerThickness,
      color: rgb(debug.rulerColor.r, debug.rulerColor.g, debug.rulerColor.b),
      opacity: debug.rulerOpacity
    });
    
    if (x % 100 === 0) {
      page.drawText(x.toString(), {
        x: x + 2,
        y: 2,
        size: 6,
        color: rgb(debug.rulerColor.r, debug.rulerColor.g, debug.rulerColor.b)
      });
    }
  }
  
  // Vertical ruler (left)
  for (let y = 0; y <= height; y += 50) {
    page.drawLine({
      start: { x: 0, y },
      end: { x: 10, y },
      thickness: debug.rulerThickness,
      color: rgb(debug.rulerColor.r, debug.rulerColor.g, debug.rulerColor.b),
      opacity: debug.rulerOpacity
    });
    
    if (y % 100 === 0) {
      page.drawText(y.toString(), {
        x: 2,
        y: y + 2,
        size: 6,
        color: rgb(debug.rulerColor.r, debug.rulerColor.g, debug.rulerColor.b)
      });
    }
  }
}
