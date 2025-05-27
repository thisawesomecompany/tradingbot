import React, { useState } from 'react';
import { useApiData } from '../hooks/useApi';
import { api, type MarketQuote as MarketQuoteType } from '../services/api';
import styles from './MarketQuote.module.css';

export function MarketQuote() {
    const [symbol, setSymbol] = useState('AAPL');
    const [currentSymbol, setCurrentSymbol] = useState('');

    // Only fetch when currentSymbol changes
    const { data: quoteData, loading, error } = useApiData(
        () => currentSymbol ? api.getMarketQuote(currentSymbol) : Promise.resolve(null),
        [currentSymbol]
    );

    const refetch = () => {
        if (currentSymbol) {
            // Force re-fetch by changing the dependency
            setCurrentSymbol('');
            setTimeout(() => setCurrentSymbol(currentSymbol), 100);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (symbol.trim()) {
            setCurrentSymbol(symbol.trim().toUpperCase());
        }
    };

    const formatPrice = (price: number | null): string => {
        if (price === null) return 'N/A';
        return `$${price.toFixed(2)}`;
    };

    const formatVolume = (volume: number | null): string => {
        if (volume === null) return 'N/A';
        if (volume >= 1000000) {
            return `${(volume / 1000000).toFixed(1)}M`;
        } else if (volume >= 1000) {
            return `${(volume / 1000).toFixed(1)}K`;
        }
        return volume.toString();
    };

    return (
        <div className={styles.marketQuote}>
            <h3>📊 Market Quote</h3>

            <form onSubmit={handleSearch} className={styles.quoteSearch}>
                <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter symbol (e.g., AAPL)"
                    maxLength={10}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Get Quote'}
                </button>
            </form>

            {error && (
                <div className={styles.errorMessage}>
                    ⚠️ Error: {error}
                </div>
            )}

            {quoteData && (
                <div className={styles.quoteDisplay}>
                    <div className={styles.quoteHeader}>
                        <h4>{quoteData.quote.symbol}</h4>
                        <span className={styles.quoteSource}>
                            Source: {quoteData.source === 'mock' ? '📋 Mock Data' : '🔗 Interactive Brokers'}
                        </span>
                    </div>

                    <div className={styles.quoteGrid}>
                        <div className={styles.quoteItem}>
                            <label>Last Price:</label>
                            <span className={styles.price}>{formatPrice(quoteData.quote.last)}</span>
                        </div>

                        <div className={styles.quoteItem}>
                            <label>Bid:</label>
                            <span className={`${styles.price} ${styles.bid}`}>{formatPrice(quoteData.quote.bid)}</span>
                        </div>

                        <div className={styles.quoteItem}>
                            <label>Ask:</label>
                            <span className={`${styles.price} ${styles.ask}`}>{formatPrice(quoteData.quote.ask)}</span>
                        </div>

                        <div className={styles.quoteItem}>
                            <label>Close:</label>
                            <span className={styles.price}>{formatPrice(quoteData.quote.close)}</span>
                        </div>

                        <div className={styles.quoteItem}>
                            <label>Volume:</label>
                            <span>{formatVolume(quoteData.quote.volume)}</span>
                        </div>

                        <div className={styles.quoteItem}>
                            <label>Exchange:</label>
                            <span>{quoteData.quote.exchange}</span>
                        </div>
                    </div>

                    {quoteData.quote.error && (
                        <div className={styles.quoteNote}>
                            ℹ️ {quoteData.quote.error}
                        </div>
                    )}

                    <div className={styles.quoteFooter}>
                        <small>Last updated: {new Date(quoteData.quote.lastUpdate).toLocaleTimeString()}</small>
                        <button onClick={() => refetch()} disabled={loading}>
                            🔄 Refresh
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
} 