// API service for backend communication
const API_BASE_URL = 'http://localhost:3001/api';

// Types for API responses
export interface TradingStatus {
    status: string;
    account: string;
    market: string;
    connection: {
        ib: string;
        lastUpdate: string;
    };
    trading: {
        enabled: boolean;
        strategy: string;
        riskLevel: string;
    };
}

export interface PositionsData {
    positions: any[];
    totalValue: number;
    cash: number;
    dayPnL: number;
    totalPnL: number;
    lastUpdate: string;
}

export interface HealthCheck {
    status: string;
    message: string;
    timestamp: string;
    version: string;
}

export interface MarketQuote {
    symbol: string;
    exchange: string;
    currency: string;
    bid: number | null;
    ask: number | null;
    last: number | null;
    close: number | null;
    volume: number | null;
    lastUpdate: string;
    error?: string;
}

export interface MarketQuoteResponse {
    quote: MarketQuote;
    source: 'mock' | 'ib';
}

export interface MarketSearchResult {
    symbol: string;
    secType: string;
    exchange: string;
    currency: string;
    description?: string;
}

export interface MarketSearchResponse {
    results: MarketSearchResult[];
    source: 'mock' | 'ib';
}

// API functions
export const api = {
    // Health check
    async getHealth(): Promise<HealthCheck> {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
            throw new Error(`Health check failed: ${response.statusText}`);
        }
        return response.json();
    },

    // Get trading status
    async getTradingStatus(): Promise<TradingStatus> {
        const response = await fetch(`${API_BASE_URL}/trading/status`);
        if (!response.ok) {
            throw new Error(`Failed to get trading status: ${response.statusText}`);
        }
        return response.json();
    },

    // Get positions data
    async getPositions(): Promise<PositionsData> {
        const response = await fetch(`${API_BASE_URL}/trading/positions`);
        if (!response.ok) {
            throw new Error(`Failed to get positions: ${response.statusText}`);
        }
        return response.json();
    },

    // Get market quote for a symbol
    async getMarketQuote(symbol: string, exchange: string = 'SMART', currency: string = 'USD'): Promise<MarketQuoteResponse> {
        const params = new URLSearchParams();
        if (exchange !== 'SMART') params.append('exchange', exchange);
        if (currency !== 'USD') params.append('currency', currency);

        const queryString = params.toString();
        const url = `${API_BASE_URL}/market/quote/${symbol.toUpperCase()}${queryString ? '?' + queryString : ''}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to get quote for ${symbol}: ${response.statusText}`);
        }
        return response.json();
    },

    // Search for symbols
    async searchSymbol(pattern: string): Promise<MarketSearchResponse> {
        const response = await fetch(`${API_BASE_URL}/market/search/${encodeURIComponent(pattern)}`);
        if (!response.ok) {
            throw new Error(`Failed to search for ${pattern}: ${response.statusText}`);
        }
        return response.json();
    }
};

export default api; 