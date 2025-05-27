# 📈 Tactical Trader

A robust, risk-aware, AI-augmented day trading bot using Interactive Brokers, built with a React (TypeScript) client and Node.js (TypeScript) backend.

**Status**: 🚧 **In Development** - Currently migrating from Python to web-based architecture

## 📋 Project Progress

This project follows a structured migration plan tracked in **[TODO.md](./TODO.md)**:

- ✅ **Phase 1 Complete**: Backend Foundation (Express API, CORS, Error Handling)
- ✅ **Phase 2 Complete**: Frontend Foundation (Dashboard UI, API Integration, Navigation)
- ⏳ **Phase 3 Next**: Core Trading Integration (IB API, Market Data, Order Placement)
- 📅 **Phase 4 Planned**: Polish & Deployment

**Current Status**: Multi-page web application with navigation, displaying real-time data from backend APIs.

## 🏗️ Project Structure

```
tradingbot/
├── backend/          # Node.js + TypeScript API server
│   ├── src/
│   │   ├── index.ts     # Express server entry point
│   │   └── routes/      # API route handlers
│   └── package.json     # Backend dependencies
├── frontend/         # React + TypeScript web client
│   ├── src/
│   │   ├── components/  # Trading dashboard components
│   │   ├── services/    # API integration layer
│   │   └── hooks/       # React data fetching hooks
│   └── package.json     # Frontend dependencies
├── app.py           # Legacy Python trading bot (reference)
├── TODO.md          # Detailed migration task list
└── PRD.md           # Product Requirements Document
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Interactive Brokers TWS or IB Gateway (for trading features)

### 1. Start Backend API Server
```bash
cd backend
npm install
npm run dev
```
**Backend runs on**: http://localhost:3001

### 2. Start Frontend Dashboard
```bash
cd frontend  
npm install
npm run dev
```
**Frontend runs on**: http://localhost:5173 (or 5174 if 5173 is busy)

### 3. Open Trading Dashboard
Navigate to http://localhost:5173 in your browser to see the trading dashboard.

## 🧪 Testing & Verification

### Backend API Testing
```bash
# Health check
curl http://localhost:3001/api/health

# Trading status
curl http://localhost:3001/api/trading/status

# Account positions
curl http://localhost:3001/api/trading/positions
```

### Frontend Testing
1. **Open browser**: http://localhost:5173
2. **Verify dashboard loads**: Should show "Tactical Trader" header
3. **Check data integration**: Status panels should display data from backend
4. **Browser console**: Should have no errors (F12 → Console)

### Integration Testing
- ✅ Frontend fetches data from backend APIs
- ✅ CORS configured for cross-origin requests
- ✅ Loading states and error handling work
- ✅ Real-time data display (not hardcoded values)

## 📊 Current Features

### ✅ Implemented
- **Backend API**: Express server with TypeScript
- **Frontend Dashboard**: React trading interface with navigation
- **Multi-Page Navigation**: Dashboard, Trading, Settings pages
- **API Integration**: Real-time data fetching
- **Error Handling**: Graceful error states and loading indicators
- **Mock Data**: Paper trading account simulation
- **State Management**: React useState for page navigation

### 🚧 In Progress (See TODO.md)
- **IB Integration**: Live Interactive Brokers connection
- **Market Data**: Real stock quotes and charts
- **Order Placement**: Buy/sell functionality

### 📅 Planned
- **VWAP Strategy**: Automated trading algorithm
- **Risk Management**: Position sizing and stop-losses
- **Analytics**: Performance tracking and reporting

## 📖 Documentation

- **[TODO.md](./TODO.md)**: Detailed task list with progress tracking
- **[PRD.md](./PRD.md)**: Complete product requirements and specifications
- **[Legacy Python Bot](./app.py)**: Original implementation for reference

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev    # Start with auto-reload
npm run build  # Compile TypeScript
npm start      # Run compiled version
```

### Frontend Development  
```bash
cd frontend
npm run dev      # Start dev server with HMR
npm run build    # Build for production
npm run preview  # Preview production build
```

### Project Management
- **Task Tracking**: All tasks tracked in [TODO.md](./TODO.md)
- **Git Workflow**: Commit after each completed task
- **Testing**: Each task has "Must Have" success criteria

## 🎯 Next Steps

1. **Start Phase 3**: Integrate Interactive Brokers API
3. **Add Market Data**: Real-time stock quotes and charts
4. **Implement Trading**: Order placement and management

See **[TODO.md](./TODO.md)** for detailed next steps and progress tracking.

## 📞 Support

- **Issues**: Check TODO.md for known limitations
- **Architecture**: See PRD.md for system design
- **Legacy Reference**: app.py contains original Python implementation 