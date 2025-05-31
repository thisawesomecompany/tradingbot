import { useApiData } from '../hooks/useApi';
import api, { type TradingStatus } from '../services/api';

export function StatusPanel() {
    const { data: status, loading, error } = useApiData<TradingStatus>(
        api.getTradingStatus,
        []
    );

    const formatCurrency = (amount: number | undefined): string => {
        if (amount === undefined) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatPnL = (pnl: number | undefined): string => {
        if (pnl === undefined) return 'N/A';
        const formatted = formatCurrency(Math.abs(pnl));
        return pnl >= 0 ? `+${formatted}` : `-${formatted}`;
    };

    const getPnLColor = (pnl: number | undefined): string => {
        if (pnl === undefined) return '#666';
        return pnl >= 0 ? '#28a745' : '#dc3545';
    };

    const getConnectionStatusColor = (connected: boolean): string => {
        return connected ? '#28a745' : '#dc3545';
    };

    const getMarketStatusColor = (market: string): string => {
        return market === 'open' ? '#28a745' : '#ffc107';
    };

    if (loading) {
        return (
            <div style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa'
            }}>
                <h3>📊 Trading Status</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #f3f3f3',
                        borderTop: '2px solid #007bff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Loading status...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa'
            }}>
                <h3>📊 Trading Status</h3>
                <div style={{ color: '#dc3545' }}>
                    ⚠️ Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            padding: '1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
        }}>
            <h3>📊 Trading Status</h3>

            {status && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    {/* Connection Status */}
                    <div style={{
                        padding: '10px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px solid #eee'
                    }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Connection</div>
                        <div style={{
                            fontWeight: 'bold',
                            color: getConnectionStatusColor(status.connection.ib === 'connected'),
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: getConnectionStatusColor(status.connection.ib === 'connected')
                            }}></span>
                            {status.connection.ib === 'connected' ? 'Connected' : 'Disconnected'}
                        </div>
                        {status.connection.error && (
                            <div style={{ fontSize: '11px', color: '#dc3545', marginTop: '5px' }}>
                                {status.connection.error}
                            </div>
                        )}
                    </div>

                    {/* Market Status */}
                    <div style={{
                        padding: '10px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px solid #eee'
                    }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Market</div>
                        <div style={{
                            fontWeight: 'bold',
                            color: getMarketStatusColor(status.market),
                            textTransform: 'capitalize'
                        }}>
                            {status.market === 'open' ? '🟢' : '🟡'} {status.market}
                        </div>
                    </div>

                    {/* Account Value */}
                    {status.trading.accountValue !== undefined && (
                        <div style={{
                            padding: '10px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #eee'
                        }}>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Account Value</div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                                {formatCurrency(status.trading.accountValue)}
                            </div>
                        </div>
                    )}

                    {/* Day P&L */}
                    {status.trading.dayPnL !== undefined && (
                        <div style={{
                            padding: '10px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #eee'
                        }}>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Day P&L</div>
                            <div style={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                color: getPnLColor(status.trading.dayPnL)
                            }}>
                                {formatPnL(status.trading.dayPnL)}
                            </div>
                        </div>
                    )}

                    {/* Buying Power */}
                    {status.trading.buyingPower !== undefined && (
                        <div style={{
                            padding: '10px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #eee'
                        }}>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Buying Power</div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                                {formatCurrency(status.trading.buyingPower)}
                            </div>
                        </div>
                    )}

                    {/* Open Orders */}
                    {status.trading.openOrders !== undefined && (
                        <div style={{
                            padding: '10px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            border: '1px solid #eee'
                        }}>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Open Orders</div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                                {status.trading.openOrders}
                            </div>
                        </div>
                    )}

                    {/* Trading Strategy */}
                    <div style={{
                        padding: '10px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px solid #eee'
                    }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Strategy</div>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>
                            {status.trading.strategy}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                            Risk: {status.trading.riskLevel}
                        </div>
                    </div>

                    {/* Trading Status */}
                    <div style={{
                        padding: '10px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px solid #eee'
                    }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Trading</div>
                        <div style={{
                            fontWeight: 'bold',
                            color: status.trading.enabled ? '#28a745' : '#dc3545'
                        }}>
                            {status.trading.enabled ? '✅ Enabled' : '❌ Disabled'}
                        </div>
                    </div>
                </div>
            )}

            <div style={{
                marginTop: '15px',
                paddingTop: '10px',
                borderTop: '1px solid #ddd',
                fontSize: '12px',
                color: '#666'
            }}>
                Last updated: {status ? new Date(status.connection.lastUpdate).toLocaleTimeString() : 'N/A'}
            </div>
        </div>
    );
} 