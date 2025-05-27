import React, { useState } from 'react';
import { MarketQuote } from '../components/MarketQuote';

const Trading: React.FC = () => {
    const [symbol, setSymbol] = useState('AAPL');
    const [quantity, setQuantity] = useState(100);

    return (
        <div>
            <h1 style={{
                margin: '1rem',
                fontSize: '1.5rem',
                color: '#333',
                borderBottom: '2px solid #28a745',
                paddingBottom: '0.5rem'
            }}>
                💰 Trading
            </h1>

            <div style={{
                margin: '1rem',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa'
            }}>
                <h3>Order Entry</h3>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Symbol:
                    </label>
                    <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            width: '200px'
                        }}
                        placeholder="Enter symbol"
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Quantity:
                    </label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            width: '200px'
                        }}
                        min="1"
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                        onClick={() => alert(`Buy ${quantity} shares of ${symbol} (Mock Order)`)}
                    >
                        🟢 BUY
                    </button>

                    <button
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                        onClick={() => alert(`Sell ${quantity} shares of ${symbol} (Mock Order)`)}
                    >
                        🔴 SELL
                    </button>
                </div>
            </div>

            {/* Market Quote Component */}
            <div style={{ margin: '1rem' }}>
                <MarketQuote />
            </div>

            <div style={{
                margin: '1rem',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff3cd'
            }}>
                <h3>⚠️ Paper Trading Mode</h3>
                <p>All orders are simulated. No real money is involved.</p>
                <p>Current Symbol: <strong>{symbol}</strong></p>
                <p>Order Size: <strong>{quantity} shares</strong></p>
            </div>
        </div>
    );
};

export default Trading; 