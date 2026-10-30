require('dotenv').config();

const list = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);
const isProd = process.env.NODE_ENV === 'production';

const config = {
  isProd,
  port: Number(process.env.PORT || 3000),
  corsOrigins: list(process.env.CORS_ORIGINS),
  internalSecret: process.env.INTERNAL_API_SECRET || '',
  socketAuthMode: process.env.SOCKET_AUTH_MODE || (isProd ? 'laravel' : 'none'),
  laravelApiUrl: (process.env.LARAVEL_API_URL || '').replace(/\/$/, ''),
  laravelAuthEndpoint: process.env.LARAVEL_AUTH_ENDPOINT || '/api/user',
  protectBusinessRoutes: process.env.PROTECT_BUSINESS_ROUTES === 'true',
};

if (isProd && !config.internalSecret) {
  throw new Error('INTERNAL_API_SECRET est obligatoire en production');
}
if (config.socketAuthMode === 'laravel' && !config.laravelApiUrl) {
  throw new Error('SOCKET_AUTH_MODE=laravel nécessite LARAVEL_API_URL');
}

module.exports = Object.freeze(config);
