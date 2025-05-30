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

// Historical Data endpoint for charts
router.get('/market/history/:symbol', (req, res) => {
    (async () => {
        try {
            const symbol = req.params.symbol.toUpperCase();
            const timeframe = req.query.timeframe as string || '5min';
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
                // Fetch real historical data from Alpha Vantage (free tier)
                const realBars = await fetchRealHistoricalData(symbol, timeframe);

                if (realBars.length > 0) {
                    return res.json({
                        symbol: symbol,
                        timeframe: timeframe,
                        bars: realBars,
                        source: 'alphavantage'
                    });
                } else {
                    // Fallback to mock data if API fails
                    const mockBars = generateMockHistoricalData(symbol, timeframe);
                    return res.json({
                        symbol: symbol,
                        timeframe: timeframe,
                        bars: mockBars,
                        source: 'mock'
                    });
                }
            }

            // TODO: Get real historical data from IB
            // const bars = await ibService.getHistoricalData(symbol, timeframe, exchange, currency);

            // For now, try real data first, then fallback
            const realBars = await fetchRealHistoricalData(symbol, timeframe);
            res.json({
                symbol: symbol,
                timeframe: timeframe,
                bars: realBars.length > 0 ? realBars : generateMockHistoricalData(symbol, timeframe),
                source: realBars.length > 0 ? 'alphavantage' : 'mock'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ Error fetching historical data for ${req.params.symbol}:`, errorMessage);

            res.status(500).json({
                error: errorMessage,
                message: 'Failed to fetch historical data',
                symbol: req.params.symbol
            });
        }
    })();
});

// Helper function to fetch real historical data from Alpha Vantage
async function fetchRealHistoricalData(symbol: string, timeframe: string) {
    try {
        // Using Alpha Vantage free API (no key required for demo data)
        // For production, you'd want to use your own API key
        const apiKey = 'demo'; // Replace with real API key for production

        // Map our timeframes to Alpha Vantage functions
        const functionMap: { [key: string]: string } = {
            '5min': 'TIME_SERIES_INTRADAY&interval=5min',
            '15min': 'TIME_SERIES_INTRADAY&interval=15min',
            '1h': 'TIME_SERIES_INTRADAY&interval=60min',
            '1d': 'TIME_SERIES_DAILY'
        };

        const func = functionMap[timeframe] || functionMap['5min'];
        const url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&apikey=${apiKey}&outputsize=compact`;

        console.log(`📈 Fetching real data for ${symbol} (${timeframe}) from Alpha Vantage...`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Alpha Vantage API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Check for API limit or error
        if (data['Error Message'] || data['Note']) {
            console.log('⚠️ Alpha Vantage API limit reached, using Yahoo Finance fallback...');
            return await fetchYahooFinanceData(symbol, timeframe);
        }

        // Parse Alpha Vantage response
        const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
        if (!timeSeriesKey || !data[timeSeriesKey]) {
            console.log('⚠️ No Alpha Vantage data found, trying Yahoo Finance...');
            return await fetchYahooFinanceData(symbol, timeframe);
        }

        const timeSeries = data[timeSeriesKey];
        const bars: any[] = [];

        // Convert Alpha Vantage data to our format
        Object.keys(timeSeries).slice(0, 100).forEach(timestamp => {
            const bar = timeSeries[timestamp];
            const time = Math.floor(new Date(timestamp).getTime() / 1000);

            bars.push({
                time: time,
                open: parseFloat(bar['1. open']),
                high: parseFloat(bar['2. high']),
                low: parseFloat(bar['3. low']),
                close: parseFloat(bar['4. close']),
                volume: parseInt(bar['5. volume'] || '0'),
            });
        });

        // Sort by time (oldest first)
        bars.sort((a, b) => a.time - b.time);

        console.log(`✅ Fetched ${bars.length} real data points for ${symbol}`);
        return bars;

    } catch (error) {
        console.error('❌ Error fetching from Alpha Vantage:', error);
        return await fetchYahooFinanceData(symbol, timeframe);
    }
}

// Fallback: Yahoo Finance API (unofficial but more reliable for free use)
async function fetchYahooFinanceData(symbol: string, timeframe: string) {
    try {
        // Yahoo Finance query API (unofficial but widely used)
        const interval = timeframe === '1d' ? '1d' : timeframe === '1h' ? '1h' : '5m';
        const range = '1mo'; // Last month of data

        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;

        console.log(`📊 Fetching real data for ${symbol} from Yahoo Finance...`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Yahoo Finance API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.chart?.result?.[0]) {
            throw new Error('No data from Yahoo Finance');
        }

        const result = data.chart.result[0];
        const timestamps = result.timestamp;
        const ohlcv = result.indicators.quote[0];

        const bars: any[] = [];

        for (let i = 0; i < timestamps.length && i < 100; i++) {
            if (ohlcv.open[i] && ohlcv.high[i] && ohlcv.low[i] && ohlcv.close[i]) {
                bars.push({
                    time: timestamps[i],
                    open: parseFloat(ohlcv.open[i].toFixed(2)),
                    high: parseFloat(ohlcv.high[i].toFixed(2)),
                    low: parseFloat(ohlcv.low[i].toFixed(2)),
                    close: parseFloat(ohlcv.close[i].toFixed(2)),
                    volume: parseInt(ohlcv.volume[i] || '0'),
                });
            }
        }

        console.log(`✅ Fetched ${bars.length} real Yahoo Finance data points for ${symbol}`);
        return bars;

    } catch (error) {
        console.error('❌ Error fetching from Yahoo Finance:', error);
        return []; // Return empty array, will fallback to mock data
    }
}

// Helper function to generate mock historical data
function generateMockHistoricalData(symbol: string, timeframe: string) {
    const bars: any[] = [];
    const now = Date.now();

    // Timeframe to milliseconds mapping
    const intervals: { [key: string]: number } = {
        '5min': 5 * 60 * 1000,
        '15min': 15 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
    };

    const interval = intervals[timeframe] || intervals['5min'];
    const points = 100; // Last 100 data points

    // Base prices for different symbols
    const basePrices: { [key: string]: number } = {
        'SPY': 480,
        'AAPL': 175,
        'TSLA': 245,
        'GOOGL': 160,
        'MSFT': 420,
        'NVDA': 875,
        'META': 520,
        'QQQ': 380,
        'IWM': 220,
        'GLD': 185,
    };

    let basePrice = basePrices[symbol] || 100;

    // Create a seed for consistent data generation based on symbol
    const symbolSeed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    for (let i = points; i >= 0; i--) {
        const time = Math.floor((now - (i * interval)) / 1000); // Convert to seconds

        // Use seeded random for consistent patterns (but still realistic movement)
        const seedValue = (symbolSeed + i) * 9301 + 49297; // Simple LCG-style seeding
        const pseudoRandom1 = (seedValue % 233280) / 233280; // Normalize to 0-1
        const pseudoRandom2 = ((seedValue * 7) % 233280) / 233280;
        const pseudoRandom3 = ((seedValue * 13) % 233280) / 233280;

        // For the most recent few points, add real-time variation
        let timeBasedVariation = 0;
        if (i <= 5) {
            // The last 5 points get real-time updates for smoother 1-second refresh
            const ageWeight = (6 - i) / 6; // More recent points get more variation
            timeBasedVariation = Math.sin(Date.now() / 5000 + symbolSeed) * 0.003 * ageWeight; // Faster, smaller real-time movement
        }

        // Generate realistic price movement with mostly consistent seed-based data
        const volatility = 0.015; // 1.5% volatility
        const trend = Math.sin((symbolSeed + i) / 30) * 0.002; // Deterministic trend
        const randomChange = (pseudoRandom1 - 0.5) * volatility;

        const priceChange = basePrice * (trend + randomChange + timeBasedVariation);
        const open = basePrice;
        const close = basePrice + priceChange;

        // Generate high/low based on open/close using seeded randomness
        const high = Math.max(open, close) + (pseudoRandom2 * basePrice * 0.003);
        const low = Math.min(open, close) - (pseudoRandom3 * basePrice * 0.003);

        // Generate volume based on symbol and seeded randomness
        const baseVolumes: { [key: string]: number } = {
            'SPY': 50000000,
            'AAPL': 30000000,
            'TSLA': 25000000,
            'GOOGL': 20000000,
            'MSFT': 25000000,
            'NVDA': 35000000,
            'META': 20000000,
        };

        const baseVolume = baseVolumes[symbol] || 1000000;
        const volumeVariation = 0.8 + (pseudoRandom1 * 0.4); // 0.8x to 1.2x base volume
        const volume = Math.floor(baseVolume * volumeVariation / points); // Distribute across time periods

        bars.push({
            time: time,
            open: Math.round(open * 100) / 100,
            high: Math.round(high * 100) / 100,
            low: Math.round(low * 100) / 100,
            close: Math.round(close * 100) / 100,
            volume: volume,
        });

        basePrice = close; // Use close as next open
    }

    return bars;
}

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