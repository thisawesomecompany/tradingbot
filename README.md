# 📈 Tactical Trader

A robust, risk-aware, AI-augmented day trading bot using Interactive Brokers, built with a React (TypeScript) client and Node.js (TypeScript) backend.

**Status**: 🚧 **In Development** - Currently migrating from Python to web-based architecture

## �� Project Progress

**Task Management**: All tasks are managed in **`todo.txt`** using the todo.txt format with priorities (A/B/C), project tags (+TradingBot), and context tags (@computer/@phone/@writing).

**Current Focus**: Testing Infrastructure Implementation
- ✅ **Phase 1 Complete**: Backend Foundation (Express API, CORS, Error Handling)
- ✅ **Phase 2 Complete**: Frontend Foundation (Dashboard UI, API Integration, Navigation)
- ✅ **Phase 3 Complete**: Core Trading Integration (IB API, Market Data, Charts, Strategy Engine)
- ⏳ **Phase 4 Current**: Testing Infrastructure & Quality Gates
- 📅 **Phase 5 Planned**: Polish & Deployment

**Current Status**: ✅ **Fully functional trading bot** with real-time charts, automated strategy engine, and data mode switching.

## 🎯 Task Management (todo.txt)

### View Current Tasks
```bash
# View all pending tasks
grep -v "^x " todo.txt

# View high priority tasks
grep "^(A)" todo.txt

# View tasks for computer work
grep "@computer" todo.txt

# View next 5 tasks to work on
grep "^(A)" todo.txt | grep "@computer" | head -5
```

### Manage Tasks
```bash
# Add a new task
echo "(B) 2025-05-30 Your task description +TradingBot @computer" >> todo.txt

# Mark task complete (replace with actual task)
sed -i 's/(A) 2025-05-30 Install testing/x 2025-05-30 (A) 2025-05-30 Install testing/' todo.txt

# View completed tasks
grep "^x " todo.txt
```

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

### 1. Start Both Frontend and Backend
```bash
npm run dev          # Start both frontend and backend
```
**Backend**: http://localhost:3001 | **Frontend**: http://localhost:5177+

### 2. Individual Development
```bash
# Backend only
cd backend && npm run dev

# Frontend only  
cd frontend && npm run dev
```

### 3. Open Trading Dashboard
Navigate to http://localhost:5177+ in your browser to see the trading dashboard.

## 🧪 Testing & Verification

### Run Tests
```bash
npm run test         # Run all tests
npm run test:watch   # Watch mode for tests
```

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
1. **Open browser**: http://localhost:5177+
2. **Verify dashboard loads**: Should show trading dashboard with charts
3. **Check data integration**: All components should display real-time data
4. **Browser console**: Should have no errors (F12 → Console)

### Integration Testing
- ✅ Frontend fetches data from backend APIs
- ✅ CORS configured for cross-origin requests
- ✅ Loading states and error handling work
- ✅ Real-time chart updates and market data
- ✅ Strategy engine simulation mode
- ✅ Data mode switching (live/simulated)

## 📊 Current Features

### ✅ Implemented
- **Backend API**: Express server with TypeScript and IB integration
- **Frontend Dashboard**: React trading interface with real-time charts
- **Trading Charts**: Interactive candlestick charts with indicators
- **Strategy Engine**: Automated VWAP trading strategies with simulation mode
- **Data Mode Switching**: Clear distinction between live and simulated data
- **Market Data**: Real-time quotes and historical data
- **Navigation**: Multi-page application (Dashboard, Trading, Settings)
- **State Management**: React Context for global state
- **Error Handling**: Comprehensive error boundaries and graceful degradation

### 🚧 In Progress (See todo.txt)
- **Testing Infrastructure**: Jest + Vitest + Playwright automated testing
- **Quality Gates**: CI/CD pipeline with automated deployment blocking
- **Client Portal Integration**: Enhanced IB authentication and trading

### 📅 Planned
- **Production Deployment**: Environment configuration and build optimization
- **Advanced Analytics**: Performance tracking and reporting
- **Enhanced Risk Management**: Advanced position sizing and stop-losses

## 📖 Documentation

- **[todo.txt](./todo.txt)**: All tasks managed in todo.txt format with priorities
- **[PRD.md](./PRD.md)**: Complete product requirements and specifications
- **[Legacy Python Bot](./app.py)**: Original implementation for reference

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev    # Start with auto-reload
npm run test   # Run backend tests
npm run build  # Compile TypeScript
npm start      # Run compiled version
```

### Frontend Development  
```bash
cd frontend
npm run dev      # Start dev server with HMR
npm run test     # Run frontend tests
npm run build    # Build for production
npm run preview  # Preview production build
```

### Project Management
- **Task Tracking**: All tasks tracked in [todo.txt](./todo.txt) using todo.txt format
- **Git Workflow**: Commit after each completed task
- **Testing**: Each task includes verification criteria

## 🎯 Next Steps

**Current Priority**: Testing Infrastructure Implementation

1. **Backend Testing**: Jest + Supertest + 90% coverage requirement
2. **Frontend Testing**: Vitest + @testing-library/react + component tests
3. **E2E Testing**: Playwright + complete workflow automation
4. **Quality Gates**: CI/CD pipeline with automated deployment blocking

**View all tasks**: `grep "^(A)" todo.txt | grep "@computer" | head -10`

See **[todo.txt](./todo.txt)** for detailed task list and progress tracking.

## 📞 Support

- **Issues**: Check todo.txt for current tasks and known limitations
- **Architecture**: See PRD.md for system design
- **Legacy Reference**: app.py contains original Python implementation 