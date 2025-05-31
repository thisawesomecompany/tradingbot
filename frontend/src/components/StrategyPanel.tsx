import React, { useState, useEffect } from 'react';
import { useDataMode } from '../contexts/DataModeContext';
import styles from './StrategyPanel.module.css';

interface StrategyConfig {
    enabled: boolean;
    symbol: string;
    riskPerTrade: number;
    maxPositionSize: number;
    vwapPeriod: number;
    stopLossMultiplier: number;
    takeProfitMultiplier: number;
}

interface Trade {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    entryPrice: number;
    exitPrice?: number;
    stopLoss: number;
    takeProfit: number;
    timestamp: number;
    exitTimestamp?: number;
    status: 'OPEN' | 'CLOSED' | 'CANCELLED';
    strategy: string;
    pnl?: number;
    rMultiple?: number;
}

interface StrategyMetrics {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
    totalPnL: number;
    maxDrawdown: number;
}

interface StrategyStatus {
    active: boolean;
    position: Trade | null;
    vwap: number;
    metrics: StrategyMetrics;
    trades: Trade[];
}

export const StrategyPanel: React.FC = () => {
    const { mode, isLive, isSimulated } = useDataMode();
    const [engineRunning, setEngineRunning] = useState(false);
    const [strategies, setStrategies] = useState<{ [symbol: string]: StrategyStatus }>({});
    const [newSymbol, setNewSymbol] = useState('SPY');
    const [config] = useState<StrategyConfig>({
        enabled: true,
        symbol: 'SPY',
        riskPerTrade: 100,
        maxPositionSize: 25,
        vwapPeriod: 20,
        stopLossMultiplier: 1,
        takeProfitMultiplier: 2
    });

    // Initialize demo strategy when in simulated mode
    useEffect(() => {
        if (isSimulated) {
            // Initialize with demo SPY strategy
            const demoStrategy: StrategyStatus = {
                active: false,
                position: null,
                vwap: 485.50,
                metrics: {
                    totalTrades: 0,
                    winningTrades: 0,
                    losingTrades: 0,
                    winRate: 0,
                    avgWin: 0,
                    avgLoss: 0,
                    profitFactor: 0,
                    totalPnL: 0,
                    maxDrawdown: 0
                },
                trades: []
            };
            setStrategies({ 'SPY': demoStrategy });
        } else {
            // In live mode, clear simulated strategies
            setStrategies({});
            setEngineRunning(false);
        }
    }, [mode, isSimulated]);

    // Simulate trading activity when engine is running (only in simulated mode)
    useEffect(() => {
        if (!engineRunning || !isSimulated) return;

        const interval = setInterval(() => {
            setStrategies(prev => {
                const updated = { ...prev };

                for (const [symbol, strategy] of Object.entries(updated)) {
                    if (strategy.active) {
                        // Simulate VWAP changes
                        const vwapChange = (Math.random() - 0.5) * 0.02; // ±1% change
                        strategy.vwap = Math.max(strategy.vwap * (1 + vwapChange), 1);

                        // Randomly generate trading signals (10% chance every 5 seconds)
                        if (Math.random() < 0.1) {
                            if (!strategy.position) {
                                // Generate entry signal
                                const entryPrice = strategy.vwap * (1 + (Math.random() - 0.5) * 0.005);
                                const stopLoss = entryPrice * 0.99;
                                const takeProfit = entryPrice * 1.02;

                                const trade: Trade = {
                                    id: `trade_${Date.now()}`,
                                    symbol,
                                    side: 'BUY',
                                    quantity: Math.floor(config.riskPerTrade / Math.abs(entryPrice - stopLoss)),
                                    entryPrice,
                                    stopLoss,
                                    takeProfit,
                                    timestamp: Date.now(),
                                    status: 'OPEN',
                                    strategy: 'VWAP'
                                };

                                strategy.position = trade;
                                strategy.trades.push(trade);
                                console.log(`📈 Demo ENTRY signal for ${symbol}:`, trade);
                            } else if (Math.random() < 0.3) {
                                // Generate exit signal
                                const exitPrice = strategy.vwap * (1 + (Math.random() - 0.5) * 0.01);
                                const pnl = (exitPrice - strategy.position.entryPrice) * strategy.position.quantity;

                                strategy.position.exitPrice = exitPrice;
                                strategy.position.exitTimestamp = Date.now();
                                strategy.position.status = 'CLOSED';
                                strategy.position.pnl = pnl;
                                strategy.position.rMultiple = pnl / config.riskPerTrade;

                                console.log(`📉 Demo EXIT signal for ${symbol}:`, strategy.position);

                                // Update metrics
                                const closedTrades = strategy.trades.filter(t => t.status === 'CLOSED');
                                const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);

                                strategy.metrics = {
                                    totalTrades: closedTrades.length,
                                    winningTrades: winningTrades.length,
                                    losingTrades: closedTrades.length - winningTrades.length,
                                    winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
                                    avgWin: winningTrades.length > 0 ?
                                        winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length : 0,
                                    avgLoss: 0, // Calculate if needed
                                    profitFactor: 0, // Calculate if needed  
                                    totalPnL: closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0),
                                    maxDrawdown: 0 // Calculate if needed
                                };

                                strategy.position = null;
                            }
                        }
                    }
                }

                return updated;
            });
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [engineRunning, isSimulated, config.riskPerTrade]);

    const handleAddStrategy = () => {
        if (isSimulated) {
            const newStrategy: StrategyStatus = {
                active: false,
                position: null,
                vwap: 100 + Math.random() * 300, // Random VWAP
                metrics: {
                    totalTrades: 0,
                    winningTrades: 0,
                    losingTrades: 0,
                    winRate: 0,
                    avgWin: 0,
                    avgLoss: 0,
                    profitFactor: 0,
                    totalPnL: 0,
                    maxDrawdown: 0
                },
                trades: []
            };

            setStrategies(prev => ({
                ...prev,
                [newSymbol.toUpperCase()]: newStrategy
            }));

            console.log(`📈 Added demo strategy for ${newSymbol.toUpperCase()}`);
        }
    };

    const handleRemoveStrategy = (symbol: string) => {
        setStrategies(prev => {
            const updated = { ...prev };
            delete updated[symbol];
            return updated;
        });
        console.log(`🗑️ Removed strategy for ${symbol}`);
    };

    const handleStartEngine = () => {
        setEngineRunning(true);
        setStrategies(prev => {
            const updated = { ...prev };
            for (const strategy of Object.values(updated)) {
                strategy.active = true;
            }
            return updated;
        });
        console.log('🚀 Demo Strategy Engine started');
    };

    const handleStopEngine = () => {
        setEngineRunning(false);
        setStrategies(prev => {
            const updated = { ...prev };
            for (const strategy of Object.values(updated)) {
                strategy.active = false;
            }
            return updated;
        });
        console.log('⏹️ Demo Strategy Engine stopped');
    };

    return (
        <div className={styles.strategyPanel}>
            <div className={styles.header}>
                <h2>🤖 Automated Trading Strategies</h2>
                <div className={styles.engineStatus}>
                    <span className={`${styles.statusIndicator} ${engineRunning ? styles.running : styles.stopped}`}>
                        {engineRunning ? '🟢 Running' : '🔴 Stopped'}
                    </span>
                    <span className={`${styles.dataMode} ${isLive ? styles.liveMode : styles.simMode}`}>
                        {isLive ? '🔴 LIVE MODE' : '🟡 DEMO MODE'}
                    </span>
                </div>
            </div>

            {isLive && (
                <div className={styles.liveWarning}>
                    ⚠️ <strong>LIVE MODE ACTIVE:</strong> Strategies will place real trades when automation is enabled!
                </div>
            )}

            {isSimulated && (
                <div className={styles.demoNotice}>
                    📋 <strong>DEMO MODE:</strong> Safe testing environment - no real trades will be executed.
                </div>
            )}

            <div className={styles.controls}>
                <div className={styles.engineControls}>
                    <button
                        onClick={handleStartEngine}
                        disabled={engineRunning}
                        className={styles.startButton}
                    >
                        🚀 Start All Strategies
                    </button>
                    <button
                        onClick={handleStopEngine}
                        disabled={!engineRunning}
                        className={styles.stopButton}
                    >
                        ⏹️ Stop All Strategies
                    </button>
                </div>

                <div className={styles.addStrategy}>
                    <input
                        type="text"
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                        placeholder="Symbol (e.g., AAPL)"
                        className={styles.symbolInput}
                        maxLength={10}
                    />
                    <button onClick={handleAddStrategy} className={styles.addButton}>
                        📈 Add VWAP Strategy
                    </button>
                </div>
            </div>

            <div className={styles.strategiesList}>
                {Object.entries(strategies).map(([symbol, strategy]) => (
                    <div key={symbol} className={styles.strategyCard}>
                        <div className={styles.strategyHeader}>
                            <h3>{symbol} - VWAP Strategy</h3>
                            <div className={styles.strategyStatus}>
                                <span className={`${styles.activeIndicator} ${strategy.active ? styles.active : styles.inactive}`}>
                                    {strategy.active ? '✅ Active' : '⏸️ Inactive'}
                                </span>
                                <button
                                    onClick={() => handleRemoveStrategy(symbol)}
                                    className={styles.removeButton}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>

                        <div className={styles.strategyInfo}>
                            <div className={styles.infoItem}>
                                <span>VWAP:</span>
                                <span>${strategy.vwap.toFixed(2)}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span>Position:</span>
                                <span>{strategy.position ?
                                    `${strategy.position.side} ${strategy.position.quantity} @ $${strategy.position.entryPrice.toFixed(2)}`
                                    : 'None'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span>Total Trades:</span>
                                <span>{strategy.metrics.totalTrades}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span>Win Rate:</span>
                                <span>{strategy.metrics.winRate.toFixed(1)}%</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span>Total P&L:</span>
                                <span className={strategy.metrics.totalPnL >= 0 ? styles.profit : styles.loss}>
                                    ${strategy.metrics.totalPnL.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {strategy.trades.length > 0 && (
                            <div className={styles.recentTrades}>
                                <h4>Recent Trades</h4>
                                <div className={styles.tradesList}>
                                    {strategy.trades.slice(-3).reverse().map(trade => (
                                        <div key={trade.id} className={styles.trade}>
                                            <span>{trade.side}</span>
                                            <span>{trade.quantity}</span>
                                            <span>${trade.entryPrice.toFixed(2)}</span>
                                            {trade.exitPrice && <span>${trade.exitPrice.toFixed(2)}</span>}
                                            {trade.pnl !== undefined && (
                                                <span className={trade.pnl >= 0 ? styles.profit : styles.loss}>
                                                    ${trade.pnl.toFixed(2)}
                                                </span>
                                            )}
                                            <span className={styles.status}>{trade.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {Object.keys(strategies).length === 0 && (
                <div className={styles.emptyState}>
                    <p>No strategies configured. Add a symbol above to start automated trading.</p>
                </div>
            )}
        </div>
    );
}; 