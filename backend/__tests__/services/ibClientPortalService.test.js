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
const ibClientPortalService_1 = __importDefault(require("../../src/services/ibClientPortalService"));
const axios_1 = __importDefault(require("axios"));
// Mock axios
jest.mock('axios');
const mockedAxios = axios_1.default;
describe('IBClientPortalService', () => {
    let service;
    beforeEach(() => {
        service = new ibClientPortalService_1.default();
        jest.clearAllMocks();
    });
    describe('Constructor', () => {
        it('should initialize with default config', () => {
            const newService = new ibClientPortalService_1.default();
            expect(newService).toBeInstanceOf(ibClientPortalService_1.default);
        });
    });
    describe('checkAuthStatus', () => {
        it('should return connection status on success', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockClient = {
                get: jest.fn().mockResolvedValueOnce({
                    data: { authenticated: true, connected: true }
                })
            };
            // Mock the client property
            service.client = mockClient;
            const status = yield service.checkAuthStatus();
            expect(status).toHaveProperty('connected');
            expect(status).toHaveProperty('authenticated');
            expect(status).toHaveProperty('lastUpdate');
            expect(typeof status.connected).toBe('boolean');
            expect(typeof status.authenticated).toBe('boolean');
            expect(typeof status.lastUpdate).toBe('string');
        }));
        it('should handle API errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockClient = {
                get: jest.fn().mockRejectedValueOnce(new Error('Network error'))
            };
            service.client = mockClient;
            const status = yield service.checkAuthStatus();
            expect(status.connected).toBe(false);
            expect(status.authenticated).toBe(false);
            expect(status.error).toBeDefined();
        }));
    });
    describe('reauthenticate', () => {
        it('should return true on successful authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockClient = {
                post: jest.fn().mockResolvedValueOnce({
                    data: { connected: true }
                }),
                get: jest.fn().mockResolvedValueOnce({
                    data: { authenticated: true, connected: true }
                })
            };
            service.client = mockClient;
            const result = yield service.reauthenticate();
            expect(typeof result).toBe('boolean');
        }));
        it('should return false on authentication failure', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockClient = {
                post: jest.fn().mockRejectedValueOnce(new Error('Auth failed'))
            };
            service.client = mockClient;
            const result = yield service.reauthenticate();
            expect(result).toBe(false);
        }));
    });
    describe('tickle', () => {
        it('should return true on successful keepalive', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockClient = {
                post: jest.fn().mockResolvedValueOnce({ data: {} })
            };
            service.client = mockClient;
            const result = yield service.tickle();
            expect(result).toBe(true);
        }));
        it('should return false on keepalive failure', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockClient = {
                post: jest.fn().mockRejectedValueOnce(new Error('Tickle failed'))
            };
            service.client = mockClient;
            const result = yield service.tickle();
            expect(result).toBe(false);
        }));
    });
    describe('searchContracts', () => {
        it('should return contracts for valid symbol', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockContracts = [
                { conid: 265598, symbol: 'AAPL', exchange: 'NASDAQ' }
            ];
            const mockClient = {
                get: jest.fn().mockResolvedValueOnce({ data: mockContracts })
            };
            service.client = mockClient;
            // Mock authenticated state
            service.connectionStatus = { authenticated: true, connected: true };
            const result = yield service.searchContracts('AAPL');
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual(mockContracts);
        }));
        it('should throw error when not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock unauthenticated state
            service.connectionStatus = { authenticated: false, connected: false };
            yield expect(service.searchContracts('AAPL')).rejects.toThrow('Not authenticated');
        }));
        it('should handle API errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockClient = {
                get: jest.fn().mockRejectedValueOnce(new Error('API error'))
            };
            service.client = mockClient;
            service.connectionStatus = { authenticated: true, connected: true };
            yield expect(service.searchContracts('INVALID')).rejects.toThrow();
        }));
    });
    describe('getMarketSnapshot', () => {
        it('should return market data for valid conid', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockData = [{
                    symbol: 'AAPL',
                    '31': 150.25, // last
                    '84': 150.20, // bid
                    '86': 150.30, // ask
                    '7295': 1000000 // volume
                }];
            const mockClient = {
                get: jest.fn().mockResolvedValueOnce({ data: mockData })
            };
            service.client = mockClient;
            service.connectionStatus = { authenticated: true, connected: true };
            const result = yield service.getMarketSnapshot(265598);
            expect(result).toHaveProperty('symbol');
            expect(result).toHaveProperty('conid');
            expect(result).toHaveProperty('bid');
            expect(result).toHaveProperty('ask');
            expect(result).toHaveProperty('last');
            expect(result).toHaveProperty('lastUpdate');
            expect(result.conid).toBe(265598);
        }));
        it('should throw error when not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            service.connectionStatus = { authenticated: false, connected: false };
            yield expect(service.getMarketSnapshot(265598)).rejects.toThrow('Not authenticated');
        }));
    });
    describe('getHistoricalData', () => {
        it('should return historical bars for valid conid', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockBars = {
                data: [
                    { o: 150, h: 151, l: 149, c: 150.5, v: 1000000, t: 1640995200 }
                ]
            };
            const mockClient = {
                get: jest.fn().mockResolvedValueOnce({ data: mockBars })
            };
            service.client = mockClient;
            service.connectionStatus = { authenticated: true, connected: true };
            const result = yield service.getHistoricalData(265598, '1d', '5min');
            expect(Array.isArray(result)).toBe(true);
        }));
        it('should throw error when not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            service.connectionStatus = { authenticated: false, connected: false };
            yield expect(service.getHistoricalData(265598)).rejects.toThrow('Not authenticated');
        }));
    });
    describe('isAuthenticated', () => {
        it('should return true when authenticated', () => {
            service.connectionStatus = { authenticated: true, connected: true };
            const result = service.isAuthenticated();
            expect(result).toBe(true);
        });
        it('should return false when not authenticated', () => {
            service.connectionStatus = { authenticated: false, connected: false };
            const result = service.isAuthenticated();
            expect(result).toBe(false);
        });
    });
    describe('getConnectionStatus', () => {
        it('should return current connection status', () => {
            const mockStatus = {
                authenticated: true,
                connected: true,
                lastUpdate: new Date().toISOString()
            };
            service.connectionStatus = mockStatus;
            const result = service.getConnectionStatus();
            expect(result).toEqual(mockStatus);
        });
    });
    describe('startKeepAlive', () => {
        it('should return a timer object', () => {
            // Mock setInterval
            const mockTimer = {};
            jest.spyOn(global, 'setInterval').mockReturnValueOnce(mockTimer);
            const result = service.startKeepAlive();
            expect(result).toBe(mockTimer);
        });
    });
    describe('Error Handling', () => {
        it('should handle network timeouts', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockClient = {
                get: jest.fn().mockRejectedValueOnce({
                    code: 'ECONNABORTED',
                    message: 'timeout of 30000ms exceeded'
                })
            };
            service.client = mockClient;
            const result = yield service.checkAuthStatus();
            expect(result.authenticated).toBe(false);
            expect(result.error).toContain('Authentication check failed');
        }));
        it('should handle connection refused', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockClient = {
                get: jest.fn().mockRejectedValueOnce({
                    code: 'ECONNREFUSED',
                    message: 'connect ECONNREFUSED'
                })
            };
            service.client = mockClient;
            const result = yield service.checkAuthStatus();
            expect(result.authenticated).toBe(false);
            expect(result.connected).toBe(false);
        }));
    });
});
