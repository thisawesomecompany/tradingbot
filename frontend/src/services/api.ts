// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Types for API responses
export interface TradingStatus {
    status: string;
    account: string;
    market: string;
    connection: {
        ib: string;
        lastUpdate: string;
        error?: string;
    };
    trading: {
        enabled: boolean;
        strategy: string;
        riskLevel: string;
        accountValue?: number;
        dayPnL?: number;
        buyingPower?: number;
        openOrders?: number;
        lastTradeTime?: string;
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

export interface HistoricalBar {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface HistoricalDataResponse {
    symbol: string;
    timeframe: string;
    bars: HistoricalBar[];
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
    async getMarketQuote(symbol: string, exchange?: string, currency?: string): Promise<MarketQuoteResponse> {
        const params = new URLSearchParams();
        if (exchange) params.append('exchange', exchange);
        if (currency) params.append('currency', currency);

        const url = `${API_BASE_URL}/market/quote/${symbol}${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch quote: ${response.statusText}`);
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
    },

    async getHistoricalData(symbol: string, timeframe?: string, exchange?: string, currency?: string): Promise<HistoricalDataResponse> {
        const params = new URLSearchParams();
        if (timeframe) params.append('timeframe', timeframe);
        if (exchange) params.append('exchange', exchange);
        if (currency) params.append('currency', currency);

        const url = `${API_BASE_URL}/market/history/${symbol}${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch historical data: ${response.statusText}`);
        }

        return response.json();
    }
};

export default api; 