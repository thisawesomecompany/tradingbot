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
        status: 'ok',
        service: 'Tactical Trader Backend',
        timestamp: new Date().toISOString()
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
    console.log('🔍 Trading status endpoint called - UPDATED VERSION');
    try {
        const isConnected = ibService_1.ibService.isConnected();
        res.json({
            status: 'ok',
            account: 'DU12345',
            market: 'open',
            connection: {
                ib: isConnected ? 'connected' : 'disconnected',
                lastUpdate: new Date().toISOString()
            },
            trading: {
                enabled: false,
                strategy: 'VWAP Scalping',
                riskLevel: 'medium',
                accountValue: 100000,
                dayPnL: 250.50,
                buyingPower: 25000,
                openOrders: 0
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get trading status',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Test endpoint to verify code updates
router.get('/test', (req, res) => {
    res.json({
        message: 'Code updated successfully',
        timestamp: new Date().toISOString(),
        version: '2.0'
    });
});
// Market Quote - Fixed for Express v5
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
// Market History - Fixed for Express v5
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
        // Mock positions data matching the frontend PositionsData interface
        const positions = [
            {
                symbol: 'SPY',
                quantity: 100,
                avgPrice: 150.25,
                marketValue: 15050,
                unrealizedPnL: 25.00,
                realizedPnL: 0
            }
        ];
        // Return the expected PositionsData structure
        res.json({
            positions,
            totalValue: 100000,
            cash: 50000,
            dayPnL: 250.50,
            totalPnL: 1250.75,
            lastUpdate: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get positions',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Order Management Endpoints
// Place a new order
const placeOrderHandler = (req, res) => {
    try {
        const { symbol, side, quantity, orderType, price, timeInForce } = req.body;
        // Validate required fields
        if (!symbol || !side || !quantity || !orderType) {
            res.status(400).json({
                error: 'Missing required fields',
                required: ['symbol', 'side', 'quantity', 'orderType']
            });
            return;
        }
        // Validate side
        if (!['BUY', 'SELL'].includes(side.toUpperCase())) {
            res.status(400).json({
                error: 'Invalid side',
                message: 'Side must be BUY or SELL'
            });
            return;
        }
        // Validate order type
        if (!['MKT', 'LMT', 'STP', 'STP_LMT'].includes(orderType.toUpperCase())) {
            res.status(400).json({
                error: 'Invalid order type',
                message: 'Order type must be MKT, LMT, STP, or STP_LMT'
            });
            return;
        }
        // Validate limit price for limit orders
        if (['LMT', 'STP_LMT'].includes(orderType.toUpperCase()) && !price) {
            res.status(400).json({
                error: 'Price required for limit orders'
            });
            return;
        }
        // Mock order placement
        const orderId = Math.floor(Math.random() * 1000000).toString();
        const order = {
            orderId,
            symbol: symbol.toUpperCase(),
            side: side.toUpperCase(),
            quantity: parseInt(quantity),
            orderType: orderType.toUpperCase(),
            price: price ? parseFloat(price) : null,
            timeInForce: timeInForce || 'DAY',
            status: 'PENDING',
            submittedAt: new Date().toISOString(),
            filledQuantity: 0,
            avgFillPrice: null
        };
        res.status(201).json({
            success: true,
            order,
            message: 'Order placed successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to place order',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
router.post('/trading/orders', placeOrderHandler);
// Get all orders
router.get('/trading/orders', (req, res) => {
    try {
        const { status, symbol } = req.query;
        // Mock orders data
        let orders = [
            {
                orderId: '123456',
                symbol: 'SPY',
                side: 'BUY',
                quantity: 100,
                orderType: 'LMT',
                price: 150.00,
                timeInForce: 'DAY',
                status: 'FILLED',
                submittedAt: new Date(Date.now() - 3600000).toISOString(),
                filledQuantity: 100,
                avgFillPrice: 150.25
            },
            {
                orderId: '123457',
                symbol: 'QQQ',
                side: 'BUY',
                quantity: 50,
                orderType: 'MKT',
                price: null,
                timeInForce: 'DAY',
                status: 'PENDING',
                submittedAt: new Date(Date.now() - 1800000).toISOString(),
                filledQuantity: 0,
                avgFillPrice: null
            }
        ];
        // Filter by status if provided
        if (status && typeof status === 'string') {
            orders = orders.filter(order => order.status.toLowerCase() === status.toLowerCase());
        }
        // Filter by symbol if provided
        if (symbol && typeof symbol === 'string') {
            orders = orders.filter(order => order.symbol.toLowerCase() === symbol.toLowerCase());
        }
        res.json({
            orders,
            total: orders.length,
            lastUpdate: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get orders',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get specific order
router.get('/trading/orders/:orderId', (req, res) => {
    try {
        const { orderId } = req.params;
        // Mock order lookup
        const order = {
            orderId,
            symbol: 'SPY',
            side: 'BUY',
            quantity: 100,
            orderType: 'LMT',
            price: 150.00,
            timeInForce: 'DAY',
            status: 'FILLED',
            submittedAt: new Date(Date.now() - 3600000).toISOString(),
            filledQuantity: 100,
            avgFillPrice: 150.25,
            executions: [
                {
                    executionId: 'exec_001',
                    quantity: 100,
                    price: 150.25,
                    timestamp: new Date(Date.now() - 3550000).toISOString()
                }
            ]
        };
        res.json(order);
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get order',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Cancel an order
const cancelOrderHandler = (req, res) => {
    try {
        const { orderId } = req.params;
        // Mock order cancellation
        if (orderId === 'invalid') {
            res.status(404).json({
                error: 'Order not found',
                orderId
            });
            return;
        }
        if (orderId === 'filled') {
            res.status(400).json({
                error: 'Cannot cancel filled order',
                orderId
            });
            return;
        }
        res.json({
            success: true,
            orderId,
            status: 'CANCELLED',
            cancelledAt: new Date().toISOString(),
            message: 'Order cancelled successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to cancel order',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
router.delete('/trading/orders/:orderId', cancelOrderHandler);
// Modify an order
const modifyOrderHandler = (req, res) => {
    try {
        const { orderId } = req.params;
        const { quantity, price } = req.body;
        if (!quantity && !price) {
            res.status(400).json({
                error: 'At least one field (quantity or price) must be provided for modification'
            });
            return;
        }
        // Mock order modification
        if (orderId === 'invalid') {
            res.status(404).json({
                error: 'Order not found',
                orderId
            });
            return;
        }
        if (orderId === 'filled') {
            res.status(400).json({
                error: 'Cannot modify filled order',
                orderId
            });
            return;
        }
        const modifiedOrder = {
            orderId,
            symbol: 'SPY',
            side: 'BUY',
            quantity: quantity ? parseInt(quantity) : 100,
            orderType: 'LMT',
            price: price ? parseFloat(price) : 150.00,
            timeInForce: 'DAY',
            status: 'PENDING',
            submittedAt: new Date(Date.now() - 1800000).toISOString(),
            modifiedAt: new Date().toISOString(),
            filledQuantity: 0,
            avgFillPrice: null
        };
        res.json({
            success: true,
            order: modifiedOrder,
            message: 'Order modified successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to modify order',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
router.put('/trading/orders/:orderId', modifyOrderHandler);
// Account Information
router.get('/trading/account', (req, res) => {
    try {
        res.json({
            accountId: 'DU12345',
            accountType: 'MARGIN',
            accountValue: 100000,
            cash: 50000,
            dayTradingBuyingPower: 200000,
            equity: 100000,
            grossPositionValue: 50000,
            maintenanceMargin: 5000,
            netLiquidation: 100000,
            totalCashValue: 50000,
            unrealizedPnL: 250.50,
            realizedPnL: 1000.25,
            dayPnL: 250.50,
            currency: 'USD',
            lastUpdate: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get account info',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Risk Management - Check order before placement
const validateOrderHandler = (req, res) => {
    try {
        const { symbol, side, quantity, orderType, price } = req.body;
        if (!symbol || !side || !quantity || !orderType) {
            res.status(400).json({
                error: 'Missing required fields for validation',
                required: ['symbol', 'side', 'quantity', 'orderType']
            });
            return;
        }
        const orderValue = price ? parseFloat(price) * parseInt(quantity) : 150 * parseInt(quantity);
        const availableCash = 50000; // Mock available cash
        // Risk checks
        const riskChecks = {
            sufficientBuyingPower: side.toUpperCase() === 'SELL' || orderValue <= availableCash,
            positionSizeLimit: parseInt(quantity) <= 1000, // Max 1000 shares
            priceReasonable: !price || (parseFloat(price) > 0 && parseFloat(price) < 10000),
            symbolValid: /^[A-Za-z.]+$/.test(symbol), // Basic symbol validation
            dayTradingLimit: true // Mock check
        };
        const allChecksPass = Object.values(riskChecks).every(check => check);
        res.json({
            valid: allChecksPass,
            checks: riskChecks,
            estimatedOrderValue: orderValue,
            availableBuyingPower: availableCash,
            warnings: allChecksPass ? [] : ['Order failed one or more risk checks']
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to validate order',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
router.post('/trading/orders/validate', validateOrderHandler);
exports.default = router;
