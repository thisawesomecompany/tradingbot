"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const api_1 = __importDefault(require("./routes/api"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
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
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// API Routes
app.use('/api', api_1.default);
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
app.use((err, req, res, next) => {
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
exports.default = app;
