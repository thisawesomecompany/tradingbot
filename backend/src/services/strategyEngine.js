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
exports.StrategyEngine = exports.VWAPStrategy = void 0;
class VWAPStrategy {
    constructor(config) {
        this.barData = [];
        this.vwapData = [];
        this.currentPosition = null;
        this.trades = [];
        this.isActive = false;
        this.config = config;
    }
    // Calculate VWAP for the given period
    calculateVWAP(bars, period) {
        if (bars.length < period)
            return 0;
        const recentBars = bars.slice(-period);
        let totalVolume = 0;
        let totalVolumePrice = 0;
        for (const bar of recentBars) {
            const typicalPrice = (bar.high + bar.low + bar.close) / 3;
            totalVolumePrice += typicalPrice * bar.volume;
            totalVolume += bar.volume;
        }
        return totalVolume > 0 ? totalVolumePrice / totalVolume : 0;
    }
    // Check for entry signal (price crosses above VWAP)
    checkEntrySignal(currentPrice, previousVWAP, currentVWAP) {
        // Entry: Current price is above VWAP and previous bar was below VWAP (crossover)
        return currentPrice > currentVWAP && this.barData.length > 1 &&
            this.barData[this.barData.length - 2].close <= previousVWAP;
    }
    // Check for exit signal (price crosses below VWAP or hits stop/target)
    checkExitSignal(currentPrice, currentVWAP) {
        if (!this.currentPosition)
            return false;
        // Exit conditions:
        // 1. Price crosses below VWAP
        // 2. Stop loss hit
        // 3. Take profit hit
        return currentPrice < currentVWAP ||
            currentPrice <= this.currentPosition.stopLoss ||
            currentPrice >= this.currentPosition.takeProfit;
    }
    // Calculate position size based on risk management
    calculatePositionSize(entryPrice, stopLoss) {
        const riskPerShare = Math.abs(entryPrice - stopLoss);
        const shares = Math.floor(this.config.riskPerTrade / riskPerShare);
        // Apply max position size limit (would need account value for proper calculation)
        const maxShares = Math.floor(10000 / entryPrice); // Assuming $10k account for now
        const maxAllowedShares = Math.floor(maxShares * (this.config.maxPositionSize / 100));
        return Math.min(shares, maxAllowedShares);
    }
    // Process new bar data and check for signals
    processBar(bar) {
        this.barData.push(bar);
        // Keep only necessary data (e.g., last 200 bars)
        if (this.barData.length > 200) {
            this.barData.shift();
        }
        const currentVWAP = this.calculateVWAP(this.barData, this.config.vwapPeriod);
        this.vwapData.push(currentVWAP);
        if (this.vwapData.length > 200) {
            this.vwapData.shift();
        }
        const currentPrice = bar.close;
        const previousVWAP = this.vwapData.length > 1 ? this.vwapData[this.vwapData.length - 2] : currentVWAP;
        // Check for entry signal (no current position)
        if (!this.currentPosition && this.isActive && this.checkEntrySignal(currentPrice, previousVWAP, currentVWAP)) {
            const stopLoss = currentPrice - (this.config.riskPerTrade / 100); // Simple stop loss calculation
            const takeProfit = currentPrice + (this.config.riskPerTrade * this.config.takeProfitMultiplier / 100);
            const quantity = this.calculatePositionSize(currentPrice, stopLoss);
            if (quantity > 0) {
                const trade = {
                    id: `trade_${Date.now()}`,
                    symbol: this.config.symbol,
                    side: 'BUY',
                    quantity,
                    entryPrice: currentPrice,
                    stopLoss,
                    takeProfit,
                    timestamp: bar.time,
                    status: 'OPEN',
                    strategy: 'VWAP'
                };
                this.currentPosition = trade;
                this.trades.push(trade);
                return { signal: 'ENTRY', trade };
            }
        }
        // Check for exit signal (has current position)
        if (this.currentPosition && this.checkExitSignal(currentPrice, currentVWAP)) {
            const exitPrice = currentPrice;
            const pnl = (exitPrice - this.currentPosition.entryPrice) * this.currentPosition.quantity;
            const rMultiple = pnl / this.config.riskPerTrade;
            this.currentPosition.exitPrice = exitPrice;
            this.currentPosition.exitTimestamp = bar.time;
            this.currentPosition.status = 'CLOSED';
            this.currentPosition.pnl = pnl;
            this.currentPosition.rMultiple = rMultiple;
            const trade = Object.assign({}, this.currentPosition);
            this.currentPosition = null;
            return { signal: 'EXIT', trade };
        }
        return { signal: 'NONE' };
    }
    // Strategy control methods
    start() {
        this.isActive = true;
        console.log(`🚀 VWAP Strategy started for ${this.config.symbol}`);
    }
    stop() {
        this.isActive = false;
        console.log(`⏹️ VWAP Strategy stopped for ${this.config.symbol}`);
    }
    getStatus() {
        return {
            active: this.isActive,
            position: this.currentPosition,
            vwap: this.vwapData[this.vwapData.length - 1] || 0
        };
    }
    getTrades() {
        return [...this.trades];
    }
    getMetrics() {
        const closedTrades = this.trades.filter(t => t.status === 'CLOSED');
        const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
        const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);
        const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const avgWin = winningTrades.length > 0 ?
            winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length : 0;
        const avgLoss = losingTrades.length > 0 ?
            Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length) : 0;
        return {
            totalTrades: closedTrades.length,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
            avgWin,
            avgLoss,
            profitFactor: avgLoss > 0 ? avgWin / avgLoss : 0,
            totalPnL,
            maxDrawdown: 0 // TODO: Calculate actual max drawdown
        };
    }
}
exports.VWAPStrategy = VWAPStrategy;
class StrategyEngine {
    constructor(ibServiceInstance) {
        this.strategies = new Map();
        this.isRunning = false;
        this.ibService = ibServiceInstance;
    }
    // Add a new strategy
    addStrategy(symbol, config) {
        const strategy = new VWAPStrategy(config);
        this.strategies.set(symbol, strategy);
        console.log(`📈 Added VWAP strategy for ${symbol}`);
    }
    // Remove a strategy
    removeStrategy(symbol) {
        const strategy = this.strategies.get(symbol);
        if (strategy) {
            strategy.stop();
            this.strategies.delete(symbol);
            console.log(`🗑️ Removed strategy for ${symbol}`);
        }
    }
    // Start all strategies
    startAll() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isRunning = true;
            for (const strategy of this.strategies.values()) {
                strategy.start();
            }
            console.log('🚀 Strategy Engine started - all strategies active');
        });
    }
    // Stop all strategies
    stopAll() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isRunning = false;
            for (const strategy of this.strategies.values()) {
                strategy.stop();
            }
            console.log('⏹️ Strategy Engine stopped - all strategies deactivated');
        });
    }
    // Process market data for all strategies
    processMarketData(symbol, bar) {
        const strategy = this.strategies.get(symbol);
        if (strategy) {
            const result = strategy.processBar(bar);
            if (result.signal === 'ENTRY' && result.trade) {
                console.log(`📈 ENTRY SIGNAL for ${symbol}:`, result.trade);
                this.executeOrder(result.trade);
            }
            else if (result.signal === 'EXIT' && result.trade) {
                console.log(`📉 EXIT SIGNAL for ${symbol}:`, result.trade);
                this.executeOrder(Object.assign(Object.assign({}, result.trade), { side: 'SELL' }));
            }
        }
    }
    // Execute order through IB API
    executeOrder(trade) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // TODO: Implement actual order execution through IBService
                console.log(`🎯 Executing ${trade.side} order for ${trade.symbol}: ${trade.quantity} shares at $${trade.entryPrice || trade.exitPrice}`);
                // This would call IBService to place the actual order
                // await this.ibService.placeOrder(trade);
            }
            catch (error) {
                console.error(`❌ Order execution failed for ${trade.symbol}:`, error);
            }
        });
    }
    // Get status of all strategies
    getStrategiesStatus() {
        const status = {};
        for (const [symbol, strategy] of this.strategies.entries()) {
            status[symbol] = Object.assign(Object.assign({}, strategy.getStatus()), { metrics: strategy.getMetrics(), trades: strategy.getTrades() });
        }
        return status;
    }
    isEngineRunning() {
        return this.isRunning;
    }
}
exports.StrategyEngine = StrategyEngine;
