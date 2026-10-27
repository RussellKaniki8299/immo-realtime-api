const { Server } = require('socket.io');

const env = require('./env');
const socketAuth = require('../middleware/socketAuth');
const ordersSocket = require('../sockets/orders.socket');
const chatSocket = require('../sockets/chat.socket');
const callSocket = require('../sockets/call.socket');

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: env.corsOrigins.length ? env.corsOrigins : '*',
      methods: ['GET', 'POST'],
    },
  });

  global.io = io;
  global.connectedAgents = {};
  global.connectedAdmins = [];

  io.use(socketAuth);

  io.on('connection', (socket) => {
    // ----- Modules messagerie & appels (nouveaux) -----
    chatSocket(io, socket);
    callSocket(io, socket);

    // ----- Rooms métier existantes (inchangées) -----
    socket.on('join_client', (clientId) => socket.join(`client_${clientId}`));

    socket.on('join_admin', (admin) => {
      socket.join('admins');
      if (!global.connectedAdmins.find((a) => a.userId === admin.userId)) {
        global.connectedAdmins.push({ ...admin, socketId: socket.id });
      }
    });

    socket.on('join_agence', (agenceId) => socket.join(`agence_${agenceId}`));

    socket.on('join_agence_agent', ({ agenceId, userId, nom, role }) => {
      socket.join(`agence_agents_${agenceId}`);
      global.connectedAgents[agenceId] = global.connectedAgents[agenceId] || [];
      if (!global.connectedAgents[agenceId].find((a) => a.userId === userId)) {
        global.connectedAgents[agenceId].push({ userId, nom, role, socketId: socket.id });
      }
    });

    socket.on('join_agence_kitchen', (agenceId) => socket.join(`agence_kitchen_${agenceId}`));

    ordersSocket(io, socket);

    socket.on('disconnect', () => {
      Object.keys(global.connectedAgents).forEach((agenceId) => {
        global.connectedAgents[agenceId] = global.connectedAgents[agenceId].filter(
          (agent) => agent.socketId !== socket.id
        );
      });
      global.connectedAdmins = global.connectedAdmins.filter((a) => a.socketId !== socket.id);
    });
  });
};
