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

    // Generate dynamic mock data for trading status
    const isMarketHours = isMarketOpen();
    const dayPnL = generateDayPnL();
    const accountValue = 100000 + dayPnL;

    res.json({
        status: 'connected',
        account: 'paper',
        market: isMarketHours ? 'open' : 'closed',
        connection: {
            ib: ibStatus.connected ? 'connected' : 'disconnected',
            lastUpdate: ibStatus.lastUpdate,
            error: ibStatus.error
        },
        trading: {
            enabled: ibStatus.connected,
            strategy: 'VWAP',
            riskLevel: 'low',
            accountValue: Math.round(accountValue),
            dayPnL: Math.round(dayPnL),
            buyingPower: Math.round(accountValue * 0.25), // 4:1 margin
            openOrders: Math.floor(Math.random() * 3), // 0-2 open orders
            lastTradeTime: new Date(Date.now() - Math.random() * 3600000).toISOString() // Random time in last hour
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
                // Generate realistic mock data that changes over time
                const basePrice = getBasePriceForSymbol(symbol);
                const mockQuote = generateRealisticMockQuote(symbol, exchange, currency, basePrice);

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

// Helper function to get base price for different symbols
function getBasePriceForSymbol(symbol: string): number {
    const basePrices: { [key: string]: number } = {
        'AAPL': 175.50,
        'TSLA': 245.80,
        'GOOGL': 142.30,
        'MSFT': 415.20,
        'AMZN': 155.75,
        'NVDA': 875.40,
        'META': 485.60,
        'NFLX': 485.90,
        'AMD': 165.25,
        'INTC': 43.80
    };

    return basePrices[symbol] || 100.00;
}

// Helper function to generate realistic mock market data
function generateRealisticMockQuote(symbol: string, exchange: string, currency: string, basePrice: number) {
    // Create time-based variation (changes every few seconds)
    const timeVariation = Math.sin(Date.now() / 10000) * 0.02; // ±2% variation over time
    const randomVariation = (Math.random() - 0.5) * 0.01; // ±0.5% random variation

    const currentPrice = basePrice * (1 + timeVariation + randomVariation);

    // Generate realistic bid/ask spread (0.01-0.05% of price)
    const spreadPercent = 0.0001 + (Math.random() * 0.0004); // 0.01% to 0.05%
    const spread = currentPrice * spreadPercent;

    const bid = currentPrice - (spread / 2);
    const ask = currentPrice + (spread / 2);

    // Last price is somewhere between bid and ask
    const last = bid + (Math.random() * spread);

    // Previous close (yesterday's close)
    const close = basePrice * (0.98 + Math.random() * 0.04); // ±2% from base

    // Volume varies throughout the day
    const timeOfDay = (Date.now() % (24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000);
    const volumeMultiplier = 0.5 + Math.sin(timeOfDay * Math.PI) * 0.5; // Higher volume during "market hours"
    const baseVolume = getBaseVolumeForSymbol(symbol);
    const volume = Math.floor(baseVolume * volumeMultiplier * (0.8 + Math.random() * 0.4));

    return {
        symbol: symbol,
        exchange: exchange,
        currency: currency,
        bid: Math.round(bid * 100) / 100,
        ask: Math.round(ask * 100) / 100,
        last: Math.round(last * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume: volume,
        lastUpdate: new Date().toISOString(),
        error: 'Live mock data - IB not connected'
    };
}

// Helper function to get base volume for different symbols
function getBaseVolumeForSymbol(symbol: string): number {
    const baseVolumes: { [key: string]: number } = {
        'AAPL': 45000000,
        'TSLA': 85000000,
        'GOOGL': 25000000,
        'MSFT': 35000000,
        'AMZN': 40000000,
        'NVDA': 55000000,
        'META': 30000000,
        'NFLX': 8000000,
        'AMD': 45000000,
        'INTC': 35000000
    };

    return baseVolumes[symbol] || 10000000;
}

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

// Helper function to determine if market is open (simplified)
function isMarketOpen(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Simplified: Monday-Friday, 9:30 AM - 4:00 PM ET (assuming local time)
    return day >= 1 && day <= 5 && hour >= 9 && hour < 16;
}

// Helper function to generate realistic day P&L
function generateDayPnL(): number {
    // Create time-based variation that changes throughout the day
    const timeVariation = Math.sin(Date.now() / 50000) * 2000; // ±$2000 variation
    const randomVariation = (Math.random() - 0.5) * 1000; // ±$500 random

    return timeVariation + randomVariation;
}

export default router; 