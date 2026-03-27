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

const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000',
].filter(Boolean);

console.log('Allowed Origins:', allowedOrigins);

// Enable CORS
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

// Handle preflight requests
app.options('*', cors({
    origin: allowedOrigins,
    credentials: true,
}));

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