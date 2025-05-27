import React from 'react';

interface NavigationProps {
    currentPage: string;
    onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
    const pages = [
        { id: 'dashboard', label: '📊 Dashboard', color: '#007bff' },
        { id: 'trading', label: '💰 Trading', color: '#28a745' },
        { id: 'settings', label: '⚙️ Settings', color: '#6c757d' }
    ];

    return (
        <nav style={{
            backgroundColor: '#f8f9fa',
            borderBottom: '2px solid #dee2e6',
            padding: '0.5rem 1rem',
            display: 'flex',
            gap: '0.5rem'
        }}>
            {pages.map(page => (
                <button
                    key={page.id}
                    onClick={() => onPageChange(page.id)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        backgroundColor: currentPage === page.id ? page.color : '#e9ecef',
                        color: currentPage === page.id ? 'white' : '#495057',
                        transition: 'all 0.2s ease',
                        transform: currentPage === page.id ? 'translateY(-2px)' : 'none',
                        boxShadow: currentPage === page.id ? '0 4px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                        if (currentPage !== page.id) {
                            e.currentTarget.style.backgroundColor = '#dee2e6';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (currentPage !== page.id) {
                            e.currentTarget.style.backgroundColor = '#e9ecef';
                        }
                    }}
                >
                    {page.label}
                </button>
            ))}
        </nav>
    );
};

export default Navigation; 