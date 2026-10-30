const { Server } = require('socket.io');
const env = require('../config/env');
const registry = require('../state/registry');
const socketAuth = require('../middleware/socketAuth');
const chatSocket = require('./chat.socket');
const callSocket = require('./call.socket');
const ordersSocket = require('./orders.socket');

/** Attache Socket.IO au serveur HTTP. */
function attachSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.corsOrigins.length ? env.corsOrigins : '*', methods: ['GET', 'POST'] },
    pingInterval: 20000,
    pingTimeout: 25000,
    maxHttpBufferSize: 1e6, // 1 Mo : suffisant pour une offre SDP, bloque les messages abusifs
  });
  registry.setIo(io);
  io.use(socketAuth);

  io.on('connection', (socket) => {
    // ── Messagerie & appels
    chatSocket(io, socket);
    callSocket(io, socket);

    // ── Rooms métier. En mode "laravel", un client ne peut écouter que SES propres commandes.
    socket.on('join_client', (clientId) => {
      if (socket.data.authenticated && Number(clientId) !== socket.data.userId) return;
      socket.join(`client_${clientId}`);
    });
    socket.on('join_admin', (admin = {}) => {
      socket.join('admins');
      registry.addAdmin({ ...admin, socketId: socket.id });
    });
    socket.on('join_agence', (agenceId) => socket.join(`agence_${agenceId}`));
    socket.on('join_agence_agent', ({ agenceId, userId, nom, role } = {}) => {
      if (!agenceId) return;
      socket.join(`agence_agents_${agenceId}`);
      registry.addAgent(agenceId, { userId, nom, role, socketId: socket.id });
    });
    socket.on('join_agence_kitchen', (agenceId) => socket.join(`agence_kitchen_${agenceId}`));

    ordersSocket(io, socket);

    socket.on('disconnect', () => registry.removeSocket(socket.id));
  });

  return io;
}

module.exports = { attachSocketServer };
