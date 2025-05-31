"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const api_1 = __importDefault(require("../../src/routes/api"));
// Create test app
const createTestApp = () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use('/api', api_1.default);
    return app;
};
describe('API Routes', () => {
    let app;
    beforeEach(() => {
        app = createTestApp();
    });
    describe('GET /api/health', () => {
        it('should return health status', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/health')
                .expect(200);
            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('ok');
        }));
        it('should return JSON content type', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .get('/api/health')
                .expect('Content-Type', /json/)
                .expect(200);
        }));
    });
    describe('GET /api/ib/status', () => {
        it('should return IB connection status', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/ib/status')
                .expect(200);
            expect(response.body).toMatchObject({
                connected: false
            });
        }));
        it('should handle IB service errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // This test would require mocking ibService to throw an error
            const response = yield (0, supertest_1.default)(app)
                .get('/api/ib/status')
                .expect(200); // Should still return 200 with mock data
            expect(response.body).toBeDefined();
        }));
    });
    describe('GET /api/ib/portal/status', () => {
        it('should return Client Portal status', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/ib/portal/status')
                .expect(200);
            expect(response.body).toMatchObject({
                connected: false,
                authenticated: false,
                note: 'Client Portal integration pending'
            });
            expect(response.body.lastUpdate).toBeDefined();
        }));
    });
    describe('GET /api/trading/status', () => {
        it('should return trading status', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/trading/status')
                .expect(200);
            // Updated to match current API structure
            expect(response.body).toMatchObject({
                status: 'ok',
                account: expect.any(String),
                market: expect.any(String),
                connection: {
                    ib: expect.any(String),
                    lastUpdate: expect.any(String)
                },
                trading: {
                    enabled: expect.any(Boolean),
                    strategy: expect.any(String),
                    riskLevel: expect.any(String),
                    accountValue: expect.any(Number),
                    dayPnL: expect.any(Number),
                    buyingPower: expect.any(Number),
                    openOrders: expect.any(Number)
                }
            });
        }));
        it('should handle trading service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Test error handling
            const response = yield (0, supertest_1.default)(app)
                .get('/api/trading/status')
                .expect(200);
            expect(response.body).toBeDefined();
        }));
    });
    describe('GET /api/market/quote/:symbol', () => {
        it('should return mock quote for valid symbol', () => __awaiter(void 0, void 0, void 0, function* () {
            const symbol = 'AAPL';
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/market/quote/${symbol}`)
                .expect(200);
            expect(response.body).toMatchObject({
                symbol: symbol.toUpperCase(),
                source: 'mock'
            });
            // Validate quote structure
            expect(response.body.bid).toBeGreaterThan(0);
            expect(response.body.ask).toBeGreaterThan(0);
            expect(response.body.last).toBeGreaterThan(0);
            expect(response.body.volume).toBeGreaterThanOrEqual(0);
            expect(response.body.lastUpdate).toBeDefined();
        }));
        it('should handle lowercase symbols', () => __awaiter(void 0, void 0, void 0, function* () {
            const symbol = 'tsla';
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/market/quote/${symbol}`)
                .expect(200);
            expect(response.body.symbol).toBe(symbol.toUpperCase());
        }));
        it('should handle special characters in symbols', () => __awaiter(void 0, void 0, void 0, function* () {
            const symbol = 'BRK.A';
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/market/quote/${symbol}`)
                .expect(200);
            expect(response.body.symbol).toBe(symbol.toUpperCase());
        }));
        it('should validate quote data types', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/market/quote/MSFT')
                .expect(200);
            expect(typeof response.body.bid).toBe('number');
            expect(typeof response.body.ask).toBe('number');
            expect(typeof response.body.last).toBe('number');
            expect(typeof response.body.change).toBe('number');
            expect(typeof response.body.changePercent).toBe('number');
            expect(typeof response.body.volume).toBe('number');
            expect(typeof response.body.symbol).toBe('string');
            expect(typeof response.body.source).toBe('string');
            expect(typeof response.body.lastUpdate).toBe('string');
        }));
    });
    describe('GET /api/market/history/:symbol', () => {
        it('should return historical data for valid symbol', () => __awaiter(void 0, void 0, void 0, function* () {
            const symbol = 'SPY';
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/market/history/${symbol}`)
                .expect(200);
            expect(response.body).toMatchObject({
                symbol: symbol.toUpperCase(),
                timeframe: '1D',
                source: 'mock'
            });
            // Validate bars array
            expect(Array.isArray(response.body.bars)).toBe(true);
            expect(response.body.bars.length).toBe(100);
            // Validate first bar structure
            const firstBar = response.body.bars[0];
            expect(firstBar).toHaveProperty('time');
            expect(firstBar).toHaveProperty('open');
            expect(firstBar).toHaveProperty('high');
            expect(firstBar).toHaveProperty('low');
            expect(firstBar).toHaveProperty('close');
            expect(firstBar).toHaveProperty('volume');
            // Validate data types
            expect(typeof firstBar.time).toBe('number');
            expect(typeof firstBar.open).toBe('number');
            expect(typeof firstBar.high).toBe('number');
            expect(typeof firstBar.low).toBe('number');
            expect(typeof firstBar.close).toBe('number');
            expect(typeof firstBar.volume).toBe('number');
        }));
        it('should validate OHLC relationships', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/market/history/QQQ')
                .expect(200);
            response.body.bars.forEach((bar) => {
                expect(bar.high).toBeGreaterThanOrEqual(bar.open);
                expect(bar.high).toBeGreaterThanOrEqual(bar.close);
                expect(bar.low).toBeLessThanOrEqual(bar.open);
                expect(bar.low).toBeLessThanOrEqual(bar.close);
                expect(bar.volume).toBeGreaterThanOrEqual(0);
            });
        }));
        it('should return chronological data', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/market/history/VTI')
                .expect(200);
            const bars = response.body.bars;
            for (let i = 1; i < bars.length; i++) {
                expect(bars[i].time).toBeGreaterThan(bars[i - 1].time);
            }
        }));
    });
    describe('GET /api/trading/positions', () => {
        it('should return positions array', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/trading/positions')
                .expect(200);
            // Updated to match current API structure - returns PositionsData object
            expect(response.body).toHaveProperty('positions');
            expect(response.body).toHaveProperty('totalValue');
            expect(response.body).toHaveProperty('cash');
            expect(response.body).toHaveProperty('dayPnL');
            expect(response.body).toHaveProperty('totalPnL');
            expect(Array.isArray(response.body.positions)).toBe(true);
            if (response.body.positions.length > 0) {
                const position = response.body.positions[0];
                expect(position).toHaveProperty('symbol');
                expect(position).toHaveProperty('quantity');
                expect(position).toHaveProperty('avgPrice');
            }
        }));
    });
    // Trading Order Management Tests
    describe('Trading Order Management', () => {
        describe('POST /api/trading/orders - Order Placement', () => {
            it('should place a valid market order', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderData = {
                    symbol: 'AAPL',
                    side: 'BUY',
                    quantity: 100,
                    orderType: 'MKT'
                };
                const response = yield (0, supertest_1.default)(app)
                    .post('/api/trading/orders')
                    .send(orderData)
                    .expect(201);
                expect(response.body).toMatchObject({
                    success: true,
                    message: 'Order placed successfully'
                });
                expect(response.body.order).toMatchObject({
                    symbol: 'AAPL',
                    side: 'BUY',
                    quantity: 100,
                    orderType: 'MKT',
                    status: 'PENDING',
                    timeInForce: 'DAY'
                });
                expect(response.body.order.orderId).toBeDefined();
                expect(response.body.order.submittedAt).toBeDefined();
            }));
            it('should place a valid limit order', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderData = {
                    symbol: 'TSLA',
                    side: 'SELL',
                    quantity: 50,
                    orderType: 'LMT',
                    price: 200.50
                };
                const response = yield (0, supertest_1.default)(app)
                    .post('/api/trading/orders')
                    .send(orderData)
                    .expect(201);
                expect(response.body.order).toMatchObject({
                    symbol: 'TSLA',
                    side: 'SELL',
                    quantity: 50,
                    orderType: 'LMT',
                    price: 200.50
                });
            }));
            it('should reject order with missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderData = {
                    symbol: 'AAPL',
                    side: 'BUY'
                    // Missing quantity and orderType
                };
                const response = yield (0, supertest_1.default)(app)
                    .post('/api/trading/orders')
                    .send(orderData)
                    .expect(400);
                expect(response.body).toMatchObject({
                    error: 'Missing required fields',
                    required: ['symbol', 'side', 'quantity', 'orderType']
                });
            }));
            it('should reject order with invalid side', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderData = {
                    symbol: 'AAPL',
                    side: 'INVALID',
                    quantity: 100,
                    orderType: 'MKT'
                };
                const response = yield (0, supertest_1.default)(app)
                    .post('/api/trading/orders')
                    .send(orderData)
                    .expect(400);
                expect(response.body).toMatchObject({
                    error: 'Invalid side',
                    message: 'Side must be BUY or SELL'
                });
            }));
            it('should reject order with invalid order type', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderData = {
                    symbol: 'AAPL',
                    side: 'BUY',
                    quantity: 100,
                    orderType: 'INVALID'
                };
                const response = yield (0, supertest_1.default)(app)
                    .post('/api/trading/orders')
                    .send(orderData)
                    .expect(400);
                expect(response.body).toMatchObject({
                    error: 'Invalid order type',
                    message: 'Order type must be MKT, LMT, STP, or STP_LMT'
                });
            }));
            it('should reject limit order without price', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderData = {
                    symbol: 'AAPL',
                    side: 'BUY',
                    quantity: 100,
                    orderType: 'LMT'
                    // Missing price for limit order
                };
                const response = yield (0, supertest_1.default)(app)
                    .post('/api/trading/orders')
                    .send(orderData)
                    .expect(400);
                expect(response.body).toMatchObject({
                    error: 'Price required for limit orders'
                });
            }));
        });
        describe('GET /api/trading/orders - Order Retrieval', () => {
            it('should return all orders', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app)
                    .get('/api/trading/orders')
                    .expect(200);
                expect(response.body).toHaveProperty('orders');
                expect(response.body).toHaveProperty('total');
                expect(response.body).toHaveProperty('lastUpdate');
                expect(Array.isArray(response.body.orders)).toBe(true);
                if (response.body.orders.length > 0) {
                    const order = response.body.orders[0];
                    expect(order).toHaveProperty('orderId');
                    expect(order).toHaveProperty('symbol');
                    expect(order).toHaveProperty('side');
                    expect(order).toHaveProperty('quantity');
                    expect(order).toHaveProperty('status');
                }
            }));
            it('should filter orders by status', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app)
                    .get('/api/trading/orders?status=FILLED')
                    .expect(200);
                expect(response.body.orders.every((order) => order.status.toLowerCase() === 'filled')).toBe(true);
            }));
            it('should filter orders by symbol', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app)
                    .get('/api/trading/orders?symbol=SPY')
                    .expect(200);
                expect(response.body.orders.every((order) => order.symbol.toLowerCase() === 'spy')).toBe(true);
            }));
            it('should filter orders by both status and symbol', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app)
                    .get('/api/trading/orders?status=PENDING&symbol=QQQ')
                    .expect(200);
                expect(response.body.orders.every((order) => order.status.toLowerCase() === 'pending' &&
                    order.symbol.toLowerCase() === 'qqq')).toBe(true);
            }));
        });
        describe('GET /api/trading/orders/:orderId - Specific Order', () => {
            it('should return specific order details', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderId = '123456';
                const response = yield (0, supertest_1.default)(app)
                    .get(`/api/trading/orders/${orderId}`)
                    .expect(200);
                expect(response.body).toMatchObject({
                    orderId,
                    symbol: expect.any(String),
                    side: expect.any(String),
                    quantity: expect.any(Number),
                    status: expect.any(String)
                });
                expect(response.body).toHaveProperty('executions');
                expect(Array.isArray(response.body.executions)).toBe(true);
            }));
            it('should return order with execution details', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderId = 'test123';
                const response = yield (0, supertest_1.default)(app)
                    .get(`/api/trading/orders/${orderId}`)
                    .expect(200);
                if (response.body.executions.length > 0) {
                    const execution = response.body.executions[0];
                    expect(execution).toHaveProperty('executionId');
                    expect(execution).toHaveProperty('quantity');
                    expect(execution).toHaveProperty('price');
                    expect(execution).toHaveProperty('timestamp');
                }
            }));
        });
        describe('DELETE /api/trading/orders/:orderId - Order Cancellation', () => {
            it('should cancel a valid order', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderId = '123457';
                const response = yield (0, supertest_1.default)(app)
                    .delete(`/api/trading/orders/${orderId}`)
                    .expect(200);
                expect(response.body).toMatchObject({
                    success: true,
                    orderId,
                    status: 'CANCELLED',
                    message: 'Order cancelled successfully'
                });
                expect(response.body.cancelledAt).toBeDefined();
            }));
            it('should handle cancellation of non-existent order', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderId = 'invalid';
                const response = yield (0, supertest_1.default)(app)
                    .delete(`/api/trading/orders/${orderId}`)
                    .expect(404);
                expect(response.body).toMatchObject({
                    error: 'Order not found',
                    orderId
                });
            }));
            it('should reject cancellation of filled order', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderId = 'filled';
                const response = yield (0, supertest_1.default)(app)
                    .delete(`/api/trading/orders/${orderId}`)
                    .expect(400);
                expect(response.body).toMatchObject({
                    error: 'Cannot cancel filled order',
                    orderId
                });
            }));
        });
        describe('PUT /api/trading/orders/:orderId - Order Modification', () => {
            it('should modify order quantity', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderId = '123457';
                const modificationData = { quantity: 75 };
                const response = yield (0, supertest_1.default)(app)
                    .put(`/api/trading/orders/${orderId}`)
                    .send(modificationData)
                    .expect(200);
                expect(response.body).toMatchObject({
                    success: true,
                    message: 'Order modified successfully'
                });
                expect(response.body.order.quantity).toBe(75);
                expect(response.body.order.modifiedAt).toBeDefined();
            }));
            it('should modify order price', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderId = '123457';
                const modificationData = { price: 155.75 };
                const response = yield (0, supertest_1.default)(app)
                    .put(`/api/trading/orders/${orderId}`)
                    .send(modificationData)
                    .expect(200);
                expect(response.body.order.price).toBe(155.75);
            }));
            it('should modify both quantity and price', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderId = '123457';
                const modificationData = { quantity: 200, price: 149.25 };
                const response = yield (0, supertest_1.default)(app)
                    .put(`/api/trading/orders/${orderId}`)
                    .send(modificationData)
                    .expect(200);
                expect(response.body.order.quantity).toBe(200);
                expect(response.body.order.price).toBe(149.25);
            }));
            it('should reject modification without any fields', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderId = '123457';
                const modificationData = {};
                const response = yield (0, supertest_1.default)(app)
                    .put(`/api/trading/orders/${orderId}`)
                    .send(modificationData)
                    .expect(400);
                expect(response.body).toMatchObject({
                    error: 'At least one field (quantity or price) must be provided for modification'
                });
            }));
            it('should handle modification of non-existent order', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderId = 'invalid';
                const modificationData = { quantity: 50 };
                const response = yield (0, supertest_1.default)(app)
                    .put(`/api/trading/orders/${orderId}`)
                    .send(modificationData)
                    .expect(404);
                expect(response.body).toMatchObject({
                    error: 'Order not found',
                    orderId
                });
            }));
            it('should reject modification of filled order', () => __awaiter(void 0, void 0, void 0, function* () {
                const orderId = 'filled';
                const modificationData = { quantity: 50 };
                const response = yield (0, supertest_1.default)(app)
                    .put(`/api/trading/orders/${orderId}`)
                    .send(modificationData)
                    .expect(400);
                expect(response.body).toMatchObject({
                    error: 'Cannot modify filled order',
                    orderId
                });
            }));
        });
    });
    // Account Information Tests
    describe('GET /api/trading/account - Account Information', () => {
        it('should return complete account information', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/trading/account')
                .expect(200);
            expect(response.body).toMatchObject({
                accountId: expect.any(String),
                accountType: expect.any(String),
                accountValue: expect.any(Number),
                cash: expect.any(Number),
                dayTradingBuyingPower: expect.any(Number),
                equity: expect.any(Number),
                grossPositionValue: expect.any(Number),
                maintenanceMargin: expect.any(Number),
                netLiquidation: expect.any(Number),
                totalCashValue: expect.any(Number),
                unrealizedPnL: expect.any(Number),
                realizedPnL: expect.any(Number),
                dayPnL: expect.any(Number),
                currency: expect.any(String),
                lastUpdate: expect.any(String)
            });
        }));
        it('should validate account data types', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/trading/account')
                .expect(200);
            const account = response.body;
            expect(typeof account.accountId).toBe('string');
            expect(typeof account.accountType).toBe('string');
            expect(typeof account.accountValue).toBe('number');
            expect(typeof account.cash).toBe('number');
            expect(typeof account.currency).toBe('string');
            expect(account.accountValue).toBeGreaterThan(0);
            expect(account.cash).toBeGreaterThanOrEqual(0);
        }));
    });
    // Risk Management Tests
    describe('POST /api/trading/orders/validate - Order Validation', () => {
        it('should validate a valid order', () => __awaiter(void 0, void 0, void 0, function* () {
            const orderData = {
                symbol: 'AAPL',
                side: 'BUY',
                quantity: 100,
                orderType: 'LMT',
                price: 150.00
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/trading/orders/validate')
                .send(orderData)
                .expect(200);
            expect(response.body).toMatchObject({
                valid: expect.any(Boolean),
                checks: expect.any(Object),
                estimatedOrderValue: expect.any(Number),
                availableBuyingPower: expect.any(Number),
                warnings: expect.any(Array)
            });
            expect(response.body.checks).toHaveProperty('sufficientBuyingPower');
            expect(response.body.checks).toHaveProperty('positionSizeLimit');
            expect(response.body.checks).toHaveProperty('priceReasonable');
            expect(response.body.checks).toHaveProperty('symbolValid');
            expect(response.body.checks).toHaveProperty('dayTradingLimit');
        }));
        it('should pass validation for sell order', () => __awaiter(void 0, void 0, void 0, function* () {
            const orderData = {
                symbol: 'SPY',
                side: 'SELL',
                quantity: 100,
                orderType: 'MKT'
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/trading/orders/validate')
                .send(orderData)
                .expect(200);
            expect(response.body.checks.sufficientBuyingPower).toBe(true);
        }));
        it('should fail validation for oversized order', () => __awaiter(void 0, void 0, void 0, function* () {
            const orderData = {
                symbol: 'AAPL',
                side: 'BUY',
                quantity: 2000, // Exceeds limit of 1000
                orderType: 'MKT'
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/trading/orders/validate')
                .send(orderData)
                .expect(200);
            expect(response.body.checks.positionSizeLimit).toBe(false);
            expect(response.body.valid).toBe(false);
            expect(response.body.warnings.length).toBeGreaterThan(0);
        }));
        it('should fail validation for unreasonable price', () => __awaiter(void 0, void 0, void 0, function* () {
            const orderData = {
                symbol: 'AAPL',
                side: 'BUY',
                quantity: 100,
                orderType: 'LMT',
                price: 50000 // Unreasonably high price
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/trading/orders/validate')
                .send(orderData)
                .expect(200);
            expect(response.body.checks.priceReasonable).toBe(false);
        }));
        it('should fail validation for invalid symbol', () => __awaiter(void 0, void 0, void 0, function* () {
            const orderData = {
                symbol: 'INVALID123!',
                side: 'BUY',
                quantity: 100,
                orderType: 'MKT'
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/trading/orders/validate')
                .send(orderData)
                .expect(200);
            expect(response.body.checks.symbolValid).toBe(false);
        }));
        it('should reject validation with missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const orderData = {
                symbol: 'AAPL',
                side: 'BUY'
                // Missing quantity and orderType
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/trading/orders/validate')
                .send(orderData)
                .expect(400);
            expect(response.body).toMatchObject({
                error: 'Missing required fields for validation',
                required: ['symbol', 'side', 'quantity', 'orderType']
            });
        }));
        it('should calculate order value correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const orderData = {
                symbol: 'AAPL',
                side: 'BUY',
                quantity: 100,
                orderType: 'LMT',
                price: 175.50
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/trading/orders/validate')
                .send(orderData)
                .expect(200);
            expect(response.body.estimatedOrderValue).toBe(17550); // 100 * 175.50
        }));
    });
    describe('Error Handling', () => {
        it('should handle invalid routes', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .get('/api/nonexistent')
                .expect(404);
        }));
        it('should handle malformed requests', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .post('/api/health')
                .expect(404); // GET only endpoint
        }));
    });
    describe('CORS Headers', () => {
        it('should include CORS headers', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/health')
                .expect(200);
            expect(response.headers['access-control-allow-origin']).toBeDefined();
        }));
        it('should handle preflight requests', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .options('/api/health')
                .expect(204);
        }));
    });
    describe('Response Time', () => {
        it('should respond within reasonable time', () => __awaiter(void 0, void 0, void 0, function* () {
            const startTime = Date.now();
            yield (0, supertest_1.default)(app)
                .get('/api/health')
                .expect(200);
            const responseTime = Date.now() - startTime;
            expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
        }));
    });
});
