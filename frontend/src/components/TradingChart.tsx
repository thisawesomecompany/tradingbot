import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { createChart, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, LineData, Time } from 'lightweight-charts';
import { useDataMode } from '../contexts/DataModeContext';
import api from '../services/api';
import styles from './TradingChart.module.css';

interface BarData {
    time: Time;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface TradingChartProps {
    symbol?: string;
    onSymbolChange?: (symbol: string) => void;
}

export const TradingChart: React.FC<TradingChartProps> = ({
    symbol: propSymbol,
    onSymbolChange
}) => {
    const { isLive } = useDataMode();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
    const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

    const [symbol, setSymbol] = useState(propSymbol || 'SPY');
    const [timeframe, setTimeframe] = useState('5 mins');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<BarData[]>([]);
    const [autoRefresh, setAutoRefresh] = useState(true); // Auto-refresh on by default for trading apps
    const [lastRefresh, setLastRefresh] = useState<string>('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [dataSource, setDataSource] = useState<string>('');
    const [fullHistoricalData, setFullHistoricalData] = useState<BarData[]>([]);
    const [streamingIndex, setStreamingIndex] = useState(0);
    const [isStreaming, setIsStreaming] = useState(false);

    // Stable timeframe mapping - won't recreate on every render
    const timeframeMap = useMemo(() => ({
        '5 mins': '5min',
        '15 mins': '15min',
        '1 hour': '1h',
        '1 day': '1d'
    }), []);

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 500,
            layout: {
                textColor: '#333',
                background: { color: '#ffffff' },
            },
            grid: {
                vertLines: { color: '#e1e1e1' },
                horzLines: { color: '#e1e1e1' },
            },
            rightPriceScale: {
                borderColor: '#cccccc',
                autoScale: false, // Prevent auto-scaling during scrolling
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
                mode: 1, // Normal price scale mode - allows manual scaling but not auto-scaling during scroll
            },
            timeScale: {
                borderColor: '#cccccc',
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                mode: 1,
            },
        });

        chartRef.current = chart;

        // Add candlestick series
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
        candlestickSeriesRef.current = candlestickSeries;

