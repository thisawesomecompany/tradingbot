import { useState, useEffect } from 'react';
import api from '../services/api';
import type { TradingStatus, PositionsData, HealthCheck } from '../services/api';

// Generic hook for API calls with loading and error states
export function useApiData<T>(
    apiCall: () => Promise<T>,
    dependencies: any[] = []
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await apiCall();
                if (isMounted) {
                    setData(result);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'An error occurred');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, dependencies);

    return { data, loading, error };
}

// Specific hooks for different API endpoints
export function useTradingStatus() {
    return useApiData<TradingStatus>(api.getTradingStatus);
}

export function usePositions() {
    return useApiData<PositionsData>(api.getPositions);
}

export function useHealthCheck() {
    return useApiData<HealthCheck>(api.getHealth);
} 