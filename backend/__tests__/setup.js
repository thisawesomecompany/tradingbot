"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockRequest = exports.createMockResponse = void 0;
// Global test setup and mocks
const globals_1 = require("@jest/globals");
// Mock external dependencies
globals_1.jest.mock('../src/services/ibService', () => ({
    ibService: {
        isConnected: globals_1.jest.fn(() => false),
        getConnectionStatus: globals_1.jest.fn(() => ({
            connected: false,
            connecting: false,
            error: null,
            lastUpdate: new Date().toISOString()
        })),
        connect: globals_1.jest.fn(),
        disconnect: globals_1.jest.fn(),
        subscribe: globals_1.jest.fn(),
        unsubscribe: globals_1.jest.fn()
    }
}));
// Mock console methods in tests (optional)
const originalConsole = Object.assign({}, console);
beforeEach(() => {
    // Reset all mocks before each test
    globals_1.jest.clearAllMocks();
});
afterEach(() => {
    // Restore console if needed
    Object.assign(console, originalConsole);
});
// Global test utilities
const createMockResponse = () => {
    const res = {};
    res.status = globals_1.jest.fn().mockReturnValue(res);
    res.json = globals_1.jest.fn().mockReturnValue(res);
    res.send = globals_1.jest.fn().mockReturnValue(res);
    return res;
};
exports.createMockResponse = createMockResponse;
const createMockRequest = (overrides = {}) => {
    return Object.assign({ params: {}, query: {}, body: {}, headers: {} }, overrides);
};
exports.createMockRequest = createMockRequest;
