import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { StatusPanel } from '../../components/StatusPanel';
import { api } from '../../services/api';
import { renderWithProviders } from '../setup';

// Test with real API structure (not mocked)
describe('StatusPanel Integration Tests', () => {
    beforeEach(() => {
        // Clear any previous mocks
        vi.restoreAllMocks();
    });

    it('should handle real API response structure correctly', async () => {
        // Mock fetch with realistic response structure
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                status: 'ok',
                account: 'DU12345',
                market: 'open',
                connection: {
                    ib: 'disconnected',
                    lastUpdate: '2023-01-01T00:00:00.000Z'
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
        });

        renderWithProviders(<StatusPanel />);

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.queryByText('Loading status...')).not.toBeInTheDocument();
        });

        // Verify the component renders without errors
        expect(screen.getByText('📊 Trading Status')).toBeInTheDocument();
        expect(screen.getByText('Connection')).toBeInTheDocument();
        expect(screen.getByText('Market')).toBeInTheDocument();
        expect(screen.getByText('Disconnected')).toBeInTheDocument();
        expect(screen.getByText('🟢 open')).toBeInTheDocument();

        // Verify trading data is displayed
        expect(screen.getByText('$100,000')).toBeInTheDocument(); // Account Value
        expect(screen.getByText('+$251')).toBeInTheDocument(); // Day P&L
        expect(screen.getByText('$25,000')).toBeInTheDocument(); // Buying Power
    });

    it('should handle API errors gracefully', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        renderWithProviders(<StatusPanel />);

        await waitFor(() => {
            expect(screen.getByText(/Error:/)).toBeInTheDocument();
        });

        expect(screen.getByText('📊 Trading Status')).toBeInTheDocument();
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });

    it('should handle missing optional fields', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                status: 'ok',
                account: 'DU12345',
                market: 'closed',
                connection: {
                    ib: 'connected',
                    lastUpdate: '2023-01-01T00:00:00.000Z'
                },
                trading: {
                    enabled: true,
                    strategy: 'Manual Trading',
                    riskLevel: 'low'
                    // accountValue, dayPnL, etc. are undefined
                }
            })
        });

        renderWithProviders(<StatusPanel />);

        await waitFor(() => {
            expect(screen.queryByText('Loading status...')).not.toBeInTheDocument();
        });

        // Should render without errors even with missing optional fields
        expect(screen.getByText('📊 Trading Status')).toBeInTheDocument();
        expect(screen.getByText('Connected')).toBeInTheDocument();
        expect(screen.getByText('🟡 closed')).toBeInTheDocument();
        expect(screen.getByText('✅ Enabled')).toBeInTheDocument();

        // Optional fields should not be displayed
        expect(screen.queryByText('Account Value')).not.toBeInTheDocument();
        expect(screen.queryByText('Day P&L')).not.toBeInTheDocument();
    });

    it('should format currency and P&L correctly', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                status: 'ok',
                account: 'DU12345',
                market: 'open',
                connection: {
                    ib: 'connected',
                    lastUpdate: '2023-01-01T00:00:00.000Z'
                },
                trading: {
                    enabled: false,
                    strategy: 'VWAP Scalping',
                    riskLevel: 'high',
                    accountValue: 1234567.89,
                    dayPnL: -123.45,
                    buyingPower: 500000,
                    openOrders: 3
                }
            })
        });

        renderWithProviders(<StatusPanel />);

        await waitFor(() => {
            expect(screen.queryByText('Loading status...')).not.toBeInTheDocument();
        });

        // Verify currency formatting
        expect(screen.getByText('$1,234,568')).toBeInTheDocument(); // Account Value (rounded)
        expect(screen.getByText('-$123')).toBeInTheDocument(); // Day P&L (negative)
        expect(screen.getByText('$500,000')).toBeInTheDocument(); // Buying Power
        expect(screen.getByText('3')).toBeInTheDocument(); // Open Orders
    });

    it('should validate connection status values', async () => {
        // Test with invalid connection status
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                status: 'ok',
                account: 'DU12345',
                market: 'open',
                connection: {
                    ib: 'invalid-status', // This should be handled gracefully
                    lastUpdate: '2023-01-01T00:00:00.000Z'
                },
                trading: {
                    enabled: false,
                    strategy: 'VWAP Scalping',
                    riskLevel: 'medium'
                }
            })
        });

        renderWithProviders(<StatusPanel />);

        await waitFor(() => {
            expect(screen.queryByText('Loading status...')).not.toBeInTheDocument();
        });

        // Should still render without crashing
        expect(screen.getByText('📊 Trading Status')).toBeInTheDocument();
        // Invalid status should be treated as disconnected
        expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });
}); 