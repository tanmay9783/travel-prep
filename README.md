# Travel Prep

## Overview

Travel Prep is a modern, fast, and accessible web application designed to help you plan and organize your travel checklists efficiently. Built with React and Vite, it ensures your data is saved persistently directly in your browser.

## Features

* **Add items**: Easily add items you need for your trip with custom quantities.
# 🌴 Travel Prep 🧳

A powerful, local-first multi-trip packing planner to help you organize all your travels.

## Features

- **Multiple Trips**: Manage multiple checklists simultaneously for different trips.
- **Trip Templates**: Instantly start packing using pre-defined templates (Beach, Mountain, Business, etc.).
- **Categories**: Keep your items organized by categories (Clothing, Electronics, Toiletries, etc.) with automatic grouping and filtering.
- **Add Items**: Specify the quantity and description of items you need to pack.
- **Mark as Packed**: Easily toggle items as packed or unpacked.
- **Edit Items**: Update the description, category, or quantity of existing items.
- **Search & Filter**: Quickly find specific items in your list, filter by category.
- **Sort Items**: Sort by input order, alphabetical description, or packed status.
- **Progress Tracking**: Visual progress bar showing the percentage of packed items.
- **Local Storage**: Your list is automatically saved in the browser and persists across reloads.
- **Offline PWA Support**: Application is fully functional when the device is offline, thanks to Service Worker caching and local-first architecture.
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices.
- **Theme Support**: Choose between Light, Dark, or System themes with persistent preferences.

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm run test
```

## Test Coverage

```bash
npm run test:coverage
```

## Linting

```bash
npm run lint
```

## Production Build

```bash
npm run build
npm run preview
```

## Offline Support & Storage Limitations

This application is configured as a Progressive Web App (PWA). Once loaded, the application shell and assets are cached locally using a Service Worker. All checklist data is persisted entirely in the browser's `localStorage`. This allows the application to be fully functional even when the device is offline. 

**Note on storage limitations:** Because this app uses local-first architecture without a backend database, clearing your browser's site data will delete your trips.

### Backup & Data Portability

Travel Prep includes a robust local backup system to ensure your data is safe:
- **Export Backup:** Downloads all your trips and checklist items as a single versioned JSON file.
- **Import Backup:** Allows you to restore trips from a JSON backup. You can choose to either **Replace** all your existing trips or **Add** the imported trips alongside your current ones.
- **Local-first Security:** The backup processing happens entirely in your browser. No server upload occurs. Your data remains on your device unless you explicitly export or share the backup file.

## Deployment

To deploy this application, run the production build command:

```bash
npm run build
```

The resulting static files will be placed in the `dist/` directory. You can host this directory on any static hosting provider like Vercel, Netlify, or GitHub Pages. Since it's a client-side only Vite application, no server-side configuration is needed other than standard SPA routing if applicable.
