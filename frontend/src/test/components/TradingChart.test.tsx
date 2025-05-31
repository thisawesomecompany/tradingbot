import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TradingChart } from '../../components/TradingChart';
import { createMockApiResponse, mockApiError, renderWithProviders } from '../setup';

// Mock the chart data
const mockChartData = {
    symbol: 'AAPL',
    timeframe: '1D',
    source: 'mock',
    bars: [
        { time: 1640995200, open: 150, high: 152, low: 149, close: 151, volume: 1000000 },
        { time: 1641081600, open: 151, high: 153, low: 150, close: 152, volume: 1100000 },
        { time: 1641168000, open: 152, high: 154, low: 151, close: 153, volume: 1200000 },
    ]
};

const mockQuoteData = {
    symbol: 'AAPL',
    bid: 152.50,
    ask: 152.55,
    last: 152.52,
    change: 1.52,
    changePercent: 1.01,
    volume: 5000000,
    source: 'mock',
    lastUpdate: new Date().toISOString()
};

describe('TradingChart', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        // Reset fetch mock
        vi.mocked(fetch).mockClear();

        // Mock successful API responses by default
        vi.mocked(fetch)
            .mockResolvedValueOnce(createMockApiResponse(mockChartData) as any)
            .mockResolvedValueOnce(createMockApiResponse(mockQuoteData) as any);
    });

    describe('Basic Rendering', () => {
        it('should render without crashing', async () => {
            renderWithProviders(<TradingChart />);

            // Should show some basic elements
            expect(screen.getByText(/demo data mode/i)).toBeInTheDocument();
        });

        it('should show chart container', async () => {
            renderWithProviders(<TradingChart />);

            // Chart container should exist
            const chartElements = screen.getAllByText(/📊/);
            expect(chartElements.length).toBeGreaterThan(0);
        });

        it('should show symbol input', async () => {
            renderWithProviders(<TradingChart />);

            // Should have symbol input
            const symbolInput = screen.getByDisplayValue('SPY');
            expect(symbolInput).toBeInTheDocument();
        });

        it('should show timeframe controls', async () => {
            renderWithProviders(<TradingChart />);

            // Should have timeframe options
            expect(screen.getByText('5 minutes')).toBeInTheDocument();
            expect(screen.getByText('1 hour')).toBeInTheDocument();
        });
    });

    describe('Symbol Search', () => {
        it('should allow typing in symbol input', async () => {
            renderWithProviders(<TradingChart />);

            const symbolInput = screen.getByDisplayValue('SPY');

            // Clear and type new symbol
            await user.clear(symbolInput);
            await user.type(symbolInput, 'TSLA');

            expect(symbolInput).toHaveValue('TSLA');
        });
    });

    describe('Data Mode Display', () => {
        it('should show demo mode indicator', async () => {
            renderWithProviders(<TradingChart />);

            // Should show demo mode
            expect(screen.getByText(/demo data mode/i)).toBeInTheDocument();
        });
    });
}); 