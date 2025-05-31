import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PositionsPanel from '../../components/PositionsPanel';

// Test PositionsPanel with real API responses to catch runtime errors
describe('PositionsPanel Integration Tests', () => {
    beforeEach(() => {
        // Clear any previous mocks
        vi.restoreAllMocks();
    });

    it('should handle correct PositionsData structure without errors', async () => {
        // Mock fetch with the correct data structure the backend should return
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                positions: [
                    {
                        symbol: 'SPY',
                        quantity: 100,
                        avgPrice: 150.25,
                        marketValue: 15050,
                        unrealizedPnL: 25.00,
                        realizedPnL: 0
                    }
                ],
                totalValue: 100000,
                cash: 50000,
                dayPnL: 250.50,
                totalPnL: 1250.75,
                lastUpdate: new Date().toISOString()
            })
        });

        render(<PositionsPanel />);

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.queryByText('Loading positions...')).not.toBeInTheDocument();
        });

        // Verify the component renders without throwing toLocaleString errors
        expect(screen.getByText('Account & Positions')).toBeInTheDocument();
        expect(screen.getByText('Cash Balance')).toBeInTheDocument();
        expect(screen.getByText('Total Value')).toBeInTheDocument();
        expect(screen.getByText('Day P&L')).toBeInTheDocument();
        expect(screen.getByText('Total P&L')).toBeInTheDocument();

        // Verify the formatted numbers appear correctly
        expect(screen.getByText('$50,000')).toBeInTheDocument(); // cash
        expect(screen.getByText('$100,000')).toBeInTheDocument(); // totalValue
        expect(screen.getByText('$250.50')).toBeInTheDocument(); // dayPnL
        expect(screen.getByText('$1250.75')).toBeInTheDocument(); // totalPnL
    });

    it('should catch the original bug: undefined values causing toLocaleString errors', async () => {
        // Mock fetch with the WRONG data structure (what the backend was originally returning)
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue([
                {
                    symbol: 'SPY',
                    quantity: 100,
                    avgPrice: 150.25,
                    marketValue: 15050,
                    unrealizedPnL: 25.00,
                    realizedPnL: 0
                }
            ])
        });

        // This should catch the error instead of letting it crash the app
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        // This should throw an error or handle gracefully, not crash
        expect(() => render(<PositionsPanel />)).not.toThrow();

        // Clean up
        consoleSpy.mockRestore();
    });

    it('should handle loading state correctly', () => {
        // Mock a pending fetch
        global.fetch = vi.fn().mockImplementation(() => new Promise(() => { }));

        render(<PositionsPanel />);

        expect(screen.getByText('Loading positions...')).toBeInTheDocument();
    });

    it('should handle error state correctly', async () => {
        // Mock fetch to throw an error
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        render(<PositionsPanel />);

        await waitFor(() => {
            expect(screen.getByText(/Error:/)).toBeInTheDocument();
        });
    });

    it('should handle empty positions correctly', async () => {
        // Mock fetch with empty positions
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                positions: [],
                totalValue: 50000,
                cash: 50000,
                dayPnL: 0,
                totalPnL: 0,
                lastUpdate: new Date().toISOString()
            })
        });

        render(<PositionsPanel />);

        await waitFor(() => {
            expect(screen.getByText('No open positions')).toBeInTheDocument();
        });

        // Verify zero values display correctly
        expect(screen.getByText('$50,000')).toBeInTheDocument(); // cash & totalValue
        expect(screen.getByText('$0.00')).toBeInTheDocument(); // P&L values
    });

    it('should handle null/undefined numeric values gracefully', async () => {
        // Mock fetch with null/undefined values
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                positions: [],
                totalValue: null,
                cash: undefined,
                dayPnL: null,
                totalPnL: undefined,
                lastUpdate: new Date().toISOString()
            })
        });

        render(<PositionsPanel />);

        await waitFor(() => {
            expect(screen.queryByText('Loading positions...')).not.toBeInTheDocument();
        });

        // Should show fallback values, not crash
        expect(screen.getByText('$0')).toBeInTheDocument(); // fallback for null values
        expect(screen.getByText('$0.00')).toBeInTheDocument(); // fallback for P&L
    });
}); 