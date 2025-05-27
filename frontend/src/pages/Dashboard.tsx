import React from 'react';
import StatusPanel from '../components/StatusPanel';
import PositionsPanel from '../components/PositionsPanel';

const Dashboard: React.FC = () => {
    return (
        <div>
            <h1 style={{
                margin: '1rem',
                fontSize: '1.5rem',
                color: '#333',
                borderBottom: '2px solid #007bff',
                paddingBottom: '0.5rem'
            }}>
                📊 Dashboard
            </h1>
            <StatusPanel />
            <PositionsPanel />
        </div>
    );
};

export default Dashboard; 