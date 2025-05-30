import React, { useState } from 'react';
import { MarketQuote } from '../components/MarketQuote';
import { TradingChart } from '../components/TradingChart';
import { StrategyPanel } from '../components/StrategyPanel';

const Trading: React.FC = () => {
    const [selectedSymbol, setSelectedSymbol] = useState('SPY');

    return (
        <div>
            <h1 style={{
                margin: '1rem',
                fontSize: '1.5rem',
                color: '#333',
                borderBottom: '2px solid #007bff',
                paddingBottom: '0.5rem'
            }}>
                📈 Trading
            </h1>

            {/* Trading Chart - Main Feature */}
            <TradingChart
                symbol={selectedSymbol}
                onSymbolChange={setSelectedSymbol}
            />

            {/* Automated Trading Strategies Panel */}
            <StrategyPanel />

            {/* Market Quote Panel */}
            <MarketQuote />

            {/* Trading Controls Section */}
            <div style={{
                margin: '1rem',
                padding: '1rem',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px'
            }}>
                <h3>🎯 Manual Trading Controls</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginTop: '15px'
                }}>
                    <button
                        style={{
                            padding: '12px 20px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#218838'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#28a745'}
                        onClick={() => {
                            console.log('🟢 Buy order for', selectedSymbol);
                            alert(`Buy order for ${selectedSymbol} (Demo mode)`);
                        }}
                    >
                        🟢 BUY {selectedSymbol}
                    </button>

                    <button
                        style={{
                            padding: '12px 20px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#c82333'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#dc3545'}
                        onClick={() => {
                            console.log('🔴 Sell order for', selectedSymbol);
                            alert(`Sell order for ${selectedSymbol} (Demo mode)`);
                        }}
                    >
                        🔴 SELL {selectedSymbol}
                    </button>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px',
                        background: 'white',
                        border: '1px solid #ced4da',
                        borderRadius: '6px'
                    }}>
                        <label style={{ fontWeight: '500', minWidth: '80px' }}>Quantity:</label>
                        <input
                            type="number"
                            defaultValue={100}
                            min={1}
                            style={{
                                flex: 1,
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px',
                        background: 'white',
                        border: '1px solid #ced4da',
                        borderRadius: '6px'
                    }}>
                        <label style={{ fontWeight: '500', minWidth: '80px' }}>Order Type:</label>
                        <select
                            style={{
                                flex: 1,
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '14px',
                                background: 'white'
                            }}
                        >
                            <option value="market">Market</option>
                            <option value="limit">Limit</option>
                            <option value="stop">Stop</option>
                            <option value="stop-limit">Stop Limit</option>
                        </select>
                    </div>
                </div>

                <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    background: '#e7f3ff',
                    border: '1px solid #b8daff',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#495057'
                }}>
                    <strong>📝 Note:</strong> This is a demo interface. Manual trading functionality will be connected to Interactive Brokers in production.
                    Use keyboard shortcuts: <strong>Shift+O</strong> (Buy) | <strong>Shift+P</strong> (Sell) | <strong>Shift+S</strong> (Screenshot)
                </div>
            </div>
        </div>
    );
};

export default Trading; 