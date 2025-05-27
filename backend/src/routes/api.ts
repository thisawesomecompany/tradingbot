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

// Market Data endpoints  
router.get('/market/quote/:symbol', (req, res) => {
    (async () => {
        try {
            const symbol = req.params.symbol.toUpperCase();
            const exchange = req.query.exchange as string || 'SMART';
            const currency = req.query.currency as string || 'USD';

            if (!symbol) {
                return res.status(400).json({
                    error: 'Symbol is required',
                    message: 'Please provide a valid stock symbol'
                });
            }

            // Check if connected to IB
            if (!ibService.isConnected()) {
                // Return mock data when not connected to IB
                const mockQuote = {
                    symbol: symbol,
                    exchange: exchange,
                    currency: currency,
                    bid: 100.25,
                    ask: 100.30,
                    last: 100.27,
                    close: 99.85,
                    volume: 1000000,
                    lastUpdate: new Date().toISOString(),
                    error: 'Mock data - IB not connected'
                };

                return res.json({
                    quote: mockQuote,
                    source: 'mock'
                });
            }

            // Get real market data from IB
            const quote = await ibService.getMarketQuote(symbol, exchange, currency);
            res.json({
                quote: quote,
                source: 'ib'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ Error fetching quote for ${req.params.symbol}:`, errorMessage);

            res.status(500).json({
                error: errorMessage,
                message: 'Failed to fetch market quote',
                symbol: req.params.symbol
            });
        }
    })();
});

router.get('/market/search/:pattern', (req, res) => {
    (async () => {
        try {
            const pattern = req.params.pattern;

            if (!pattern || pattern.length < 1) {
                return res.status(400).json({
                    error: 'Search pattern is required',
                    message: 'Please provide a search pattern'
                });
            }

            // Check if connected to IB
            if (!ibService.isConnected()) {
                // Return mock search results when not connected
                const mockResults = [
                    {
                        symbol: pattern.toUpperCase(),
                        secType: 'STK',
                        exchange: 'SMART',
                        currency: 'USD',
                        description: `Mock result for ${pattern.toUpperCase()}`
                    }
                ];

                return res.json({
                    results: mockResults,
                    source: 'mock'
                });
            }

            // Get real search results from IB
            const results = await ibService.searchSymbol(pattern);
            res.json({
                results: results,
                source: 'ib'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ Error searching for ${req.params.pattern}:`, errorMessage);

            res.status(500).json({
                error: errorMessage,
                message: 'Failed to search symbols',
                pattern: req.params.pattern
            });
        }
    })();
});

export default router; 