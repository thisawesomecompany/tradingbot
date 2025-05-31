"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
/**
 * Interactive Brokers Client Portal API Service
 * This replaces the need for TWS/IB Gateway desktop application
 */
class IBClientPortalService {
    constructor() {
        this.config = {
            baseUrl: process.env.IB_PORTAL_URL || 'https://localhost:5000/v1/api',
            timeout: 30000
        };
        this.connectionStatus = {
            authenticated: false,
            connected: false,
            lastUpdate: new Date().toISOString()
        };
        // Create axios instance with SSL verification disabled for localhost
        this.client = axios_1.default.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeout,
            httpsAgent: new https_1.default.Agent({
                rejectUnauthorized: false // Required for self-signed certificates
            })
        });
        console.log('🌐 IBClientPortalService initialized with config:', this.config);
    }
    /**
     * Check authentication status
     */
    checkAuthStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.get('/iserver/auth/status');
                this.connectionStatus = {
                    authenticated: response.data.authenticated || false,
                    connected: response.data.connected || false,
                    lastUpdate: new Date().toISOString()
                };
                if (this.connectionStatus.authenticated && this.connectionStatus.connected) {
                    console.log('✅ Client Portal API authenticated and connected');
                }
                else {
                    console.log('⚠️ Client Portal API not fully authenticated/connected');
                }
            }
            catch (error) {
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
        });
    }
    /**
     * Re-authenticate session (useful for session timeouts)
     */
    reauthenticate() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.client.post('/iserver/auth/ssodh/init');
                if (response.data.connected) {
                    yield this.checkAuthStatus();
                    return this.connectionStatus.authenticated;
                }
                return false;
            }
            catch (error) {
                console.error('❌ Reauthentication failed:', error);
                return false;
            }
        });
    }
    /**
     * Keep session alive (call every 30 seconds)
     */
    tickle() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.post('/tickle');
                return true;
            }
            catch (error) {
                console.error('❌ Session tickle failed:', error);
                return false;
            }
        });
    }
    /**
     * Search for contracts by symbol
     */
    searchContracts(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated with Client Portal');
            }
            try {
                const response = yield this.client.get(`/iserver/secdef/search?symbol=${symbol}`);
                return response.data || [];
            }
            catch (error) {
                console.error(`❌ Contract search failed for ${symbol}:`, error);
                throw error;
            }
        });
    }
    /**
     * Get market data snapshot for a contract
     */
    getMarketSnapshot(conid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated with Client Portal');
            }
            try {
                const response = yield this.client.get(`/iserver/marketdata/snapshot?conids=${conid}&fields=31,84,86,88,7295,7296`);
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
            }
            catch (error) {
                console.error(`❌ Market data failed for conid ${conid}:`, error);
                throw error;
            }
        });
    }
    /**
     * Get historical data (bars)
     */
    getHistoricalData(conid_1) {
        return __awaiter(this, arguments, void 0, function* (conid, period = '1d', bar = '5min') {
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated with Client Portal');
            }
            try {
                const response = yield this.client.get(`/iserver/marketdata/history?conid=${conid}&period=${period}&bar=${bar}`);
                return response.data.data || [];
            }
            catch (error) {
                console.error(`❌ Historical data failed for conid ${conid}:`, error);
                throw error;
            }
        });
    }
    /**
     * Place an order
     */
    placeOrder(accountId, order) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated with Client Portal');
            }
            try {
                const orderPayload = Object.assign(Object.assign({ conid: order.conid, orderType: order.orderType, side: order.side, quantity: order.quantity }, (order.price && { price: order.price })), (order.stopPrice && { auxPrice: order.stopPrice }));
                const response = yield this.client.post(`/iserver/account/${accountId}/orders`, {
                    orders: [orderPayload]
                });
                const result = response.data[0] || {};
                return {
                    orderId: result.order_id || result.id || 'unknown',
                    status: result.order_status || 'unknown',
                    message: result.message
                };
            }
            catch (error) {
                console.error('❌ Order placement failed:', error);
                throw error;
            }
        });
    }
    /**
     * Get account information
     */
    getAccountSummary() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated with Client Portal');
            }
            try {
                const response = yield this.client.get('/portfolio/accounts');
                return response.data;
            }
            catch (error) {
                console.error('❌ Account summary failed:', error);
                throw error;
            }
        });
    }
    /**
     * Get portfolio positions
     */
    getPortfolio(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isAuthenticated()) {
                throw new Error('Not authenticated with Client Portal');
            }
            try {
                const response = yield this.client.get(`/portfolio/${accountId}/positions/0`);
                return response.data || [];
            }
            catch (error) {
                console.error('❌ Portfolio fetch failed:', error);
                throw error;
            }
        });
    }
    /**
     * Check if authenticated
     */
    isAuthenticated() {
        return this.connectionStatus.authenticated && this.connectionStatus.connected;
    }
    /**
     * Get current connection status
     */
    getConnectionStatus() {
        return Object.assign({}, this.connectionStatus);
    }
    /**
     * Start session keep-alive (call this after authentication)
     */
    startKeepAlive() {
        return setInterval(() => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.tickle();
            }
            catch (error) {
                console.error('❌ Keep-alive failed:', error);
            }
        }), 30000); // Every 30 seconds
    }
}
exports.default = IBClientPortalService;
