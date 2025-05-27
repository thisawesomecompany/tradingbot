import express from 'express';
import ibService from '../services/ibService';

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

// Trading status endpoint - returns real IB connection status
router.get('/trading/status', (req, res) => {
    const ibStatus = ibService.getConnectionStatus();

    res.json({
        status: 'connected',
        account: 'paper',
        market: 'open',
        connection: {
            ib: ibStatus.connected ? 'connected' : 'disconnected',
            lastUpdate: ibStatus.lastUpdate,
            error: ibStatus.error
        },
        trading: {
            enabled: ibStatus.connected,
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

// IB Connection endpoints
router.get('/ib/status', (req, res) => {
    const status = ibService.getConnectionStatus();
    res.json(status);
});

router.post('/ib/connect', async (req, res) => {
    try {
        const status = await ibService.connect();
        res.json({
            success: status.connected,
            status,
            message: status.connected ? 'Connected to IB successfully' : 'Failed to connect to IB'
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: errorMessage,
            message: 'Error connecting to IB'
        });
    }
});

router.post('/ib/disconnect', async (req, res) => {
    try {
        await ibService.disconnect();
        res.json({
            success: true,
            message: 'Disconnected from IB successfully'
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: errorMessage,
            message: 'Error disconnecting from IB'
        });
    }
});

export default router; 