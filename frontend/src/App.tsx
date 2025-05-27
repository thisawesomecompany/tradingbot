import React from 'react';
import Header from './components/Header';
import StatusPanel from './components/StatusPanel';
import PositionsPanel from './components/PositionsPanel';
import './App.css'

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <Header />

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <StatusPanel />
        <PositionsPanel />
      </main>
    </div>
  )
}

export default App
