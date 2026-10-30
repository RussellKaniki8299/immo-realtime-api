const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const realtimeRoutes = require('./routes/realtime.routes');
const healthRoutes = require('./routes/health.routes');

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: env.corsOrigins.length ? env.corsOrigins : '*' }));
app.use(express.json({ limit: '1mb' }));

app.use('/api/realtime', realtimeRoutes);
app.use('/api/health', healthRoutes);
app.get('/', (_req, res) => res.send('Realtime server running...'));

module.exports = app;
