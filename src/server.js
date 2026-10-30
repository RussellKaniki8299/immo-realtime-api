const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { attachSocketServer } = require('./sockets');
const logger = require('./lib/logger')('server');

const server = http.createServer(app);
const io = attachSocketServer(server);

server.listen(env.port, '0.0.0.0', () => logger.info(`Realtime server prêt sur le port ${env.port} (auth sockets : ${env.socketAuthMode})`));

const shutdown = (signal) => {
  logger.info(`${signal} reçu, arrêt en cours…`);
  io.close(() => server.close(() => process.exit(0)));
  setTimeout(() => process.exit(1), 10000).unref();
};
['SIGINT', 'SIGTERM'].forEach((s) => process.on(s, () => shutdown(s)));
process.on('unhandledRejection', (r) => logger.error('unhandledRejection', String(r)));
