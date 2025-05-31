// Global test setup and mocks
import { jest } from '@jest/globals';

// Mock external dependencies
jest.mock('../src/services/ibService', () => ({
    ibService: {
        isConnected: jest.fn(() => false),
        getConnectionStatus: jest.fn(() => ({
            connected: false,
            connecting: false,
            error: null,
            lastUpdate: new Date().toISOString()
        })),
        connect: jest.fn(),
        disconnect: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn()
    }
}));

// Mock console methods in tests (optional)
const originalConsole = { ...console };

beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
});

afterEach(() => {
    // Restore console if needed
    Object.assign(console, originalConsole);
});

// Global test utilities
export const createMockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

export const createMockRequest = (overrides = {}) => {
    return {
        params: {},
        query: {},
        body: {},
        headers: {},
        ...overrides
    };
}; 