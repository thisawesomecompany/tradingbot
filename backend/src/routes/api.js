"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ibService_1 = require("../services/ibService");
const ibClientPortalService_1 = __importDefault(require("../services/ibClientPortalService"));
const strategyEngine_1 = require("../services/strategyEngine");
const router = express_1.default.Router();
// Use Client Portal API instead of traditional socket API
const ibPortalService = new ibClientPortalService_1.default();
// Use the singleton instance, not constructor
const strategyEngine = new strategyEngine_1.StrategyEngine(ibService_1.ibService);
// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Tactical Trader Backend'
    });
});
// IB Connection Status (Traditional)
router.get('/ib/status', (req, res) => {
    try {
        const status = ibService_1.ibService.getConnectionStatus();
        res.json(status);
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get IB status',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// IB Client Portal Status
router.get('/ib/portal/status', (req, res) => {
    res.json({
        connected: false,
        authenticated: false,
        lastUpdate: new Date().toISOString(),
        note: 'Client Portal integration pending'
    });
});
// Trading Status  
router.get('/trading/status', (req, res) => {
    try {
        res.json({
            connected: ibService_1.ibService.isConnected(),
            engineRunning: false, // Remove problematic method call for now
            strategies: [], // Remove problematic method call for now
            lastUpdate: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get trading status',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Market Quote (sync version for now)
router.get('/market/quote/:symbol', (req, res) => {
    const { symbol } = req.params;
    try {
        // Use mock data for now to avoid async complications
        const mockQuote = {
            symbol: symbol.toUpperCase(),
            bid: 150.25 + Math.random() * 10,
            ask: 150.75 + Math.random() * 10,
            last: 150.50 + Math.random() * 10,
            change: -0.75 + Math.random() * 2,
            changePercent: -0.5 + Math.random() * 2,
            volume: Math.floor(Math.random() * 1000000),
            lastUpdate: new Date().toISOString(),
            source: 'mock'
        };
        res.json(mockQuote);
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get market quote',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Market History (sync version for now)  
router.get('/market/history/:symbol', (req, res) => {
    const { symbol } = req.params;
    try {
        // Generate mock historical data
        const bars = [];
        const basePrice = 150;
        const startTime = Date.now() - (100 * 24 * 60 * 60 * 1000); // 100 days ago
        for (let i = 0; i < 100; i++) {
            const time = startTime + (i * 24 * 60 * 60 * 1000);
            const open = basePrice + Math.random() * 20 - 10;
            const close = open + Math.random() * 6 - 3;
            const high = Math.max(open, close) + Math.random() * 2;
            const low = Math.min(open, close) - Math.random() * 2;
            const volume = Math.floor(Math.random() * 1000000);
            bars.push({
                time: Math.floor(time / 1000), // LightweightCharts expects seconds
                open: Number(open.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                close: Number(close.toFixed(2)),
                volume
            });
        }
        res.json({
            symbol: symbol.toUpperCase(),
            bars,
            timeframe: '1D',
            lastUpdate: new Date().toISOString(),
            source: 'mock'
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get market history',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Trading Positions
router.get('/trading/positions', (req, res) => {
    try {
        // Mock positions for now
        res.json([
            {
                symbol: 'SPY',
                quantity: 100,
                avgPrice: 150.25,
                marketValue: 15050,
                unrealizedPnL: 25.00,
                realizedPnL: 0
            }
        ]);
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get positions',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
