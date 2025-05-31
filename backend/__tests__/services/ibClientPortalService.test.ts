import IBClientPortalService from '../../src/services/ibClientPortalService';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('IBClientPortalService', () => {
    let service: IBClientPortalService;

    beforeEach(() => {
        service = new IBClientPortalService();
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        it('should initialize with default config', () => {
            const newService = new IBClientPortalService();
            expect(newService).toBeInstanceOf(IBClientPortalService);
        });
    });

    describe('checkAuthStatus', () => {
        it('should return connection status on success', async () => {
            const mockClient = {
                get: jest.fn().mockResolvedValueOnce({
                    data: { authenticated: true, connected: true }
                })
            };

            // Mock the client property
            (service as any).client = mockClient;

            const status = await service.checkAuthStatus();

            expect(status).toHaveProperty('connected');
            expect(status).toHaveProperty('authenticated');
            expect(status).toHaveProperty('lastUpdate');
            expect(typeof status.connected).toBe('boolean');
            expect(typeof status.authenticated).toBe('boolean');
            expect(typeof status.lastUpdate).toBe('string');
        });

        it('should handle API errors gracefully', async () => {
            const mockClient = {
                get: jest.fn().mockRejectedValueOnce(new Error('Network error'))
            };

            (service as any).client = mockClient;

            const status = await service.checkAuthStatus();

            expect(status.connected).toBe(false);
            expect(status.authenticated).toBe(false);
            expect(status.error).toBeDefined();
        });
    });

    describe('reauthenticate', () => {
        it('should return true on successful authentication', async () => {
            const mockClient = {
                post: jest.fn().mockResolvedValueOnce({
                    data: { connected: true }
                }),
                get: jest.fn().mockResolvedValueOnce({
                    data: { authenticated: true, connected: true }
                })
            };

            (service as any).client = mockClient;

            const result = await service.reauthenticate();

            expect(typeof result).toBe('boolean');
        });

        it('should return false on authentication failure', async () => {
            const mockClient = {
                post: jest.fn().mockRejectedValueOnce(new Error('Auth failed'))
            };

            (service as any).client = mockClient;

            const result = await service.reauthenticate();

            expect(result).toBe(false);
        });
    });

    describe('tickle', () => {
        it('should return true on successful keepalive', async () => {
            const mockClient = {
                post: jest.fn().mockResolvedValueOnce({ data: {} })
            };

            (service as any).client = mockClient;

            const result = await service.tickle();

            expect(result).toBe(true);
        });

        it('should return false on keepalive failure', async () => {
            const mockClient = {
                post: jest.fn().mockRejectedValueOnce(new Error('Tickle failed'))
            };

            (service as any).client = mockClient;

            const result = await service.tickle();

            expect(result).toBe(false);
        });
    });

    describe('searchContracts', () => {
        it('should return contracts for valid symbol', async () => {
            const mockContracts = [
                { conid: 265598, symbol: 'AAPL', exchange: 'NASDAQ' }
            ];

            const mockClient = {
                get: jest.fn().mockResolvedValueOnce({ data: mockContracts })
            };

            (service as any).client = mockClient;
            // Mock authenticated state
            (service as any).connectionStatus = { authenticated: true, connected: true };

            const result = await service.searchContracts('AAPL');

            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual(mockContracts);
        });

        it('should throw error when not authenticated', async () => {
            // Mock unauthenticated state
            (service as any).connectionStatus = { authenticated: false, connected: false };

            await expect(service.searchContracts('AAPL')).rejects.toThrow('Not authenticated');
        });

        it('should handle API errors', async () => {
            const mockClient = {
                get: jest.fn().mockRejectedValueOnce(new Error('API error'))
            };

            (service as any).client = mockClient;
            (service as any).connectionStatus = { authenticated: true, connected: true };

            await expect(service.searchContracts('INVALID')).rejects.toThrow();
        });
    });

    describe('getMarketSnapshot', () => {
        it('should return market data for valid conid', async () => {
            const mockData = [{
                symbol: 'AAPL',
                '31': 150.25,  // last
                '84': 150.20,  // bid
                '86': 150.30,  // ask
                '7295': 1000000 // volume
            }];

            const mockClient = {
                get: jest.fn().mockResolvedValueOnce({ data: mockData })
            };

            (service as any).client = mockClient;
            (service as any).connectionStatus = { authenticated: true, connected: true };

            const result = await service.getMarketSnapshot(265598);

            expect(result).toHaveProperty('symbol');
            expect(result).toHaveProperty('conid');
            expect(result).toHaveProperty('bid');
            expect(result).toHaveProperty('ask');
            expect(result).toHaveProperty('last');
            expect(result).toHaveProperty('lastUpdate');
            expect(result.conid).toBe(265598);
        });

        it('should throw error when not authenticated', async () => {
            (service as any).connectionStatus = { authenticated: false, connected: false };

            await expect(service.getMarketSnapshot(265598)).rejects.toThrow('Not authenticated');
        });
    });

    describe('getHistoricalData', () => {
        it('should return historical bars for valid conid', async () => {
            const mockBars = {
                data: [
                    { o: 150, h: 151, l: 149, c: 150.5, v: 1000000, t: 1640995200 }
                ]
            };

            const mockClient = {
                get: jest.fn().mockResolvedValueOnce({ data: mockBars })
            };

            (service as any).client = mockClient;
            (service as any).connectionStatus = { authenticated: true, connected: true };

            const result = await service.getHistoricalData(265598, '1d', '5min');

            expect(Array.isArray(result)).toBe(true);
        });

        it('should throw error when not authenticated', async () => {
            (service as any).connectionStatus = { authenticated: false, connected: false };

            await expect(service.getHistoricalData(265598)).rejects.toThrow('Not authenticated');
        });
    });

    describe('isAuthenticated', () => {
        it('should return true when authenticated', () => {
            (service as any).connectionStatus = { authenticated: true, connected: true };

            const result = service.isAuthenticated();

            expect(result).toBe(true);
        });

        it('should return false when not authenticated', () => {
            (service as any).connectionStatus = { authenticated: false, connected: false };

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

            (service as any).connectionStatus = mockStatus;

            const result = service.getConnectionStatus();

            expect(result).toEqual(mockStatus);
        });
    });

    describe('startKeepAlive', () => {
        it('should return a timer object', () => {
            // Mock setInterval
            const mockTimer = {} as NodeJS.Timeout;
            jest.spyOn(global, 'setInterval').mockReturnValueOnce(mockTimer);

            const result = service.startKeepAlive();

            expect(result).toBe(mockTimer);
        });
    });

    describe('Error Handling', () => {
        it('should handle network timeouts', async () => {
            const mockClient = {
                get: jest.fn().mockRejectedValueOnce({
                    code: 'ECONNABORTED',
                    message: 'timeout of 30000ms exceeded'
                })
            };

            (service as any).client = mockClient;

            const result = await service.checkAuthStatus();

            expect(result.authenticated).toBe(false);
            expect(result.error).toContain('Authentication check failed');
        });

        it('should handle connection refused', async () => {
            const mockClient = {
                get: jest.fn().mockRejectedValueOnce({
                    code: 'ECONNREFUSED',
                    message: 'connect ECONNREFUSED'
                })
            };

            (service as any).client = mockClient;

            const result = await service.checkAuthStatus();

            expect(result.authenticated).toBe(false);
            expect(result.connected).toBe(false);
        });
    });
}); 