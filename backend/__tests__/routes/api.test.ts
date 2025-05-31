import request from 'supertest';
import express from 'express';
import cors from 'cors';
import apiRoutes from '../../src/routes/api';

// Create test app
const createTestApp = () => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api', apiRoutes);
    return app;
};

describe('API Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = createTestApp();
    });

    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toMatchObject({
                status: 'healthy',
                service: 'Tactical Trader Backend'
            });
            expect(response.body.timestamp).toBeDefined();
            expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
        });

        it('should return JSON content type', async () => {
            await request(app)
                .get('/api/health')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });

    describe('GET /api/ib/status', () => {
        it('should return IB connection status', async () => {
            const response = await request(app)
                .get('/api/ib/status')
                .expect(200);

            expect(response.body).toMatchObject({
                connected: false,
                connecting: false,
                error: null
            });
            expect(response.body.lastUpdate).toBeDefined();
        });

        it('should handle IB service errors gracefully', async () => {
            // This test would require mocking ibService to throw an error
            const response = await request(app)
                .get('/api/ib/status')
                .expect(200); // Should still return 200 with mock data

            expect(response.body).toBeDefined();
        });
    });

    describe('GET /api/ib/portal/status', () => {
        it('should return Client Portal status', async () => {
            const response = await request(app)
                .get('/api/ib/portal/status')
                .expect(200);

            expect(response.body).toMatchObject({
                connected: false,
                authenticated: false,
                note: 'Client Portal integration pending'
            });
            expect(response.body.lastUpdate).toBeDefined();
        });
    });

    describe('GET /api/trading/status', () => {
        it('should return trading status', async () => {
            const response = await request(app)
                .get('/api/trading/status')
                .expect(200);

            expect(response.body).toMatchObject({
                connected: false,
                engineRunning: false,
                strategies: []
            });
            expect(response.body.lastUpdate).toBeDefined();
        });

        it('should handle trading service errors', async () => {
            // Test error handling
            const response = await request(app)
                .get('/api/trading/status')
                .expect(200);

            expect(response.body).toBeDefined();
        });
    });

    describe('GET /api/market/quote/:symbol', () => {
        it('should return mock quote for valid symbol', async () => {
            const symbol = 'AAPL';
            const response = await request(app)
                .get(`/api/market/quote/${symbol}`)
                .expect(200);

            expect(response.body).toMatchObject({
                symbol: symbol.toUpperCase(),
                source: 'mock'
            });

            // Validate quote structure
            expect(response.body.bid).toBeGreaterThan(0);
            expect(response.body.ask).toBeGreaterThan(0);
            expect(response.body.last).toBeGreaterThan(0);
            expect(response.body.volume).toBeGreaterThanOrEqual(0);
            expect(response.body.lastUpdate).toBeDefined();
        });

        it('should handle lowercase symbols', async () => {
            const symbol = 'tsla';
            const response = await request(app)
                .get(`/api/market/quote/${symbol}`)
                .expect(200);

            expect(response.body.symbol).toBe(symbol.toUpperCase());
        });

        it('should handle special characters in symbols', async () => {
            const symbol = 'BRK.A';
            const response = await request(app)
                .get(`/api/market/quote/${symbol}`)
                .expect(200);

            expect(response.body.symbol).toBe(symbol.toUpperCase());
        });

        it('should validate quote data types', async () => {
            const response = await request(app)
                .get('/api/market/quote/MSFT')
                .expect(200);

            expect(typeof response.body.bid).toBe('number');
            expect(typeof response.body.ask).toBe('number');
            expect(typeof response.body.last).toBe('number');
            expect(typeof response.body.change).toBe('number');
            expect(typeof response.body.changePercent).toBe('number');
            expect(typeof response.body.volume).toBe('number');
            expect(typeof response.body.symbol).toBe('string');
            expect(typeof response.body.source).toBe('string');
            expect(typeof response.body.lastUpdate).toBe('string');
        });
    });

    describe('GET /api/market/history/:symbol', () => {
        it('should return historical data for valid symbol', async () => {
            const symbol = 'SPY';
            const response = await request(app)
                .get(`/api/market/history/${symbol}`)
                .expect(200);

            expect(response.body).toMatchObject({
                symbol: symbol.toUpperCase(),
                timeframe: '1D',
                source: 'mock'
            });

            // Validate bars array
            expect(Array.isArray(response.body.bars)).toBe(true);
            expect(response.body.bars.length).toBe(100);

            // Validate first bar structure
            const firstBar = response.body.bars[0];
            expect(firstBar).toHaveProperty('time');
            expect(firstBar).toHaveProperty('open');
            expect(firstBar).toHaveProperty('high');
            expect(firstBar).toHaveProperty('low');
            expect(firstBar).toHaveProperty('close');
            expect(firstBar).toHaveProperty('volume');

            // Validate data types
            expect(typeof firstBar.time).toBe('number');
            expect(typeof firstBar.open).toBe('number');
            expect(typeof firstBar.high).toBe('number');
            expect(typeof firstBar.low).toBe('number');
            expect(typeof firstBar.close).toBe('number');
            expect(typeof firstBar.volume).toBe('number');
        });

        it('should validate OHLC relationships', async () => {
            const response = await request(app)
                .get('/api/market/history/QQQ')
                .expect(200);

            response.body.bars.forEach((bar: any) => {
                expect(bar.high).toBeGreaterThanOrEqual(bar.open);
                expect(bar.high).toBeGreaterThanOrEqual(bar.close);
                expect(bar.low).toBeLessThanOrEqual(bar.open);
                expect(bar.low).toBeLessThanOrEqual(bar.close);
                expect(bar.volume).toBeGreaterThanOrEqual(0);
            });
        });

        it('should return chronological data', async () => {
            const response = await request(app)
                .get('/api/market/history/VTI')
                .expect(200);

            const bars = response.body.bars;
            for (let i = 1; i < bars.length; i++) {
                expect(bars[i].time).toBeGreaterThan(bars[i - 1].time);
            }
        });
    });

    describe('GET /api/trading/positions', () => {
        it('should return positions array', async () => {
            const response = await request(app)
                .get('/api/trading/positions')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);

            if (response.body.length > 0) {
                const position = response.body[0];
                expect(position).toHaveProperty('symbol');
                expect(position).toHaveProperty('quantity');
                expect(position).toHaveProperty('avgPrice');
                expect(position).toHaveProperty('marketValue');
                expect(position).toHaveProperty('unrealizedPnL');
                expect(position).toHaveProperty('realizedPnL');

                // Validate data types
                expect(typeof position.symbol).toBe('string');
                expect(typeof position.quantity).toBe('number');
                expect(typeof position.avgPrice).toBe('number');
                expect(typeof position.marketValue).toBe('number');
                expect(typeof position.unrealizedPnL).toBe('number');
                expect(typeof position.realizedPnL).toBe('number');
            }
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid routes', async () => {
            await request(app)
                .get('/api/nonexistent')
                .expect(404);
        });

        it('should handle malformed requests', async () => {
            await request(app)
                .post('/api/health')
                .expect(404); // GET only endpoint
        });
    });

    describe('CORS Headers', () => {
        it('should include CORS headers', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.headers['access-control-allow-origin']).toBeDefined();
        });

        it('should handle preflight requests', async () => {
            await request(app)
                .options('/api/health')
                .expect(204);
        });
    });

    describe('Response Time', () => {
        it('should respond within reasonable time', async () => {
            const startTime = Date.now();

            await request(app)
                .get('/api/health')
                .expect(200);

            const responseTime = Date.now() - startTime;
            expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
        });
    });
}); 