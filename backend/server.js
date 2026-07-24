require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.json({ status: 'ok', service: 'LeadDesk API' }));

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`LeadDesk API running on port ${PORT}`));