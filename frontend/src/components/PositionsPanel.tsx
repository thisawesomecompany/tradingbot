import React from 'react';
import { usePositions } from '../hooks/useApi';

const PositionsPanel: React.FC = () => {
    const { data: positions, loading, error } = usePositions();

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
                <p>Loading positions...</p>
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
                    Account & Positions
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
                Account & Positions
            </h2>

            {/* Account Summary */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#666' }}>
                        Cash Balance
                    </h3>
                    <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: '#28a745' }}>
                        ${positions?.cash.toLocaleString() || '0'}
                    </p>
                </div>

                <div style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#666' }}>
                        Total Value
                    </h3>
                    <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: '#007bff' }}>
                        ${positions?.totalValue.toLocaleString() || '0'}
                    </p>
                </div>

                <div style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#666' }}>
                        Day P&L
                    </h3>
                    <p style={{
                        margin: 0,
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        color: (positions?.dayPnL || 0) >= 0 ? '#28a745' : '#dc3545'
                    }}>
                        ${positions?.dayPnL.toFixed(2) || '0.00'}
                    </p>
                </div>

                <div style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#666' }}>
                        Total P&L
                    </h3>
                    <p style={{
                        margin: 0,
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        color: (positions?.totalPnL || 0) >= 0 ? '#28a745' : '#dc3545'
                    }}>
                        ${positions?.totalPnL.toFixed(2) || '0.00'}
                    </p>
                </div>
            </div>

            {/* Positions Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e9ecef',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #e9ecef',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                }}>
                    Current Positions
                </div>
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#6c757d',
                    fontSize: '0.9rem'
                }}>
                    No open positions
                </div>
            </div>
        </div>
    );
};

export default PositionsPanel; 