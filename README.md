# Tactical Trader

A robust, risk-aware, AI-augmented day trading bot using Interactive Brokers, built with a React (TypeScript) client and Node.js (TypeScript) backend.

## Project Structure

- `/backend` — Node.js backend (TypeScript) for IB integration, trading logic, REST/WebSocket API
- `/frontend` — React client (TypeScript) for dashboard, monitoring, and control

## Getting Started

### Backend
```
cd backend
npm install
npm run build # or npx ts-node src/index.ts for development
```

### Frontend
```
cd frontend
npm install
npm run dev
```

## Features
- VWAP-based trading strategy
- Risk management (1R, 3R cap, 4x margin)
- Interactive Brokers integration
- Real-time dashboard (React)
- Logging and analytics

## See PRD.md for full requirements and roadmap. 