# Tab Splitter

A modern, mobile-first web application designed to help friends seamlessly split restaurant and bar bills. 

Instead of manually doing the math or typing out every single item, Tab Splitter lets you **take a picture of your receipt**, uses AI (Cloudflare Workers AI + Llama 3.2 Vision) to extract all the items automatically, and provides an interactive interface for everyone to claim what they ordered. Finally, it generates Venmo requests automatically for easy settlement.

## Features
- **AI Receipt Scanning**: Snap a picture of a receipt and the app uses Llama 3.2 Vision to extract all items and prices.
- **Aggressive Math Engine**: Calculates custom tax and tip (either by % or exact $ amount) and flawlessly distributes it proportionally across all individuals, strictly rounding to two decimal places.
- **Venmo Integration**: Generates deep links to instantly open the Venmo app with the correct total and pre-filled note.
- **Responsive Glassmorphism UI**: A beautiful, dark-mode, mobile-responsive UI built with vanilla CSS.
- **Address Book**: Securely save your friends' Venmo handles using Firebase Authentication and Firestore.

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Hosting**: Firebase Hosting (`tab-splitter-7b0d0`)
- **Database / Auth**: Firebase Realtime Database & Firestore
- **Backend OCR**: Cloudflare Workers
- **AI**: Cloudflare Workers AI (`@cf/meta/llama-3.2-11b-vision-instruct`)

## Directory Structure
- `/src`: The React frontend codebase.
- `/worker`: The Cloudflare Worker backend for handling the AI OCR receipt parsing securely without exposing API keys to the client.

## Running Locally

**1. Frontend**
```bash
npm install
npm run dev
```

**2. Backend OCR Worker**
```bash
cd worker
npm install
npx wrangler dev
```

## Deployment

**Frontend (Firebase Hosting)**
```bash
npm run build
npx firebase deploy --only hosting
```

**Backend (Cloudflare Worker)**
```bash
cd worker
npx wrangler deploy
```
