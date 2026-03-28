require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes    = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const userRoutes    = require('./routes/userRoutes');
const statsRoutes   = require('./routes/statsRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// Define allowed origins with regex pattern for localhost
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    /^http:\/\/localhost:\d+$/, // Allow any localhost port (5173, 5174, 5175, etc.)
].filter(Boolean);

console.log('Allowed Origins:', allowedOrigins);

// Enable CORS with dynamic origin checking
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }
        
        // Check if origin matches any allowed origin
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return allowed === origin;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/stats',    statsRoutes);
app.use('/api/contact',  contactRoutes);

app.get('/', (req, res) => res.json({ message: 'PawMart API v2.0', status: 'running' }));
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

// Connect to MongoDB and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`PawMart server running on port ${PORT}`);
    });
});