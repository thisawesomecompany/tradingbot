import React, { useState, useEffect, useRef } from 'react';
import { useApiData } from '../hooks/useApi';
import { useDataMode } from '../contexts/DataModeContext';
import { api, type MarketQuote as MarketQuoteType } from '../services/api';
import styles from './MarketQuote.module.css';

export function MarketQuote() {
    const { mode, isLive, isSimulated } = useDataMode();
    const [symbol, setSymbol] = useState('AAPL');
    const [currentSymbol, setCurrentSymbol] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(1); // seconds - 1s default for trading apps
    const [lastQuote, setLastQuote] = useState<MarketQuoteType | null>(null);
    const intervalRef = useRef<number | null>(null);

    // Only fetch when currentSymbol changes
    const { data: quoteData, loading, error } = useApiData(
        () => currentSymbol ? api.getMarketQuote(currentSymbol) : Promise.resolve(null),
        [currentSymbol]
    );

    // Auto-refresh functionality
    useEffect(() => {
        if (autoRefresh && currentSymbol) {
            intervalRef.current = window.setInterval(() => {
                // Force re-fetch by toggling the symbol
                const temp = currentSymbol;
                setCurrentSymbol('');
                setTimeout(() => setCurrentSymbol(temp), 50);
            }, refreshInterval * 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoRefresh, currentSymbol, refreshInterval]);

    // Track quote changes for visual indicators
    useEffect(() => {
        if (quoteData?.quote) {
            setLastQuote(quoteData.quote);
        }
    }, [quoteData]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (symbol.trim()) {
            setCurrentSymbol(symbol.trim().toUpperCase());
        }
    };

    const manualRefresh = () => {
        if (currentSymbol) {
            // Force re-fetch by changing the dependency
            setCurrentSymbol('');
            setTimeout(() => setCurrentSymbol(currentSymbol), 100);
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

    const getPriceChangeClass = (current: number | null, previous: number | null): string => {
        if (!current || !previous) return '';
        if (current > previous) return styles.priceUp;
        if (current < previous) return styles.priceDown;
        return '';
    };

    const calculateChange = (current: number | null, close: number | null) => {
        if (!current || !close) return { change: 0, changePercent: 0 };
        const change = current - close;
        const changePercent = (change / close) * 100;
        return { change, changePercent };
    };

    const currentQuote = quoteData?.quote;
    const change = currentQuote ? calculateChange(currentQuote.last, currentQuote.close) : { change: 0, changePercent: 0 };

    return (
        <div className={styles.marketQuote}>
            <div className={styles.quoteHeader}>
                <h3>📊 Live Market Quote</h3>
                <div className={styles.autoRefreshControls}>
                    <label className={styles.autoRefreshLabel}>
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        Auto-refresh
                    </label>
                    {autoRefresh && (
                        <select
                            value={refreshInterval}
                            onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            className={styles.intervalSelect}
                        >
                            <option value={1}>1s</option>
                            <option value={3}>3s</option>
                            <option value={5}>5s</option>
                            <option value={10}>10s</option>
                        </select>
                    )}
                </div>
            </div>

            <form onSubmit={handleSearch} className={styles.quoteSearch}>
                <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter symbol (e.g., AAPL, TSLA, GOOGL)"
                    maxLength={10}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Get Quote'}
                </button>
            </form>

            {loading && (
                <div className={styles.loadingIndicator}>
                    <div className={styles.spinner}></div>
                    <span>Fetching live market data...</span>
                </div>
            )}

            {error && (
                <div className={styles.errorMessage}>
                    ⚠️ Error: {error}
                </div>
            )}

            {currentQuote && (
                <div className={styles.quoteDisplay}>
                    <div className={styles.quoteMainHeader}>
                        <div className={styles.symbolInfo}>
                            <h4>{currentQuote.symbol}</h4>
                            <div className={styles.priceChange}>
                                <span className={`${styles.lastPrice} ${getPriceChangeClass(currentQuote.last, lastQuote?.last || null)}`}>
                                    {formatPrice(currentQuote.last)}
                                </span>
                                <span className={`${styles.change} ${change.change >= 0 ? styles.positive : styles.negative}`}>
                                    {change.change >= 0 ? '+' : ''}{change.change.toFixed(2)} ({change.changePercent.toFixed(2)}%)
                                </span>
                            </div>
                        </div>
                        <div className={styles.statusIndicators}>
                            <span className={`${styles.dataMode} ${isLive ? styles.liveMode : styles.simMode}`}>
                                {isLive ? '🔴 LIVE DATA' : '🟡 DEMO DATA'}
                            </span>
                            <span className={styles.quoteSource}>
                                {quoteData.source === 'mock' ? '📋 Mock' : '🔗 API'}
                            </span>
                            {autoRefresh && (
                                <span className={styles.liveIndicator}>
                                    <span className={styles.liveDot}></span>
                                    AUTO
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.quoteGrid}>
                        <div className={styles.quoteItem}>
                            <label>Bid:</label>
                            <span className={`${styles.price} ${styles.bid} ${getPriceChangeClass(currentQuote.bid, lastQuote?.bid || null)}`}>
                                {formatPrice(currentQuote.bid)}
                            </span>
                        </div>

                        <div className={styles.quoteItem}>
                            <label>Ask:</label>
                            <span className={`${styles.price} ${styles.ask} ${getPriceChangeClass(currentQuote.ask, lastQuote?.ask || null)}`}>
                                {formatPrice(currentQuote.ask)}
                            </span>
                        </div>

                        <div className={styles.quoteItem}>
                            <label>Close:</label>
                            <span className={styles.price}>{formatPrice(currentQuote.close)}</span>
                        </div>

                        <div className={styles.quoteItem}>
                            <label>Volume:</label>
                            <span className={getPriceChangeClass(currentQuote.volume, lastQuote?.volume || null)}>
                                {formatVolume(currentQuote.volume)}
                            </span>
                        </div>

                        <div className={styles.quoteItem}>
                            <label>Exchange:</label>
                            <span>{currentQuote.exchange}</span>
                        </div>

                        <div className={styles.quoteItem}>
                            <label>Spread:</label>
                            <span>
                                {currentQuote.bid && currentQuote.ask
                                    ? `$${(currentQuote.ask - currentQuote.bid).toFixed(2)}`
                                    : 'N/A'
                                }
                            </span>
                        </div>
                    </div>

                    {currentQuote.error && (
                        <div className={styles.quoteNote}>
                            ℹ️ {currentQuote.error}
                        </div>
                    )}

                    <div className={styles.quoteFooter}>
                        <small>Last updated: {new Date(currentQuote.lastUpdate).toLocaleTimeString()}</small>
                        <button onClick={manualRefresh} disabled={loading}>
                            🔄 Refresh
                        </button>
                    </div>
                </div>
            )}

            {!currentQuote && !loading && !error && (
                <div className={styles.welcomeMessage}>
                    <h4>🚀 Try these popular symbols:</h4>
                    <div className={styles.popularSymbols}>
                        {['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'NVDA', 'META'].map(sym => (
                            <button
                                key={sym}
                                onClick={() => {
                                    setSymbol(sym);
                                    setCurrentSymbol(sym);
                                }}
                                className={styles.symbolButton}
                            >
                                {sym}
                            </button>
                        ))}
                    </div>
                    <p>Enable auto-refresh to see live price movements!</p>
                </div>
            )}
        </div>
    );
} 