        // Add volume series
        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: 'volume',
        });
        volumeSeriesRef.current = volumeSeries;

        // Configure volume price scale
        chart.priceScale('volume').applyOptions({
            scaleMargins: {
                top: 0.7,
                bottom: 0,
            },
            autoScale: false,
        });

        // Add SMA series
        const smaSeries = chart.addSeries(LineSeries, {
            color: '#ff6b35',
            lineWidth: 2,
            title: 'SMA 50',
        });
        smaSeriesRef.current = smaSeries;

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // Calculate SMA - stable function
    const calculateSMA = useCallback((data: BarData[], period: number = 50): LineData[] => {
        const smaData: LineData[] = [];

        for (let i = period - 1; i < data.length; i++) {
            const sum = data.slice(i - period + 1, i + 1)
                .reduce((acc, bar) => acc + bar.close, 0);
            const sma = sum / period;

            smaData.push({
                time: data[i].time,
                value: Math.round(sma * 100) / 100,
            });
        }

        return smaData;
    }, []);

    // Update chart data smoothly without resetting view
    const updateChart = useCallback((chartData: BarData[], isFullRefresh: boolean = false) => {
        if (!candlestickSeriesRef.current || !volumeSeriesRef.current || !smaSeriesRef.current) {
            return;
        }

        try {
            if (isFullRefresh || isInitialLoad) {
                console.log('📊 Full refresh with', chartData.length, 'data points');

                // Temporarily enable auto-scaling for initial data load
                chartRef.current?.priceScale('right').applyOptions({ autoScale: true });

                // Full refresh - only for initial load or symbol/timeframe change
                candlestickSeriesRef.current.setData(chartData);

                const volumeData = chartData.map(bar => ({
                    time: bar.time,
                    value: bar.volume,
                    color: bar.close >= bar.open ? '#26a69a' : '#ef5350',
                }));
                volumeSeriesRef.current.setData(volumeData);

                const smaData = calculateSMA(chartData);
                smaSeriesRef.current.setData(smaData);

                // Only fit content on initial load
                if (isInitialLoad) {
                    chartRef.current?.timeScale().fitContent();
                    setIsInitialLoad(false);
                }

                // Disable auto-scaling after initial load to prevent scaling during scrolling
                setTimeout(() => {
                    chartRef.current?.priceScale('right').applyOptions({ autoScale: false });
                }, 100);
            } else {
                console.log('🔄 Streaming update - using setData() with', chartData.length, 'points');

                // For streaming, always use setData to avoid time conflicts
                // This prevents the "Cannot update oldest data" error
                candlestickSeriesRef.current.setData(chartData);

                const volumeData = chartData.map(bar => ({
                    time: bar.time,
                    value: bar.volume,
                    color: bar.close >= bar.open ? '#26a69a' : '#ef5350',
                }));
                volumeSeriesRef.current.setData(volumeData);

                const smaData = calculateSMA(chartData);
                smaSeriesRef.current.setData(smaData);

                // Don't fit content during streaming to maintain user's view
            }
        } catch (error) {
            console.error('❌ Chart update error:', error);
            console.log('📊 Data sample causing error:', {
                dataLength: chartData.length,
                firstPoint: chartData[0],
                lastPoint: chartData[chartData.length - 1],
                isFullRefresh
            });
            setError(`Chart update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, [calculateSMA, isInitialLoad]);

    // Load and start streaming historical data
    const loadChartData = useCallback(async (newSymbol: string, newTimeframe: string, isFullRefresh: boolean = false) => {
        // Prevent duplicate requests
        const requestKey = `${newSymbol}-${newTimeframe}`;
        if (loading && lastRefresh === requestKey && !isFullRefresh) {
            return;
        }

        // Only show loading for initial loads or symbol changes
        if (isFullRefresh || isInitialLoad) {
            setLoading(true);
        }
        setError(null);
        setLastRefresh(requestKey);

        try {
            // Get historical data from backend API
            const mappedTimeframe = timeframeMap[newTimeframe as keyof typeof timeframeMap] || '5min';
            const response = await api.getHistoricalData(newSymbol, mappedTimeframe);
            const apiData = response.bars;

            // Track data source
            setDataSource(response.source || 'unknown');

            // Convert API data to chart format
            const chartData: BarData[] = apiData.map(bar => {
                const timeValue = typeof bar.time === 'number' ? bar.time : Number(bar.time);
                return {
                    time: timeValue as Time,
                    open: bar.open,
                    high: bar.high,
                    low: bar.low,
                    close: bar.close,
                    volume: bar.volume,
                };
            });

            if (isFullRefresh || isInitialLoad) {
                // Store full dataset for streaming
                setFullHistoricalData(chartData);

                // Start with initial portion of data (last 10 bars)
                const initialCount = Math.min(10, chartData.length);
                const initialData = chartData.slice(-initialCount);
                setData(initialData);
                setStreamingIndex(chartData.length - initialCount);

                updateChart(initialData, true);
                setIsStreaming(chartData.length > initialCount);

                console.log('🚀 Starting stream with', initialData.length, 'initial bars, will stream', chartData.length - initialCount, 'more');
            } else {
                // Progressive streaming - add one more bar from historical data
                if (streamingIndex < fullHistoricalData.length) {
                    const currentEndIndex = data.length + streamingIndex;
                    const nextData = fullHistoricalData.slice(0, currentEndIndex + 1);

                    console.log('📈 Streaming bar', currentEndIndex + 1, 'of', fullHistoricalData.length);

                    setData(nextData);
                    updateChart(nextData, false);
                    setStreamingIndex(prev => prev + 1);

                    // Stop streaming when we've shown all data
                    if (currentEndIndex + 1 >= fullHistoricalData.length) {
                        setIsStreaming(false);
                        console.log('✅ Streaming complete - all historical data shown');
                    }
                }
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load chart data');
        } finally {
            if (isFullRefresh || isInitialLoad) {
                setLoading(false);
            }
        }
    }, [timeframeMap, updateChart, loading, lastRefresh, isInitialLoad, streamingIndex, fullHistoricalData]);

    // Handle symbol change
    const handleSymbolChange = useCallback((newSymbol: string) => {
        if (newSymbol === symbol) return; // Prevent unnecessary updates

        setSymbol(newSymbol);
        setIsInitialLoad(true); // Reset for new symbol
        setIsStreaming(false); // Stop current streaming
        setStreamingIndex(0); // Reset streaming
        setFullHistoricalData([]); // Clear old data

        if (onSymbolChange) {
            onSymbolChange(newSymbol);
        }
        loadChartData(newSymbol, timeframe, true); // Full refresh for new symbol
    }, [symbol, timeframe, loadChartData, onSymbolChange]);

    // Handle timeframe change
    const handleTimeframeChange = useCallback((newTimeframe: string) => {
        if (newTimeframe === timeframe) return; // Prevent unnecessary updates

        setTimeframe(newTimeframe);
        setIsInitialLoad(true); // Reset for new timeframe
        setIsStreaming(false); // Stop current streaming
        setStreamingIndex(0); // Reset streaming
        setFullHistoricalData([]); // Clear old data

        loadChartData(symbol, newTimeframe, true); // Full refresh for new timeframe
    }, [symbol, timeframe, loadChartData]);

    // Auto-refresh functionality - streams in historical data to simulate real-time
    useEffect(() => {
        if (!autoRefresh || !isStreaming) return;

        const interval = setInterval(() => {
            // Stream in the next historical data point if available
            if (streamingIndex < fullHistoricalData.length) {
                loadChartData(symbol, timeframe, false); // Incremental streaming update
            } else {
                // When we've streamed all historical data, simulate live updates on the last candle
                if (fullHistoricalData.length > 0) {
                    const lastBar = fullHistoricalData[fullHistoricalData.length - 1];
                    // Add small random variation to simulate live trading on current candle
                    const variation = 0.001; // 0.1% variation
                    const randomChange = (Math.random() - 0.5) * variation;

                    const updatedBar = {
                        ...lastBar,
                        high: Math.max(lastBar.high, lastBar.close * (1 + randomChange)),
                        low: Math.min(lastBar.low, lastBar.close * (1 + randomChange)),
                        close: lastBar.close * (1 + randomChange),
                        volume: lastBar.volume + Math.floor(Math.random() * 1000),
                    };

                    const updatedData = [...fullHistoricalData.slice(0, -1), updatedBar];
                    setData(updatedData);
                    updateChart(updatedData, false);
                }
            }
        }, 2000); // Stream every 2 seconds for realistic pace

        return () => clearInterval(interval);
    }, [autoRefresh, isStreaming, symbol, timeframe, loadChartData, streamingIndex, fullHistoricalData, updateChart]);

    // Keyboard hotkeys
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.shiftKey) {
                switch (event.key.toUpperCase()) {
                    case 'O': // Buy order
                        console.log('🟢 Buy order hotkey triggered for', symbol);
                        // TODO: Implement buy order
                        event.preventDefault();
                        break;
                    case 'P': // Sell order
                        console.log('🔴 Sell order hotkey triggered for', symbol);
                        // TODO: Implement sell order
                        event.preventDefault();
                        break;
                    case 'S': // Screenshot
                        console.log('📸 Screenshot hotkey triggered');
                        takeScreenshot();
                        event.preventDefault();
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [symbol]);

    // Take screenshot
    const takeScreenshot = useCallback(() => {
        if (chartRef.current && chartContainerRef.current) {
            try {
                const canvas = chartContainerRef.current.querySelector('canvas');
                if (canvas) {
                    const link = document.createElement('a');
                    link.download = `${symbol}_${timeframe}_${new Date().toISOString().slice(0, 19)}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                }
            } catch (err) {
                console.error('Screenshot failed:', err);
            }
        }
    }, [symbol, timeframe]);

    // Load initial data - only when symbol or timeframe actually changes
    useEffect(() => {
        loadChartData(symbol, timeframe, true);
    }, [symbol, timeframe]); // Removed loadChartData from dependencies to prevent loops

    return (
        <div className={styles.chartContainer}>
            {/* Chart Controls */}
            <div className={styles.chartControls}>
                <div className={styles.controlGroup}>
                    <span className={`${styles.dataMode} ${isLive ? styles.liveMode : styles.simMode}`}>
                        {isLive ? '🔴 LIVE DATA MODE' : '🟡 DEMO DATA MODE'}
                    </span>
                </div>

                <div className={styles.controlGroup}>
                    <label>Symbol:</label>
                    <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleSymbolChange(symbol)}
                        className={styles.symbolInput}
                        maxLength={10}
                    />
                    <button
                        onClick={() => handleSymbolChange(symbol)}
                        disabled={loading}
                        className={styles.loadButton}
                    >
                        Load
                    </button>
                </div>

                <div className={styles.controlGroup}>
                    <label>Timeframe:</label>
                    <select
                        value={timeframe}
                        onChange={(e) => handleTimeframeChange(e.target.value)}
                        disabled={loading}
                        className={styles.timeframeSelect}
                    >
                        <option value="5 mins">5 minutes</option>
                        <option value="15 mins">15 minutes</option>
                        <option value="1 hour">1 hour</option>
                        <option value="1 day">1 day</option>
                    </select>
                </div>

                <div className={styles.controlGroup}>
                    <label>
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        {isStreaming ? 'Streaming (2s)' : 'Auto-refresh (2s)'}
                    </label>
                    {autoRefresh && (
                        <span className={styles.liveIndicator}>
                            <span className={styles.liveDot}></span>
                            {isStreaming ? 'STREAMING' : 'LIVE'}
                        </span>
                    )}
                </div>

                <div className={styles.controlGroup}>
                    <span className={styles.dataSource}>
                        📊 {dataSource === 'alphavantage' ? 'Real Data (Alpha Vantage)' :
                            dataSource === 'yahoo' ? 'Real Data (Yahoo Finance)' :
                                dataSource === 'mock' ? 'Simulated Data' : 'Loading...'}
                    </span>
                    {isStreaming && (
                        <span className={styles.streamingProgress}>
                            {streamingIndex}/{fullHistoricalData.length}
                        </span>
                    )}
                </div>

                <div className={styles.controlGroup}>
                    <button
                        onClick={takeScreenshot}
                        className={styles.screenshotButton}
                        title="Take screenshot (Shift+S)"
                    >
                        📸 Screenshot
                    </button>
                </div>

                <div className={styles.controlGroup}>
                    <button
                        onClick={() => {
                            console.log('🧪 TEST MODE - Current State:');
                            console.log('Data length:', data.length);
                            console.log('Full historical length:', fullHistoricalData.length);
                            console.log('Streaming index:', streamingIndex);
                            console.log('Is streaming:', isStreaming);
                            console.log('Data source:', dataSource);
                            console.log('Sample data points:', data.slice(0, 3));
                        }}
                        className={styles.testButton}
                        title="Debug current state"
                    >
                        🧪 Test
                    </button>
                </div>

                <div className={styles.loadingIndicator}>
                    {loading && <span className={styles.spinner}>⟳</span>}
                </div>
            </div>

            {/* Chart */}
            <div className={styles.chartWrapper}>
                <div ref={chartContainerRef} className={styles.chart} />

                {error && (
                    <div className={styles.errorOverlay}>
                        ⚠️ Error: {error}
                    </div>
                )}

                {/* Only show loading overlay for initial loads, not for auto-refresh */}
                {loading && isInitialLoad && (
                    <div className={styles.loadingOverlay}>
                        <div className={styles.loadingSpinner}>⟳</div>
                        <span>Loading chart data...</span>
                    </div>
                )}
            </div>

            {/* Trading Hotkeys Info */}
            <div className={styles.hotkeyInfo}>
                <small>
                    <strong>Hotkeys:</strong> Shift+O (Buy) | Shift+P (Sell) | Shift+S (Screenshot)
                </small>
            </div>
        </div>
    );
}; 