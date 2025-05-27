import React from 'react';
import { useTradingStatus } from '../hooks/useApi';

const StatusPanel: React.FC = () => {
    const { data: status, loading, error } = useTradingStatus();

    if (loading) {
        return (
            <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '1.5rem',
                margin: '1rem',
                textAlign: 'center'
            }}>
                <p>Loading trading status...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                padding: '1.5rem',
                margin: '1rem'
            }}>
                <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#333' }}>
                    Trading Status
                </h2>
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#f8d7da',
                    borderRadius: '6px',
                    border: '1px solid #f5c6cb',
                    color: '#721c24'
                }}>
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '1.5rem',
            margin: '1rem'
        }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#333' }}>
                Trading Status
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
            }}>
                <div style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                        Connection Status
                    </h3>
                    <p style={{
                        margin: 0,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: status?.connection.ib === 'connected' ? '#28a745' : '#dc3545'
                    }}>
                        {status?.connection.ib || 'Unknown'}
                    </p>
                </div>

                <div style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                        Account Type
                    </h3>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#28a745' }}>
                        {status?.account || 'Unknown'}
                    </p>
                </div>

                <div style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                        Strategy
                    </h3>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#007bff' }}>
                        {status?.trading.strategy || 'Unknown'}
                    </p>
                </div>

                <div style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                        Risk Level
                    </h3>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#ffc107' }}>
                        {status?.trading.riskLevel || 'Unknown'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StatusPanel; 