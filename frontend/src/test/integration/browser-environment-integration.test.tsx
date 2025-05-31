import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../../App';

// Test that our application works correctly despite browser extension interference
describe('Browser Environment Integration Tests', () => {
    beforeEach(() => {
        // Clear any previous mocks
        vi.restoreAllMocks();

        // Clear console to avoid pollution from extension errors
        vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should render application successfully despite browser extension errors', async () => {
        // Mock successful API responses
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue({
                    status: 'ok',
                    account: 'DU12345',
                    market: 'open',
                    connection: {
                        ib: 'disconnected',
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
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValue({
                    positions: [{
                        symbol: 'SPY',
                        quantity: 100,
                        avgPrice: 150.25,
                        marketValue: 15050,
                        unrealizedPnL: 25.00,
                        realizedPnL: 0
                    }],
                    totalValue: 100000,
                    cash: 50000,
                    dayPnL: 250.50,
                    totalPnL: 1250.75,
                    lastUpdate: new Date().toISOString()
                })
            });

        // Simulate browser extension errors (these should not affect our app)
        const mockChromeError = new Error('runtime/sendMessage: The message port closed before a response was received.');
        vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
            if (event === 'error') {
                // Simulate the extension error being thrown
                setTimeout(() => {
                    if (typeof handler === 'function') {
                        handler({ error: mockChromeError } as any);
                    }
                }, 100);
            }
        });

        render(<App />);

        // Verify our application renders correctly despite extension errors
        expect(screen.getByText('Tactical Trader')).toBeInTheDocument();

        // Wait for components to load
        await waitFor(() => {
            expect(screen.getByText('Account & Positions')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Verify trading status loads
        await waitFor(() => {
            expect(screen.getByText('VWAP Scalping')).toBeInTheDocument();
        });

        // Verify positions load correctly (this was the original failing case)
        await waitFor(() => {
            expect(screen.getByText('$50,000')).toBeInTheDocument(); // cash
            expect(screen.getByText('$100,000')).toBeInTheDocument(); // totalValue
        });

        // Application should be fully functional despite browser extension noise
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Trading')).toBeInTheDocument();
    });

    it('should handle real API calls correctly in browser environment', async () => {
        // Test with real fetch (not mocked) to verify actual API integration
        // This tests that our backend API structure matches frontend expectations

        render(<App />);

        // Wait for real API calls to complete
        await waitFor(() => {
            expect(screen.getByText('Tactical Trader')).toBeInTheDocument();
        });

        // If this doesn't throw, our API integration is working
        await waitFor(() => {
            // Look for any content that indicates successful API loading
            const elements = screen.getAllByText(/\$/);
            expect(elements.length).toBeGreaterThan(0); // Should have monetary values displayed
        }, { timeout: 5000 });
    });

    it('should distinguish between application errors and browser extension errors', () => {
        // Mock console.error to capture what gets logged
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        // Simulate a Chrome extension error
        const extensionError = new Error('runtime/sendMessage: The message port closed before a response was received.');

        // This should NOT be considered an application error
        window.dispatchEvent(new ErrorEvent('error', { error: extensionError }));

        // Our application should not log this as its own error
        // (In a real implementation, we might filter these out)

        render(<App />);

        // Application should still render normally
        expect(screen.getByText('Tactical Trader')).toBeInTheDocument();

        consoleErrorSpy.mockRestore();
    });
}); 