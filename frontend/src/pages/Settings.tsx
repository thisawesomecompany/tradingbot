import React, { useState } from 'react';

const Settings: React.FC = () => {
    const [apiUrl, setApiUrl] = useState('http://localhost:3001');
    const [refreshInterval, setRefreshInterval] = useState(5);
    const [paperTrading, setPaperTrading] = useState(true);

    return (
        <div>
            <h1 style={{
                margin: '1rem',
                fontSize: '1.5rem',
                color: '#333',
                borderBottom: '2px solid #6c757d',
                paddingBottom: '0.5rem'
            }}>
                ⚙️ Settings
            </h1>

            <div style={{
                margin: '1rem',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa'
            }}>
                <h3>API Configuration</h3>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Backend API URL:
                    </label>
                    <input
                        type="text"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            width: '300px'
                        }}
                        placeholder="http://localhost:3001"
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Data Refresh Interval (seconds):
                    </label>
                    <input
                        type="number"
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 5)}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            width: '100px'
                        }}
                        min="1"
                        max="60"
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            checked={paperTrading}
                            onChange={(e) => setPaperTrading(e.target.checked)}
                            style={{ transform: 'scale(1.2)' }}
                        />
                        <span style={{ fontWeight: 'bold' }}>Paper Trading Mode</span>
                    </label>
                    <small style={{ color: '#666', marginLeft: '1.7rem' }}>
                        When enabled, all trades are simulated
                    </small>
                </div>

                <button
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                    onClick={() => alert('Settings saved! (Mock save)')}
                >
                    💾 Save Settings
                </button>
            </div>

            <div style={{
                margin: '1rem',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#e9ecef'
            }}>
                <h3>System Information</h3>
                <p><strong>Frontend:</strong> React + TypeScript + Vite</p>
                <p><strong>Backend:</strong> Node.js + Express + TypeScript</p>
                <p><strong>Current API:</strong> {apiUrl}</p>
                <p><strong>Refresh Rate:</strong> {refreshInterval}s</p>
                <p><strong>Trading Mode:</strong> {paperTrading ? '📄 Paper' : '💰 Live'}</p>
            </div>

            <div style={{
                margin: '1rem',
                padding: '1rem',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                backgroundColor: '#fff3cd'
            }}>
                <h3>⚠️ Development Mode</h3>
                <p>This is a development version. Settings are not persisted.</p>
                <p>Interactive Brokers integration is not yet implemented.</p>
            </div>
        </div>
    );
};

export default Settings; 