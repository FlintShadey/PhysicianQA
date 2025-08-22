/**
 * Configuration for PDF field descriptions and processing options
 */

// Field descriptions for JSDoc comments
export const PDF_FIELD_DESCRIPTIONS = {
  doctor: 'Doctor name',
  date: 'Formatted date string',
  number: 'Number value'
};

// PDF processing options
export const PDF_OPTIONS = {
  // Text styling defaults
  textColor: { r: 0, g: 0, b: 0 }, // Black text
  
  // Debug overlay settings
  debug: {
    enabled: false, // Set to true to enable debug overlay
    crosshairColor: { r: 1, g: 0, b: 0 }, // Red
    crosshairOpacity: 0.3,
    crosshairThickness: 0.25,
    rulerColor: { r: 0, g: 0, b: 1 }, // Blue
    rulerOpacity: 0.7,
    rulerThickness: 0.5,
    labelFontSize: 8
  },
  
  // File naming options
  filename: {
    prefix: 'doc',
    separator: '-',
    doctorNameMaxLength: 20,
    removeDrPrefix: true
  }
};

// Default values for form fields
export const DEFAULT_VALUES = {
  doctors: ['Dr. Wheatley', 'Dr. Hamlett', 'Dr. Hutchins'],
  numberMin: 1,
  numberMax: 10,
  pdfCount: 5
};

// Error messages
export const ERROR_MESSAGES = {
  pdfLoadFailed: 'Failed to load the base PDF template. Please ensure PhysicianQA.pdf is in the public folder.',
  pdfProcessingFailed: 'Failed to create filled PDF',
  coordinatesNotFound: 'No coordinates found for field',
  zipCreationFailed: 'Failed to create ZIP file'
};
