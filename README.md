# PhysicianQA Filler

A Vue 3 Progressive Web App (PWA) for filling PDF templates with randomized physician data. Built with Vite, Vuetify, and pdf-lib for client-side PDF processing.

## Features

- **🔄 Randomized Data Generation**: Generates 5 unique PDFs per run with random combinations of:
  - Doctor names from an editable list
  - Dates from current month (America/Chicago timezone)
  - Numbers within a specified range
- **📝 Editable Doctor List**: Add, remove, and reorder doctors with localStorage persistence
- **📊 Number Range Configuration**: Set min/max values with validation
- **📱 Progressive Web App**: Installable, works offline, caches PDF template
- **📦 ZIP Download**: Single download for all 5 generated PDFs
- **🎯 Debug Mode**: Development overlay with crosshairs for coordinate tuning
- **💾 Data Persistence**: Settings saved to localStorage

## Tech Stack

- **Framework**: Vue 3 + Vite
- **UI Library**: Vuetify 3
- **PDF Processing**: pdf-lib (client-side)
- **File Handling**: JSZip + FileSaver
- **PWA**: vite-plugin-pwa
- **Language**: JavaScript (no TypeScript)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/FlintShadey/PhysicianQA.git
cd PhysicianQA
```

2. Install dependencies:
```bash
npm install
```

3. **Replace the placeholder PDF**:
   - Remove `public/PhysicianQA.pdf` (current placeholder)
   - Add your actual PDF template as `public/PhysicianQA.pdf`

4. **Adjust coordinates** (if needed):
   - Edit `src/config/pdfCoords.js` to match your PDF layout
   - Use development mode's debug overlay to fine-tune positioning

5. Start development server:
```bash
npm run dev
```

### PDF Coordinates Configuration

Text placement is configured in `src/config/pdfCoords.js`:

```javascript
export const PDF_COORDS = {
  doctor: { x: 180, y: 620, fontSize: 16 },
  date:   { x: 505, y: 650, fontSize: 12 },
  number: { x: 495, y: 620, fontSize: 12 }
};
```

**Debug Mode**: In development, a debug overlay shows crosshairs and rulers at these coordinates to help with positioning.

## Building and Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with the production build.

### GitHub Pages Deployment

The app is configured for GitHub Pages deployment from the root of the main branch.

#### GitHub Pages Checklist

1. **Repository Settings**:
   - Go to Settings → Pages
   - Set Source to "Deploy from a branch"
   - Select branch: `main`
   - Select folder: `/ (root)`

2. **Build and Deploy**:
   ```bash
   # Build the project
   npm run build
   
   # Copy dist contents to root (overwriting existing files)
   cp -r dist/* .
   
   # Commit and push
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Verify Deployment**:
   - Site URL: `https://flintshadey.github.io/PhysicianQA/`
   - Confirm the app loads and PWA features work
   - Test PDF generation with your template
   - Verify ZIP download functionality

4. **PWA Verification**:
   - Open site in Chrome/Edge
   - Check for install prompt in address bar
   - Install the app and verify it opens at root URL
   - Test offline functionality after first visit

#### Important Files for GitHub Pages

- **`.nojekyll`**: Prevents Jekyll processing (already included)
- **`vite.config.js`**: Configured with `base: "/"` for root deployment
- **PWA Manifest**: Configured with `start_url: "/"` for proper PWA behavior

## Usage

1. **Configure Doctors**: Use the doctor list editor to add/remove/reorder physician names
2. **Set Number Range**: Specify min and max values for the random number field
3. **Generate PDFs**: Click "Generate 5 PDFs" to create randomized documents
4. **Download**: Use "Download All as ZIP" to get all 5 PDFs in a single file

### Data Generation Logic

- **Doctor**: Random selection from your editable list
- **Date**: Random date between first day of current month and today (America/Chicago timezone)
- **Number**: Random integer within your specified range
- **Uniqueness**: Attempts to generate 5 distinct combinations

## Development

### Project Structure

```
src/
├── components/
│   └── DoctorListEditor.vue    # Editable doctor list component
├── config/
│   └── pdfCoords.js           # PDF text placement coordinates
├── lib/
│   ├── date.js                # America/Chicago timezone utilities
│   ├── pdf.js                 # PDF loading and text overlay
│   └── zip.js                 # ZIP generation and download
├── plugins/
│   └── vuetify.js             # Vuetify configuration
├── App.vue                    # Main application component
└── main.js                    # Application entry point
```

### Available Scripts

- `npm run dev` - Start development server with debug overlay
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Debug Features

In development mode:
- Debug overlay shows crosshairs at PDF coordinates
- Ruler marks along PDF edges for positioning reference
- Debug overlay is automatically excluded from production builds

## Troubleshooting

### PDF Generation Fails
- Ensure `public/PhysicianQA.pdf` is a valid PDF file
- Check browser console for specific error messages
- Verify PDF coordinates are within the page boundaries

### PWA Installation Issues
- Ensure HTTPS deployment (GitHub Pages provides this)
- Check that manifest.json is accessible
- Verify service worker registration

### ZIP Download Problems
- Modern browsers may block downloads - check for permission prompts
- Ensure popup blockers aren't interfering
- Try different browsers if issues persist

## Browser Support

- Chrome 80+
- Firefox 78+
- Safari 13.1+
- Edge 80+

## License

This project is private and proprietary.

## Contributing

This is a private project. Please contact the repository owner for any questions or contributions.
