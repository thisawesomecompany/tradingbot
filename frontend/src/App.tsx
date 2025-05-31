import { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import { DataModeProvider } from './contexts/DataModeContext';
import { DataModeToggle } from './components/DataModeToggle';
import Dashboard from './pages/Dashboard';
import Trading from './pages/Trading';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'trading':
        return <Trading />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataModeProvider>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <Header />
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />

        {/* Prominent Data Mode Toggle */}
        <DataModeToggle />

        <main style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          {renderPage()}
        </main>
      </div>
    </DataModeProvider>
  );
}

export default App;
