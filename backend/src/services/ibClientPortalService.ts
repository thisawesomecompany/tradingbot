import axios, { AxiosInstance } from 'axios';
import https from 'https';

export interface ClientPortalConfig {
    baseUrl: string;
    timeout: number;
}

export interface PortalConnectionStatus {
    authenticated: boolean;
    connected: boolean;
    lastUpdate: string;
    error?: string;
}

export interface PortalMarketQuote {
    symbol: string;
    conid: number;
    bid: number | null;
    ask: number | null;
    last: number | null;
    change: number | null;
    changePercent: number | null;
    volume: number | null;
    lastUpdate: string;
    exchange?: string;
    currency?: string;
}

export interface OrderRequest {
    conid: number;
    orderType: 'MKT' | 'LMT' | 'STP';
    side: 'BUY' | 'SELL';
    quantity: number;
    price?: number;
    stopPrice?: number;
}

export interface OrderResponse {
    orderId: string;
    status: string;
    message?: string;
}

/**
 * Interactive Brokers Client Portal API Service
 * This replaces the need for TWS/IB Gateway desktop application
 */
class IBClientPortalService {
    private client: AxiosInstance;
    private config: ClientPortalConfig = {
        baseUrl: process.env.IB_PORTAL_URL || 'https://localhost:5000/v1/api',
        timeout: 30000
    };

    private connectionStatus: PortalConnectionStatus = {
        authenticated: false,
        connected: false,
        lastUpdate: new Date().toISOString()
    };

    constructor() {
        // Create axios instance with SSL verification disabled for localhost
        this.client = axios.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeout,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false // Required for self-signed certificates
            })
        });

        console.log('🌐 IBClientPortalService initialized with config:', this.config);
    }

    /**
     * Check authentication status
     */
    public async checkAuthStatus(): Promise<PortalConnectionStatus> {
        try {
            const response = await this.client.get('/iserver/auth/status');

            this.connectionStatus = {
                authenticated: response.data.authenticated || false,
                connected: response.data.connected || false,
                lastUpdate: new Date().toISOString()
            };

            if (this.connectionStatus.authenticated && this.connectionStatus.connected) {
                console.log('✅ Client Portal API authenticated and connected');
            } else {
                console.log('⚠️ Client Portal API not fully authenticated/connected');
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.connectionStatus = {
                authenticated: false,
                connected: false,
                lastUpdate: new Date().toISOString(),
                error: `Authentication check failed: ${errorMessage}`
            };
            console.error('❌ Client Portal auth check error:', errorMessage);
        }

        return this.connectionStatus;
    }

    /**
     * Re-authenticate session (useful for session timeouts)
     */
    public async reauthenticate(): Promise<boolean> {
        try {
            const response = await this.client.post('/iserver/auth/ssodh/init');

            if (response.data.connected) {
                await this.checkAuthStatus();
                return this.connectionStatus.authenticated;
            }

            return false;
        } catch (error) {
            console.error('❌ Reauthentication failed:', error);
            return false;
        }
    }

    /**
     * Keep session alive (call every 30 seconds)
     */
    public async tickle(): Promise<boolean> {
        try {
            await this.client.post('/tickle');
            return true;
        } catch (error) {
            console.error('❌ Session tickle failed:', error);
            return false;
        }
    }

    /**
     * Search for contracts by symbol
     */
    public async searchContracts(symbol: string): Promise<any[]> {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated with Client Portal');
        }

        try {
            const response = await this.client.get(`/iserver/secdef/search?symbol=${symbol}`);
            return response.data || [];
        } catch (error) {
            console.error(`❌ Contract search failed for ${symbol}:`, error);
            throw error;
        }
    }

    /**
     * Get market data snapshot for a contract
     */
    public async getMarketSnapshot(conid: number): Promise<PortalMarketQuote> {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated with Client Portal');
        }

        try {
            const response = await this.client.get(`/iserver/marketdata/snapshot?conids=${conid}&fields=31,84,86,88,7295,7296`);
            const data = response.data[0] || {};

            return {
                symbol: data.symbol || 'UNKNOWN',
                conid: conid,
                bid: data['84'] || null,
                ask: data['86'] || null,
                last: data['31'] || null,
                change: data['82'] || null,
                changePercent: data['83'] || null,
                volume: data['7295'] || null,
                lastUpdate: new Date().toISOString(),
                exchange: data.exchange,
                currency: data.currency
            };
        } catch (error) {
            console.error(`❌ Market data failed for conid ${conid}:`, error);
            throw error;
        }
    }

    /**
     * Get historical data (bars)
     */
    public async getHistoricalData(conid: number, period: string = '1d', bar: string = '5min'): Promise<any[]> {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated with Client Portal');
        }

        try {
            const response = await this.client.get(`/iserver/marketdata/history?conid=${conid}&period=${period}&bar=${bar}`);
            return response.data.data || [];
        } catch (error) {
            console.error(`❌ Historical data failed for conid ${conid}:`, error);
            throw error;
        }
    }

    /**
     * Place an order
     */
    public async placeOrder(accountId: string, order: OrderRequest): Promise<OrderResponse> {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated with Client Portal');
        }

        try {
            const orderPayload = {
                conid: order.conid,
                orderType: order.orderType,
                side: order.side,
                quantity: order.quantity,
                ...(order.price && { price: order.price }),
                ...(order.stopPrice && { auxPrice: order.stopPrice })
            };

            const response = await this.client.post(`/iserver/account/${accountId}/orders`, {
                orders: [orderPayload]
            });

            const result = response.data[0] || {};

            return {
                orderId: result.order_id || result.id || 'unknown',
                status: result.order_status || 'unknown',
                message: result.message
            };

        } catch (error) {
            console.error('❌ Order placement failed:', error);
            throw error;
        }
    }

    /**
     * Get account information
     */
    public async getAccountSummary(): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated with Client Portal');
        }

        try {
            const response = await this.client.get('/portfolio/accounts');
            return response.data;
        } catch (error) {
            console.error('❌ Account summary failed:', error);
            throw error;
        }
    }

    /**
     * Get portfolio positions
     */
    public async getPortfolio(accountId: string): Promise<any[]> {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated with Client Portal');
        }

        try {
            const response = await this.client.get(`/portfolio/${accountId}/positions/0`);
            return response.data || [];
        } catch (error) {
            console.error('❌ Portfolio fetch failed:', error);
            throw error;
        }
    }

    /**
     * Check if authenticated
     */
    public isAuthenticated(): boolean {
        return this.connectionStatus.authenticated && this.connectionStatus.connected;
    }

    /**
     * Get current connection status
     */
    public getConnectionStatus(): PortalConnectionStatus {
        return { ...this.connectionStatus };
    }

    /**
     * Start session keep-alive (call this after authentication)
     */
    public startKeepAlive(): NodeJS.Timeout {
        return setInterval(async () => {
            try {
                await this.tickle();
            } catch (error) {
                console.error('❌ Keep-alive failed:', error);
            }
        }, 30000); // Every 30 seconds
    }
}

export default IBClientPortalService; 