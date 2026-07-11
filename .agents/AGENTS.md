# Tab Splitter

## Overview
A web-based application designed to help friends split restaurant and bar bills seamlessly. Supports manual entry, AI-powered receipt scanning via OCR (Cloudflare Workers AI), and Venmo deep link generation for final settlement. Includes an Address Book for saving friends via Firebase Auth/Firestore.

## Current Track
**Track 1: Portfolio Piece**

## Problem Statement
Splitting a bill among friends at a restaurant is tedious. Usually one person pays and has to manually calculate who owes what, including tax and tip. It's error-prone and annoying. This app solves that by extracting items from a receipt image and letting friends claim what they ordered.

## Tech Stack
- **Frontend**: Vite + React + TypeScript
- **Database/Auth**: Firebase Firestore & Firebase Auth
- **Backend (OCR API)**: Cloudflare Worker (TypeScript)
- **AI Model**: Cloudflare Workers AI (Llama 3.2 Vision)
- **Design**: Vanilla CSS with modern aesthetics (dark mode, glassmorphism)

## Architecture
- Frontend hosted on Firebase Hosting.
- Cloudflare Worker provides a `/scan-receipt` endpoint. The frontend uploads a receipt image, the Worker calls Llama 3.2 Vision to extract line items (name, price), and returns JSON.
- Firebase handles saving friends' Venmo usernames for persistent usage.

## Status
Track 1 MVP Finished & Deployed.

## Key Decisions
- Chose **Cloudflare Workers AI** over OpenAI Vision to stay within the Cloudflare ecosystem and utilize the generous free tier.
- Bypassed complex real-time multiplayer rooms for the MVP in favor of a simpler single-device sharing workflow, but left the door open for Track 2.
- Used React `createPortal` to solve complex `z-index` stacking context bugs with the glassmorphism UI.
