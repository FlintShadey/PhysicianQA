#!/bin/bash
# Complete cleanup script for development

echo "🧹 Cleaning up development environment..."

# Stop any running Vite processes
pkill -f vite 2>/dev/null || true

# Remove all build artifacts
echo "📁 Removing build artifacts..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf assets/
rm -f registerSW.js
rm -f sw.js
rm -f workbox-*.js
rm -f debug.html
rm -f manifest.webmanifest

# Restore development index.html
echo "📄 Restoring development index.html..."
cp index.development.html index.html

# Clear browser data (you'll need to do this manually)
echo "🌐 Manual steps needed:"
echo "   1. Open browser developer tools (F12)"
echo "   2. Go to Application tab"
echo "   3. Clear all storage/cache"
echo "   4. Unregister any service workers"
echo "   5. Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)"

echo "✅ Cleanup complete! Now run: npm run dev"
