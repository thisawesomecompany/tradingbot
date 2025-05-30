import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow any localhost port (for development)
        if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
            return callback(null, true);
        }

        // Allow specific production domains if needed
        const allowedOrigins = [
            'http://localhost:3000',
            // Add production domains here when deployed
        ];

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Reject other origins
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api', apiRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'Tactical Trader API',
        version: '1.0.0',
        endpoints: [
            '/api/health',
            '/api/trading/status',
            '/api/trading/positions'
        ]
    });
});

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`${new Date().toISOString()} - Error:`, err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Tactical Trader Backend running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app; 