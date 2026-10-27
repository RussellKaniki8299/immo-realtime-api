const list = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);

module.exports = {
  port: Number(process.env.PORT || 3000),
  corsOrigins: list(process.env.CORS_ORIGINS),
  internalSecret: process.env.INTERNAL_API_SECRET || '',
  socketAuthMode: process.env.SOCKET_AUTH_MODE || 'none',
  laravelApiUrl: (process.env.LARAVEL_API_URL || '').replace(/\/$/, ''),
  laravelAuthEndpoint: process.env.LARAVEL_AUTH_ENDPOINT || '/api/user',
};
