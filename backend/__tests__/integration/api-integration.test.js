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
const index_1 = __importDefault(require("../../src/index"));
describe('API Integration Tests', () => {
    describe('GET /api/trading/status', () => {
        it('should return correct data structure matching frontend expectations', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default)
                .get('/api/trading/status')
                .expect(200);
            const data = response.body;
            // Verify the structure matches frontend interface
            expect(data).toHaveProperty('status');
            expect(data).toHaveProperty('account');
            expect(data).toHaveProperty('market');
            expect(data).toHaveProperty('connection');
            expect(data).toHaveProperty('trading');
            // Verify connection structure
            expect(data.connection).toHaveProperty('ib');
            expect(data.connection).toHaveProperty('lastUpdate');
            // Verify trading structure
            expect(data.trading).toHaveProperty('enabled');
            expect(data.trading).toHaveProperty('strategy');
            expect(data.trading).toHaveProperty('riskLevel');
            expect(data.trading).toHaveProperty('accountValue');
            expect(data.trading).toHaveProperty('dayPnL');
            expect(data.trading).toHaveProperty('buyingPower');
            expect(data.trading).toHaveProperty('openOrders');
            // Verify data types
            expect(typeof data.status).toBe('string');
            expect(typeof data.account).toBe('string');
            expect(typeof data.market).toBe('string');
            expect(typeof data.connection.ib).toBe('string');
            expect(typeof data.trading.enabled).toBe('boolean');
            expect(typeof data.trading.accountValue).toBe('number');
        }));
        it('should return valid connection status values', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default)
                .get('/api/trading/status')
                .expect(200);
            const data = response.body;
            expect(['connected', 'disconnected']).toContain(data.connection.ib);
        }));
        it('should return valid market status values', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default)
                .get('/api/trading/status')
                .expect(200);
            const data = response.body;
            expect(['open', 'closed', 'pre-market', 'after-hours']).toContain(data.market);
        }));
    });
    describe('GET /api/health', () => {
        it('should return health status', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default)
                .get('/api/health')
                .expect(200);
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('service');
        }));
    });
    describe('GET /api/market/quote/:symbol', () => {
        it('should return quote for valid symbol', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default)
                .get('/api/market/quote/AAPL')
                .expect(200);
            expect(response.body).toHaveProperty('symbol', 'AAPL');
            expect(response.body).toHaveProperty('bid');
            expect(response.body).toHaveProperty('ask');
            expect(response.body).toHaveProperty('last');
            expect(response.body).toHaveProperty('volume');
            expect(response.body).toHaveProperty('lastUpdate');
            expect(response.body).toHaveProperty('source');
            expect(typeof response.body.bid).toBe('number');
            expect(typeof response.body.ask).toBe('number');
            expect(typeof response.body.last).toBe('number');
            expect(typeof response.body.volume).toBe('number');
        }));
    });
    describe('GET /api/market/history/:symbol', () => {
        it('should return historical data for valid symbol', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default)
                .get('/api/market/history/SPY')
                .expect(200);
            expect(response.body).toHaveProperty('symbol', 'SPY');
            expect(response.body).toHaveProperty('bars');
            expect(response.body).toHaveProperty('timeframe');
            expect(response.body).toHaveProperty('source');
            expect(Array.isArray(response.body.bars)).toBe(true);
            expect(response.body.bars.length).toBeGreaterThan(0);
            // Verify bar structure
            const bar = response.body.bars[0];
            expect(bar).toHaveProperty('time');
            expect(bar).toHaveProperty('open');
            expect(bar).toHaveProperty('high');
            expect(bar).toHaveProperty('low');
            expect(bar).toHaveProperty('close');
            expect(bar).toHaveProperty('volume');
            expect(typeof bar.time).toBe('number');
            expect(typeof bar.open).toBe('number');
            expect(typeof bar.high).toBe('number');
            expect(typeof bar.low).toBe('number');
            expect(typeof bar.close).toBe('number');
            expect(typeof bar.volume).toBe('number');
        }));
    });
    describe('GET /api/trading/positions', () => {
        it('should return correct PositionsData structure matching frontend expectations', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default)
                .get('/api/trading/positions')
                .expect(200);
            const data = response.body;
            // Verify the structure matches frontend PositionsData interface
            expect(data).toHaveProperty('positions');
            expect(data).toHaveProperty('totalValue');
            expect(data).toHaveProperty('cash');
            expect(data).toHaveProperty('dayPnL');
            expect(data).toHaveProperty('totalPnL');
            expect(data).toHaveProperty('lastUpdate');
            // Verify data types
            expect(Array.isArray(data.positions)).toBe(true);
            expect(typeof data.totalValue).toBe('number');
            expect(typeof data.cash).toBe('number');
            expect(typeof data.dayPnL).toBe('number');
            expect(typeof data.totalPnL).toBe('number');
            expect(typeof data.lastUpdate).toBe('string');
            // Verify numbers are not null/undefined (the exact issue we had)
            expect(data.totalValue).not.toBeNull();
            expect(data.totalValue).not.toBeUndefined();
            expect(data.cash).not.toBeNull();
            expect(data.cash).not.toBeUndefined();
            expect(data.dayPnL).not.toBeNull();
            expect(data.dayPnL).not.toBeUndefined();
            expect(data.totalPnL).not.toBeNull();
            expect(data.totalPnL).not.toBeUndefined();
            // Verify we can call toLocaleString on numeric values (the actual failing operation)
            expect(() => data.totalValue.toLocaleString()).not.toThrow();
            expect(() => data.cash.toLocaleString()).not.toThrow();
            expect(() => data.dayPnL.toFixed(2)).not.toThrow();
            expect(() => data.totalPnL.toFixed(2)).not.toThrow();
        }));
        it('should return positions array with correct structure', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default)
                .get('/api/trading/positions')
                .expect(200);
            const { positions } = response.body;
            if (positions.length > 0) {
                const position = positions[0];
                expect(position).toHaveProperty('symbol');
                expect(position).toHaveProperty('quantity');
                expect(position).toHaveProperty('avgPrice');
                expect(position).toHaveProperty('marketValue');
                expect(position).toHaveProperty('unrealizedPnL');
                expect(position).toHaveProperty('realizedPnL');
            }
        }));
    });
    describe('Error handling', () => {
        it('should handle 404 for non-existent endpoints', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(index_1.default)
                .get('/api/non-existent')
                .expect(404);
        }));
    });
});
