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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ibService = void 0;
const ib_1 = require("@stoqey/ib");
class IBService {
    constructor() {
        this.ib = null;
        this.connectionStatus = {
            connected: false,
            lastUpdate: new Date().toISOString()
        };
        this.config = {
            host: process.env.IB_HOST || '127.0.0.1',
            port: parseInt(process.env.IB_PORT || '7497'), // TWS Paper Trading port
            clientId: parseInt(process.env.IB_CLIENT_ID || '1')
        };
        // Market data tracking
        this.marketDataRequests = new Map();
        this.nextReqId = 1;
        console.log('🔌 IBService initialized with config:', {
            host: this.config.host,
            port: this.config.port,
            clientId: this.config.clientId
        });
    }
    /**
     * Initialize IB API connection
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.ib) {
                    console.log('⚠️ IB connection already exists, disconnecting first...');
                    yield this.disconnect();
                }
                console.log('🔌 Attempting to connect to IB...');
                // Create new IB API instance
                this.ib = new ib_1.IBApi({
                    host: this.config.host,
                    port: this.config.port,
                    clientId: this.config.clientId
                });
                // Set up event handlers
                this.setupEventHandlers();
                // Attempt connection
                this.ib.connect();
                // Wait for connection or timeout
                const connected = yield this.waitForConnection(5000); // 5 second timeout
                if (connected) {
                    this.connectionStatus = {
                        connected: true,
                        lastUpdate: new Date().toISOString()
                    };
                    console.log('✅ Successfully connected to IB');
                }
                else {
                    this.connectionStatus = {
                        connected: false,
                        lastUpdate: new Date().toISOString(),
                        error: 'Connection timeout - ensure TWS/IB Gateway is running'
                    };
                    console.log('❌ Failed to connect to IB: timeout');
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.connectionStatus = {
                    connected: false,
                    lastUpdate: new Date().toISOString(),
                    error: errorMessage
                };
                console.error('❌ IB connection error:', errorMessage);
            }
            return this.connectionStatus;
        });
    }
    /**
     * Disconnect from IB API
     */
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.ib) {
                try {
                    this.ib.disconnect();
                    this.ib = null;
                    this.connectionStatus = {
                        connected: false,
                        lastUpdate: new Date().toISOString()
                    };
                    console.log('🔌 Disconnected from IB');
                }
                catch (error) {
                    console.error('❌ Error disconnecting from IB:', error);
                }
            }
        });
    }
    /**
     * Get current connection status
     */
    getConnectionStatus() {
        return Object.assign({}, this.connectionStatus);
    }
    /**
     * Check if connected to IB
     */
    isConnected() {
        return this.connectionStatus.connected && this.ib !== null;
    }
    /**
     * Get IB API instance (for advanced usage)
     */
    getIBApi() {
        return this.ib;
    }
    /**
     * Get market quote for a symbol
     */
    getMarketQuote(symbol_1) {
        return __awaiter(this, arguments, void 0, function* (symbol, exchange = 'SMART', currency = 'USD') {
            if (!this.isConnected() || !this.ib) {
                throw new Error('Not connected to IB');
            }
            return new Promise((resolve, reject) => {
                const reqId = this.nextReqId++;
                // Create contract
                const contract = {
                    symbol: symbol.toUpperCase(),
                    secType: 'STK',
                    exchange: exchange,
                    currency: currency
                };
                // Initialize quote object
                const quote = {
                    symbol: symbol.toUpperCase(),
                    exchange: exchange,
                    currency: currency,
                    lastUpdate: new Date().toISOString()
                };
                // Set timeout for request (10 seconds)
                const timeout = setTimeout(() => {
                    this.marketDataRequests.delete(reqId);
                    if (this.ib) {
                        this.ib.cancelMktData(reqId);
                    }
                    reject(new Error(`Market data request timeout for ${symbol}`));
                }, 10000);
                // Store request
                this.marketDataRequests.set(reqId, {
                    symbol: symbol.toUpperCase(),
                    resolve,
                    reject,
                    quote,
                    timeout
                });
                try {
                    // Request market data
                    this.ib.reqMktData(reqId, contract, '', false, false);
                    console.log(`📊 Requesting market data for ${symbol} (reqId: ${reqId})`);
                }
                catch (error) {
                    clearTimeout(timeout);
                    this.marketDataRequests.delete(reqId);
                    reject(error);
                }
            });
        });
    }
    /**
     * Search for contracts by symbol
     */
    searchSymbol(pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected() || !this.ib) {
                throw new Error('Not connected to IB');
            }
            // For now, return a simple mock response
            // In a full implementation, you'd use reqMatchingSymbols
            const mockResults = [
                {
                    symbol: pattern.toUpperCase(),
                    secType: 'STK',
                    exchange: 'SMART',
                    currency: 'USD'
                }
            ];
            return Promise.resolve(mockResults);
        });
    }
    /**
     * Set up event handlers for IB API
     */
    setupEventHandlers() {
        if (!this.ib)
            return;
        // Connection events
        this.ib.on(ib_1.EventName.connected, () => {
            console.log('🔗 IB API connected');
            this.connectionStatus.connected = true;
            this.connectionStatus.lastUpdate = new Date().toISOString();
        });
        this.ib.on(ib_1.EventName.disconnected, () => {
            console.log('🔌 IB API disconnected');
            this.connectionStatus.connected = false;
            this.connectionStatus.lastUpdate = new Date().toISOString();
        });
        // Error handling
        this.ib.on(ib_1.EventName.error, (err, code, reqId) => {
            console.error(`🚨 IB API Error [${code}] (reqId: ${reqId}):`, err.message);
            // Update connection status on critical errors
            if (code === ib_1.ErrorCode.CONNECT_FAIL || code === ib_1.ErrorCode.NOT_CONNECTED) {
                this.connectionStatus.connected = false;
                this.connectionStatus.error = err.message;
                this.connectionStatus.lastUpdate = new Date().toISOString();
            }
        });
        // Server info
        this.ib.on(ib_1.EventName.server, (version, connectionTime) => {
            console.log(`📡 IB Server version: ${version}, connection time: ${connectionTime}`);
        });
        // Next valid order ID (indicates successful connection)
        this.ib.on(ib_1.EventName.nextValidId, (orderId) => {
            console.log(`📋 Next valid order ID: ${orderId}`);
        });
        // Market data events
        this.ib.on(ib_1.EventName.tickPrice, (reqId, tickType, price) => {
            const request = this.marketDataRequests.get(reqId);
            if (!request)
                return;
            // Update quote based on tick type (using numeric constants)
            switch (tickType) {
                case 1: // BID
                    request.quote.bid = price;
                    break;
                case 2: // ASK
                    request.quote.ask = price;
                    break;
                case 4: // LAST
                    request.quote.last = price;
                    break;
                case 9: // CLOSE
                    request.quote.close = price;
                    break;
            }
            // Check if we have enough data to resolve
            this.checkAndResolveQuote(reqId);
        });
        // For now, simplify and just use tickPrice events
        // this.ib.on(EventName.tickSize, (reqId: number, tickType: number, size: number) => {
        //     const request = this.marketDataRequests.get(reqId);
        //     if (!request) return;
        //     if (tickType === 8) {
        //         request.quote.volume = size;
        //     }
        //     this.checkAndResolveQuote(reqId);
        // });
    }
    /**
     * Wait for connection to be established
     */
    waitForConnection(timeoutMs) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const checkConnection = () => {
                if (this.connectionStatus.connected) {
                    resolve(true);
                }
                else if (Date.now() - startTime > timeoutMs) {
                    resolve(false);
                }
                else {
                    setTimeout(checkConnection, 100);
                }
            };
            checkConnection();
        });
    }
    /**
     * Check if we have enough market data and resolve the quote
     */
    checkAndResolveQuote(reqId) {
        const request = this.marketDataRequests.get(reqId);
        if (!request)
            return;
        const quote = request.quote;
        // If we have at least one price (bid, ask, or last), resolve the quote
        if (quote.bid !== undefined || quote.ask !== undefined || quote.last !== undefined) {
            clearTimeout(request.timeout);
            this.marketDataRequests.delete(reqId);
            // Cancel the market data request
            if (this.ib) {
                this.ib.cancelMktData(reqId);
            }
            // Create final quote with defaults
            const finalQuote = {
                symbol: quote.symbol || request.symbol,
                exchange: quote.exchange || 'SMART',
                currency: quote.currency || 'USD',
                bid: quote.bid || null,
                ask: quote.ask || null,
                last: quote.last || null,
                close: quote.close || null,
                volume: quote.volume || null,
                lastUpdate: quote.lastUpdate || new Date().toISOString()
            };
            request.resolve(finalQuote);
        }
    }
}
// Export singleton instance
exports.ibService = new IBService();
exports.default = exports.ibService;
