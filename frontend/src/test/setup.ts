import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { DataModeProvider } from '../contexts/DataModeContext';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
    takeRecords: vi.fn().mockReturnValue([]),
})) as any;

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
})) as any;

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
});

// Mock WebSocket for trading data
const MockWebSocket = vi.fn().mockImplementation(() => ({
    send: vi.fn(),
    close: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 0, // CONNECTING
}));

// Add static properties to match WebSocket constructor
Object.assign(MockWebSocket, {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
});

global.WebSocket = MockWebSocket as any;

// Mock crypto.randomUUID for ID generation
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: vi.fn(() => 'test-uuid-1234'),
    },
});

// Mock console methods to reduce noise in tests
const consoleMock = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
};

// Replace console in tests but preserve original for debugging
const originalConsole = { ...console };
beforeEach(() => {
    Object.assign(console, consoleMock);
});

afterEach(() => {
    vi.clearAllMocks();
    Object.assign(console, originalConsole);
});

// Global test utilities
export const createMockApiResponse = <T>(data: T) => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    headers: new Headers(),
});

export const mockApiError = (status = 500, message = 'Internal Server Error') => ({
    ok: false,
    status,
    statusText: message,
    json: vi.fn().mockRejectedValue(new Error(message)),
    text: vi.fn().mockRejectedValue(new Error(message)),
    headers: new Headers(),
});

// Test wrapper with providers
interface AllTheProvidersProps {
    children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
    return React.createElement(DataModeProvider, null, children);
};

// Custom render function with providers
export const renderWithProviders = (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => {
    return render(ui, { wrapper: AllTheProviders, ...options });
};

// Mock chart library for lightweight-charts
vi.mock('lightweight-charts', () => ({
    createChart: vi.fn(() => ({
        addSeries: vi.fn(() => ({
            setData: vi.fn(),
            update: vi.fn(),
        })),
        addCandlestickSeries: vi.fn(() => ({
            setData: vi.fn(),
            update: vi.fn(),
        })),
        addVolumeSeries: vi.fn(() => ({
            setData: vi.fn(),
            update: vi.fn(),
        })),
        addLineSeries: vi.fn(() => ({
            setData: vi.fn(),
            update: vi.fn(),
        })),
        timeScale: vi.fn(() => ({
            fitContent: vi.fn(),
            setVisibleRange: vi.fn(),
        })),
        priceScale: vi.fn(() => ({
            applyOptions: vi.fn(),
        })),
        applyOptions: vi.fn(),
        resize: vi.fn(),
        remove: vi.fn(),
        subscribeCrosshairMove: vi.fn(),
        unsubscribeCrosshairMove: vi.fn(),
    })),
    ColorType: {
        Solid: 'Solid',
        VerticalGradient: 'VerticalGradient',
    },
    LineStyle: {
        Solid: 0,
        Dotted: 1,
        Dashed: 2,
    },
    CandlestickSeries: 'Candlestick',
    LineSeries: 'Line',
    HistogramSeries: 'Histogram',
}));

// Extend global types for TypeScript
declare global {
    interface Window {
        ResizeObserver: any;
        IntersectionObserver: any;
    }
}

// Export for external use
export { vi }; 