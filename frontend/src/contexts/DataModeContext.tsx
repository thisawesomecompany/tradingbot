import React, { createContext, useContext, useState, useEffect } from 'react';

export type DataMode = 'live' | 'simulated';

interface DataModeContextType {
    mode: DataMode;
    setMode: (mode: DataMode) => void;
    isLive: boolean;
    isSimulated: boolean;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

export const useDataMode = () => {
    const context = useContext(DataModeContext);
    if (context === undefined) {
        throw new Error('useDataMode must be used within a DataModeProvider');
    }
    return context;
};

interface DataModeProviderProps {
    children: React.ReactNode;
}

export const DataModeProvider: React.FC<DataModeProviderProps> = ({ children }) => {
    const [mode, setMode] = useState<DataMode>('simulated'); // Default to simulated for safety

    // Load mode from localStorage on mount
    useEffect(() => {
        const savedMode = localStorage.getItem('tradingbot-data-mode') as DataMode;
        if (savedMode === 'live' || savedMode === 'simulated') {
            setMode(savedMode);
        }
    }, []);

    // Save mode to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('tradingbot-data-mode', mode);
        console.log(`🔄 Data mode switched to: ${mode.toUpperCase()}`);
    }, [mode]);

    const value: DataModeContextType = {
        mode,
        setMode,
        isLive: mode === 'live',
        isSimulated: mode === 'simulated'
    };

    return (
        <DataModeContext.Provider value={value}>
            {children}
        </DataModeContext.Provider>
    );
}; 