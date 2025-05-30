import React from 'react';
import { useDataMode } from '../contexts/DataModeContext';
import styles from './DataModeToggle.module.css';

export const DataModeToggle: React.FC = () => {
    const { mode, setMode, isLive, isSimulated } = useDataMode();

    const handleModeChange = (newMode: 'live' | 'simulated') => {
        if (newMode === 'live') {
            // Show confirmation for live mode
            const confirmed = window.confirm(
                '⚠️ WARNING: You are switching to LIVE DATA mode.\n\n' +
                'This will:\n' +
                '• Use real market data\n' +
                '• Connect to live trading systems\n' +
                '• May execute real trades if automation is enabled\n\n' +
                'Are you sure you want to continue?'
            );
            if (!confirmed) return;
        }
        setMode(newMode);
    };

    return (
        <div className={styles.dataModeToggle}>
            <div className={styles.modeIndicator}>
                <div className={`${styles.modeStatus} ${isLive ? styles.live : styles.simulated}`}>
                    <div className={styles.modeIcon}>
                        {isLive ? '🔴' : '🟡'}
                    </div>
                    <div className={styles.modeText}>
                        <div className={styles.modeLabel}>
                            {isLive ? 'LIVE DATA' : 'SIMULATED'}
                        </div>
                        <div className={styles.modeDescription}>
                            {isLive ? 'Real market data & trading' : 'Demo mode - safe testing'}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.modeControls}>
                <button
                    onClick={() => handleModeChange('simulated')}
                    className={`${styles.modeButton} ${isSimulated ? styles.active : ''}`}
                    disabled={isSimulated}
                >
                    🟡 Simulated
                </button>
                <button
                    onClick={() => handleModeChange('live')}
                    className={`${styles.modeButton} ${styles.liveButton} ${isLive ? styles.active : ''}`}
                    disabled={isLive}
                >
                    🔴 Live Data
                </button>
            </div>
        </div>
    );
}; 