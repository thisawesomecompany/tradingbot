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
    }
};

export default api; 