import React from 'react';

const Header: React.FC = () => {
    return (
        <header style={{
            backgroundColor: '#1a1a1a',
            color: 'white',
            padding: '1rem 2rem',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                    📈 Tactical Trader
                </h1>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>
                    AI-Powered Day Trading Bot
                </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#333',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                }}>
                    Paper Trading
                </span>
                <span style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#dc3545',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                }}>
                    Disconnected
                </span>
            </div>
        </header>
    );
};

export default Header; 