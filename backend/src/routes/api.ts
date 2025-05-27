import express from 'express';

const router = express.Router();

// Health endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Tactical Trader API is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Trading status endpoint - returns mock status
router.get('/trading/status', (req, res) => {
    res.json({
        status: 'connected',
        account: 'paper',
        market: 'open',
        connection: {
            ib: 'disconnected',
            lastUpdate: new Date().toISOString()
        },
        trading: {
            enabled: false,
            strategy: 'VWAP',
            riskLevel: 'low'
        }
    });
});

// Trading positions endpoint - returns empty array for now
router.get('/trading/positions', (req, res) => {
    res.json({
        positions: [],
        totalValue: 0,
        cash: 100000,
        dayPnL: 0,
        totalPnL: 0,
        lastUpdate: new Date().toISOString()
    });
});

export default router; 